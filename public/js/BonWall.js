class BonWall {
    background=Globals.background;
    foreground=Globals.foreground;
    shadowColor=Globals.shadowColor;


    content=`
    <div id=status-row style="padding: 10px; border: 2px solid ${this.foreground};border-radius:3px 3px">
    $STATUSBUTTONS$
    </div>
    <div class="bon-item"/>
    `
        
    constructor(div,startStatus,statusFilter,statusButtons) {
        this._createStatusRow(statusButtons);
        this.startStatus=startStatus;
        this.endStatus=statusButtons[statusButtons.length-1];
        this.statusFilter=statusFilter;
        this.statusFilter.push(startStatus);
        let parent;
        if(typeof div==="string") {
            parent=document.querySelector(div);
        } else {
            parent=div;
        }

        this.myDiv=document.createElement("div");
        this.myDiv.classList.add("bon-wall");
        this.myDiv.style.cssText=`display: flex;flex-wrap: wrap; background:${this.background};width:100%;height: 100%;margin-top: 10%;margin-left: 10%;` ;
        parent.appendChild(this.myDiv);
    }

    _createStatusRow(statuses) {
        let rows="";
        statuses.forEach(s=>{
            let row=`<button type="button" class="status-button" value="${Globals.Statuses[s].name}">${Globals.Statuses[s].label}</button>`;
            rows+=row+"\n";
        })
        this.content=this.content.replace("$STATUSBUTTONS$",rows);

    }

    addBon(bon,orders) {
        let div=document.createElement("div");
        div.style.cssText="margin:10px";
        div.innerHTML=this.content;
        let color=Globals.Statuses[bon.status].color;
        
        let self=this
        div.querySelectorAll(".status-button").forEach(e=>{
            if(e.value===bon.status) {
                e.classList.add("active");
                e.style.background=color;
            }
            e.onclick=(evt)=>{
                self.clickStatus(bon.id,evt.target);
            }
        })
        let bonDiv=div.querySelector(".bon-item");

        this.myDiv.appendChild(div);
        let bs=new BonStrip(bonDiv);
        bs.initFromBon(bon,orders);
        bs.hidePrices();

    }

    clickStatus(id,elem) {
        if(this.cancelFunction) {
            this.cancelFunction();
        }
        let isActive=elem.classList.contains("active");
        let status=elem.value;
        let color=Globals.Statuses[status].color;
        
        elem.parentElement.querySelectorAll(".status-button").forEach(e=>{
            e.classList.remove("active");
            e.style.background="";
        });
        if(!isActive) {
            elem.classList.add("active");
            elem.style.background=color;
        } else {
            status=this.startStatus;
        }
        
        if(status==this.endStatus) {
            this._fadeout(elem,id,status);
        } else {
            Globals.myConfig.myRepo.updateBonStatus(id,status,(status)=>{});
        }
    }

    _fadeout(elem,id,status) {
        let parentDiv=elem.parentElement.parentElement;
        let bonDiv=elem.parentElement.nextElementSibling;
        let t=3;
        let orgStyle=bonDiv.style.cssText;
        let style=`
            visibility: hidden;
            opacity: 0;
            transition: visibility 0s ${t}s, opacity ${t}s linear;      
        `;
        bonDiv.style.cssText+=style;

        let timer=setTimeout(()=>{
            Globals.myConfig.myRepo.updateBonStatus(id,status,(status)=>{});
            parentDiv.remove();
        }, t*1000);

        this.cancelFunction=() => {
            clearTimeout(timer);
            bonDiv.style.cssText=orgStyle;
            this.cancelFunction=undefined;
        }
    
    }

    getBonsForToday() {
        this.myDiv.innerHTML="";
        let today = new Date();
        let todayStr = today.toISOString().split('T')[0];
        let tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);
        let tomorrowStr = tomorrow.toISOString().split('T')[0];
        let self = this;
        Globals.myConfig.myRepo.searchBons({ afterDate: todayStr, beforeDate: tomorrowStr,status:this.statusFilter.join(",") }, (bons) => {
            bons.forEach(b => {
                Globals.myConfig.myRepo.getOrders(b.id, (orders) => {
                    self.addBon(b, orders);
                })
            })
        })

    }

    getFutureBons() {
        this.myDiv.innerHTML="";

        let tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate()+1);        
        let tomorrowStr = tomorrow.toISOString().split('T')[0];
        let self = this;
        Globals.myConfig.myRepo.searchBons({ afterDate: tomorrowStr, status:this.statusFilter.join(",") }, (bons) => {
            bons.forEach(b => {
                Globals.myConfig.myRepo.getOrders(b.id, (orders) => {
                    self.addBon(b, orders);
                })
            })
        })

    }



    getAllBons() {
        this.myDiv.innerHTML="";
        let self = this;
        Globals.myConfig.myRepo.searchBons({status:this.statusFilter.join(",") }, (bons) => {
            bons.forEach(b => {
                Globals.myConfig.myRepo.getOrders(b.id, (orders) => {
                    self.addBon(b, orders);
                })
            })
        })
    }    
}