class BonWall {
    background = Globals.background;
    foreground = Globals.foreground;
    shadowColor = Globals.shadowColor;


    content = `
    <div class="bon-container">
        <div class="zoom-controls" style="margin-bottom: 10px;">
        <i id="zoomIn" class="fa fa-search-plus zoom-btn"></i>
        <i id="zoomOut" class="fa fa-search-minus zoom-btn"></i>
        </div>
        <div id="bons" class="bon-row">
        </div>
    </div>

    `

    constructor(div, statusFilter) {

        if (typeof div === "string") {
            this.myDiv = document.querySelector(div);
        } else {
            this.myDiv = div;
        }
        this.statusFilter = statusFilter;
        this.myDiv.innerHTML = this.content;
        this.bonRow = this.myDiv.querySelector("#bons");
        this.myBonRepo = new BonRepository();

        this.myDiv.querySelector("#zoomIn").onclick = () => this.zoom(1);
        this.myDiv.querySelector("#zoomOut").onclick = () => this.zoom(-1);

    }
    currentZoom = 100;
    currentFontSize = 14;
    zoom(delta) {
        this.currentFontSize = Math.min(Math.max(this.currentFontSize + delta, 5), 20);
        this.bonRow.style.fontSize = this.currentFontSize + "px";
        // Apply scaling to each bon-column
        const scale = this.currentZoom / 100.0;

        this.bonRow.childNodes.forEach(c => {
            c.style.scale = scale.toString();
            c.style.transformOrigin = 'top left';
            // Adjust the flex basis and margin to allow more columns per row
            c.style.flexBasis = `20%`;
            //c.style.marginRight = `${scale * 5}px`;
            //c.style.marginBottom = `${scale * 10}px`;
        });
    }


    addBon(bon, orders, editable, options) {
        let col = document.createElement("div");
        col.classList.add("bon-column");
        col.style.cssText = `
        flex: 0 0 auto;
        margin-right: 5px;
        margin-bottom: 10px;
        `
        let bs = new BonStrip(col, editable, options);
        bs.showMails();
        bs.initFromBon(bon, orders);
        this.bonRow.appendChild(col);
        return [bs, col];
    }

    getBonsForToday() {
        this.bonRow.innerHTML = "";
        let today = new Date();
        let todayStr = today.toISOString().split('T')[0];
        let tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);
        let tomorrowStr = tomorrow.toISOString().split('T')[0];
        let self = this;
        Globals.myConfig.myRepo.searchBons({ afterDate: todayStr, beforeDate: todayStr, status: this.statusFilter.join(","), includeOrders: true }, (bons) => {
            bons.forEach(b => {
                let [bonStrip, colElem] = self.addBon(b, b.orders, true);
                bonStrip.setOnUpdateOrder(() => {
                    bonStrip.saveOrders();
                });
                bonStrip.hidePrices();
                bonStrip.addStatuses(["preparing", "done", "delivered"], (status, onOff) => {
                    if (this.cancelFunction) {
                        this.cancelFunction();
                    }
                    if (status == "preparing" && onOff == "off") {
                        status = "approved";
                    }
                    if (status == "delivered" && onOff == "on") {
                        if (bonStrip.getPaymentType() == "Kontant") {
                            status = "payed";
                        } else if (bonStrip.getPaymentType() == "Produktion") {
                            status = "closed"
                        }
                        this._fadeout(colElem, bonStrip.bonId, status, (id) => {
                            self.myBonRepo.consumeBon(bonStrip.bonId);
                        });
                    } else {
                        Globals.myConfig.myRepo.updateBonStatus(bonStrip.bonId, status, (status) => { });
                    }

                });
            })
        })

    }


    getBonsForInvoice() {
        this.bonRow.innerHTML = "";
        let today = new Date();
        let todayStr = today.toISOString().split('T')[0];
        let tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);
        let tomorrowStr = tomorrow.toISOString().split('T')[0];
        let self = this;
        Globals.myConfig.myRepo.searchBons({ status: this.statusFilter.join(","), includeOrders: true }, (bons) => {
            bons.forEach(b => {
                let [bonStrip, colElem] = self.addBon(b, b.orders, true, { showInvoiceInfo: true });
                bonStrip.setOnUpdateOrder(() => {
                    bonStrip.saveOrders();
                });

                bonStrip.addStatuses(["invoiced"], (status, onOff) => {
                    if (this.cancelFunction) {
                        this.cancelFunction();
                    }

                    if (status == "invoiced" && onOff == "on") {
                        this._fadeout(colElem, bonStrip.bonId, "invoiced");
                    }

                }, "Husk miljøgebyr");
            })
        })

    }



    getFutureBons() {
        this.bonRow.innerHTML = "";
        let today = new Date();
        let todayStr = today.toISOString().split('T')[0];
        let tomorrow = new Date(); tomorrow.setDate(today.getDate() + 0);
        let tomorrowStr = tomorrow.toISOString().split('T')[0];
        let self = this;
        Globals.myConfig.myRepo.searchBons({ afterDate: todayStr, status: this.statusFilter.join(","), includeOrders: true }, (bons) => {
            bons.forEach(b => {
                let [bonStrip, colElem] = self.addBon(b, b.orders, true);
                bonStrip.setOnUpdateOrder(() => {
                    bonStrip.saveOrders();
                });
                bonStrip.hidePrices();

            })
        })

    }



    _fadeout(elem, id, status, onfaded) {
        let t = 3;
        let orgStyle = elem.style.cssText;
        let style = `
            visibility: hidden;
            opacity: 0;
            transition: visibility 0s ${t}s, opacity ${t}s linear;      
        `;
        elem.style.cssText += style;

        let timer = setTimeout(() => {
            Globals.myConfig.myRepo.updateBonStatus(id, status, (status) => { });
            elem.remove();
            onfaded && onfaded(id);
        }, t * 1000);

        this.cancelFunction = () => {
            clearTimeout(timer);
            elem.style.cssText = orgStyle;
            this.cancelFunction = undefined;
        }

    }







}