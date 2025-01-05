const { callbackify } = require('util');

module.exports = class OtherBonsHandler {

    constructor(config, localDb, grocy) {
        this.local = localDb;
        this.defaultBonPrefix = config.bonPrefix;
        var path = require('path');
        var DBClass = require('./DBClass.js');
        var GrocyFunctions = require('./GrocyFunctions.js');
        this.bonInstances = {};
        this.bonInstances[config.bonPrefix] = {
            db: localDb,
            config: config,
            grocy: grocy
        }

        var AddressFunctions = require('./AddressFunctions.js');
        var AddressSearch = new AddressFunctions(config);

        config.otherBons && config.otherBons.forEach(f => {
            let conf = require(f);
            //console.log(conf);
            let dbFile = path.dirname(f) + "/bon.db";
            let db = new DBClass(dbFile);
            db.useAddressLookUp(AddressSearch);
            let grocy = new GrocyFunctions(conf);
            this.bonInstances[conf.bonPrefix] = {
                db: db,
                config: conf,
                grocy: grocy
            }
        });

    }

    getAllInstances() {
        return this.bonInstances;
    }

    getBonsForWeek(mondayDate) {
        let before = new Date();
        before.setTime(mondayDate.getTime() + 6 * (24 * 3600 * 1000));
        let searchParams = {
            afterDate: mondayDate.toISOString().split('T')[0],
            beforeDate: before.toISOString().split('T')[0]
        }
        let res = [];
        Object.keys(this.bonInstances).forEach(k => {
            let db = this.bonInstances[k].db;
            let bons = db.searchBons(searchParams, true, null);
            let prefix = this.bonInstances[k].config.bonPrefix;
            let instance = this.bonInstances[k].config.bonInstance;
            bons.forEach(b => {
                b.id = prefix + "-" + b.id;
            })
            res.push({
                bons, prefix, instance
            })
        });
        return res;
    }

    checkStock(callback = console.log) {
        let after = new Date().toISOString().split('T')[0];
        let searchParams = {
            afterDate: after,
            status: "new,needInfo,approved,preparing"
        }
        let res = [];
        let nrOfInstances = Object.keys(this.bonInstances).length;
        Object.keys(this.bonInstances).forEach(k => {
            let db = this.bonInstances[k].db;
            let bons = db.searchBons(searchParams, true, null);
            let prefix = this.bonInstances[k].config.bonPrefix;
            let instance = this.bonInstances[k].config.bonInstance;
            this.bonInstances[k].grocy.checkBonsAgainstStock(bons, (status, bonsWithStock) => {
                if (status) {
                    bonsWithStock.forEach(b => {
                        b.id = prefix + "-" + b.id;
                    })
                    res.push({
                        bons: bonsWithStock, prefix, instance
                    })
                } else {
                    res.push({
                        bons: bons, prefix, instance
                    })
                    console.log("Failed to check agains stock for instance " + instance);
                }
                if (res.length === nrOfInstances) {
                    callback(true, res);
                }


            });

        });

    }

    searchBons(prefix, searchParams, includeOrders, callback = console.log) {
        let res = [];
        let instances = [];
        if (prefix === "*") {
            instances = Object.keys(this.bonInstances)
        } else {
            instances = [prefix];
        }

        instances.forEach((k) => {
            if (this.bonInstances[k] != undefined) {
                let db = this.bonInstances[k].db;
                let bons = db.searchBons(searchParams, includeOrders, null);
                let prefix = this.bonInstances[k].config.bonPrefix;
                bons.forEach((b) => {
                    b.id = prefix + "-" + b.id;
                    b.prefix = prefix;
                });
                res.push(...bons);
            }
        });

        if (callback === null) {
            return res;
        } else {
            callback(true, res);
        }
    }

    getGrocyProductsForOrders(bonId, orders, callback) {
        bonId = bonId + "";
        let prefix = this.defaultBonPrefix;
        let parts = bonId.split("-");
        if (parts.length === 2) {
            bonId = parts[1];
            prefix = parts[0];
        }
        let bonInstance = this.bonInstances[prefix];

        bonInstance.db.complementWithGrocyIds(orders, (status, orders) => {
            if (status) {
                bonInstance.grocy.getCurrentStock((status, stock) => {
                    orders.forEach(o => {
                        bonInstance.grocy.addStockInfo(o.external_id, stock);
                        o.numberInStock = bonInstance.grocy.calculateNumberInStock(o.external_id);
                        o.ingredients = bonInstance.grocy.getIngredients(o.external_id);
                    })
                    callback(true, orders);
                })

            } else {
                callback(false, orders)
            }
        });

    }

    moveBon(bonId, toInstancePrefix, force, callback) {
        bonId = bonId + "";
        let prefix = this.defaultBonPrefix;
        let parts = bonId.split("-");
        if (parts.length === 2) {
            bonId = parts[1];
            prefix = parts[0];
        }
        let fromBonInstance = this.bonInstances[prefix];
        let toBonInstance = this.bonInstances[toInstancePrefix];

        let newOrders = [];
        let missing = [];


        let [bon] = fromBonInstance.db.searchBons({ bonId: bonId }, true, null);
        let orders = bon.orders;

        let toItems = toBonInstance.db.getItems(null);
        orders.forEach(o => {
            let item = toItems.find(i => (i.name === o.name && i.category === o.category))
            if (item) {
                newOrders.push({ ...o, id: item.id, external_id: item.external_id, comment: o.special_request })
            } else {
                missing.push(o);
            }
        })
        bon.orders = newOrders;
        let newBonId = toBonInstance.db.createBon(bon, null);
        fromBonInstance.db.delBon(bonId, null);
        callback(true, {
            newBon: {
                bonId: newBonId,
                prefix: toInstancePrefix
            },
            oldBon: {
                bonId: bonId,
                prefix: prefix
            }
        });
    }

}