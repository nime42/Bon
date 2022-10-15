const { callbackify } = require('util');

module.exports = class OtherBonsHandler {

    constructor(config,localDb) {
        this.local=localDb;
        var path = require('path');
        var DBClass=require('./DBClass.js');
        var GrocyFunctionsClass=require('./GrocyFunctionsClass.js');
        let grocy=new GrocyFunctionsClass(config);
        this.bonInstances={};
        this.bonInstances[config.bonPrefix]={
            db:localDb,
            config:config,
            grocy:grocy
        }
        config.otherBons && config.otherBons.forEach(f=>{
            let conf=require(f);
            //console.log(conf);
            let dbFile=path.dirname(f)+"/bon.db";
            let db=new DBClass(dbFile);
            let grocy=new GrocyFunctionsClass(conf);
            this.bonInstances[conf.bonPrefix]={
                db:db,
                config:conf,
                grocy:grocy
            }
        });

    }

    getBonsForWeek(mondayDate) {
        let before=new Date();
        before.setTime(mondayDate.getTime()+6*(24*3600*1000));
        let searchParams={
            afterDate:mondayDate.toISOString().split('T')[0],
            beforeDate:before.toISOString().split('T')[0]
        }
        let res=[];
        Object.keys(this.bonInstances).forEach(k=>{
            let db=this.bonInstances[k].db;
            let bons=db.searchBons(searchParams,true,null);
            let prefix=this.bonInstances[k].config.bonPrefix;
            let instance=this.bonInstances[k].config.bonInstance;
            bons.forEach(b=>{
                b.id=prefix+"-"+b.id;
            })
            res.push({
                bons,prefix,instance
            })
        });
        return res;
    } 

    checkStock(callback=console.log) {
        let after=new Date().toISOString().split('T')[0];
        let searchParams={
            afterDate:after,
            status: "new,needInfo,approved,preparing"
        }
        let res=[];
        let nrOfInstances=Object.keys(this.bonInstances).length;
        Object.keys(this.bonInstances).forEach(k=>{
            let db=this.bonInstances[k].db;
            let bons=db.searchBons(searchParams,true,null);
            let prefix=this.bonInstances[k].config.bonPrefix;
            let instance=this.bonInstances[k].config.bonInstance;
            this.bonInstances[k].grocy.checkBonsAgainstStock(bons,(status,bonsWithStock)=>{
                if(status) {
                    bonsWithStock.forEach(b=>{
                        b.id=prefix+"-"+b.id;
                    })
                    res.push({
                        bons:bonsWithStock,prefix,instance
                    })
                } else {
                    res.push({
                        bons:bons,prefix,instance
                    })
                    console.log("Failed to check agains stock for instance "+instance);
                }
                if(res.length===nrOfInstances) {
                    callback(true,res);
                }


            });
            
        });

    }

    searchBons(prefix,searchParams, includeOrders, callback = console.log) {
        let res=[];
        let instances=[];
        if(prefix==="*") {
            instances=Object.keys(this.bonInstances)
        } else {
            instances=[prefix];
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


}