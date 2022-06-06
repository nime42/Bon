class BonWall {
    background=Globals.background;
    foreground=Globals.foreground;
    shadowColor=Globals.shadowColor;


    content=`
    <div class="bon-container">
    <div id="bons" class="bon-row">
    </div>
    </div>

    `
        
    constructor(div,statusFilter) {

        if(typeof div==="string") {
            this.myDiv = document.querySelector(div);
        } else {
            this.myDiv=div;
        }
        this.statusFilter=statusFilter;
        this.myDiv.innerHTML = this.content;
        this.bonRow=this.myDiv.querySelector("#bons");
        this.myBonRepo=new BonRepository();
    }



    addBon(bon,orders,editable) {
        let col=document.createElement("div");
        col.classList.add("bon-column");
        col.style.cssText=`
        margin-right: 10px;
        margin-bottom: 15px;
        `
        let bs=new BonStrip(col,editable);
        bs.initFromBon(bon,orders);
        this.bonRow.appendChild(col);
        return [bs,col];
    }

    getBonsForToday() {
        this.bonRow.innerHTML="";
        let today = new Date();
        let todayStr = today.toISOString().split('T')[0];
        let tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);
        let tomorrowStr = tomorrow.toISOString().split('T')[0];
        let self = this;
        Globals.myConfig.myRepo.searchBons({  beforeDate: todayStr,status:this.statusFilter.join(","),includeOrders:true }, (bons) => {
            bons.forEach(b => {
                let [bonStrip,colElem]=self.addBon(b, b.orders,true);
                bonStrip.setOnUpdateOrder(()=>{
                    bonStrip.saveOrders();
                });
                bonStrip.hidePrices();
                bonStrip.addStatuses(["preparing","done","delivered"],(status,onOff)=>{
                    if(this.cancelFunction) {
                        this.cancelFunction();
                    }
                    if(status=="preparing" && onOff=="off") {
                        status="approved";
                    }
                    if(status=="delivered" && onOff=="on") {
                        this._fadeout(colElem,bonStrip.bonId,"delivered",(id)=>{
                            self.myBonRepo.consumeBon(bonStrip.bonId);
                        });
                    } else {
                        Globals.myConfig.myRepo.updateBonStatus(bonStrip.bonId,status,(status)=>{});
                    }
                    
                });
            })
        })

    }


    getBonsForInvoice() {
        this.bonRow.innerHTML="";
        let today = new Date();
        let todayStr = today.toISOString().split('T')[0];
        let tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);
        let tomorrowStr = tomorrow.toISOString().split('T')[0];
        let self = this;
        Globals.myConfig.myRepo.searchBons({status:this.statusFilter.join(","),includeOrders:true }, (bons) => {
            bons.forEach(b => {
                let [bonStrip,colElem]=self.addBon(b, b.orders,true);
                bonStrip.setOnUpdateOrder(()=>{
                    bonStrip.saveOrders();
                });

                bonStrip.addStatuses(["invoiced"],(status,onOff)=>{
                    if(this.cancelFunction) {
                        this.cancelFunction();
                    }

                    if(status=="invoiced" && onOff=="on") {
                        this._fadeout(colElem,bonStrip.bonId,"invoiced");
                    }
                    
                });
            })
        })

    }



    getFutureBons() {
        this.bonRow.innerHTML="";
        let today = new Date();
        let todayStr = today.toISOString().split('T')[0];
        let tomorrow = new Date(); tomorrow.setDate(today.getDate() + 0);
        let tomorrowStr = tomorrow.toISOString().split('T')[0];
        let self = this;
        Globals.myConfig.myRepo.searchBons({ afterDate: tomorrowStr,status:this.statusFilter.join(","),includeOrders:true }, (bons) => {
            bons.forEach(b => {
                let [bonStrip,colElem]=self.addBon(b, b.orders,true);
                bonStrip.setOnUpdateOrder(()=>{
                    bonStrip.saveOrders();
                });
                bonStrip.hidePrices();
                
            })
        })

    }



    _fadeout(elem,id,status,onfaded) {
        let t=3;
        let orgStyle=elem.style.cssText;
        let style=`
            visibility: hidden;
            opacity: 0;
            transition: visibility 0s ${t}s, opacity ${t}s linear;      
        `;
        elem.style.cssText+=style;

        let timer=setTimeout(()=>{
            Globals.myConfig.myRepo.updateBonStatus(id,status,(status)=>{});
            elem.remove();
            onfaded && onfaded(id);
        }, t*1000);

        this.cancelFunction=() => {
            clearTimeout(timer);
            elem.style.cssText=orgStyle;
            this.cancelFunction=undefined;
        }
    
    }






  
}