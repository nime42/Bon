class BonWall {
    background=Globals.background;
    foreground=Globals.foreground;
    shadowColor=Globals.shadowColor;

    style=`
    <style>
        .bon-wall .status-button {
        }
        .bon-wall .status-button.active {
            background:${this.foreground};
        }


    </style>
    `

    content=`
    <div id=status-row style="padding: 10px; border: 2px solid ${this.foreground};border-radius:3px 3px">
    $STATUSBUTTONS$
    </div>
    <div class="bon-item"/>
    `
        
    constructor(div,startStatus,useStatuses,manageStatus) {
        this._createStatusRow(useStatuses);
        this.startStatus=startStatus;
        this.manageStatus=manageStatus;
        this.manageStatus.push(startStatus);
        let parent;
        if(typeof div==="string") {
            parent=document.querySelector(div);
        } else {
            parent=div;
        }

        this.myDiv=document.createElement("div");
        this.myDiv.classList.add("bon-wall");
        this.myDiv.innerHTML=this.style;
        this.myDiv.style.cssText=`display: flex;flex-wrap: wrap; background:${this.background};width:100%;height: 100%;margin-top: 10%;margin-left: 10%;` ;
        parent.appendChild(this.myDiv);
    }

    _createStatusRow(statuses) {
        let rows="";
        statuses.forEach(s=>{
            let row=`<button type="button" class="status-button" value="${s.status}">${s.label}</button>`;
            rows+=row+"\n";
        })
        this.content=this.content.replace("$STATUSBUTTONS$",rows);

    }

    addBon(bon,orders) {
        let div=document.createElement("div");
        div.style.cssText="margin:10px";
        div.innerHTML=this.content;
        
        let self=this
        div.querySelectorAll(".status-button").forEach(e=>{
            if(e.value===bon.status) {
                e.classList.add("active");
            }
            e.onclick=(evt)=>{
                self.clickStatus(bon.id,evt.target);
            }
        })
        let bonDiv=div.querySelector(".bon-item");

        this.myDiv.appendChild(div);
        let bs=new BonStrip(bonDiv);
        bs.initFromBon(bon,orders);

    }

    clickStatus(id,elem) {
        let isActive=elem.classList.contains("active");
        let status=elem.value;
        
        elem.parentElement.querySelectorAll(".status-button").forEach(e=>{
            e.classList.remove("active");
        });
        if(!isActive) {
            elem.classList.add("active");
        } else {
            status=this.startStatus;
        }
        Globals.myConfig.myRepo.updateBonStatus(id,status,(status)=>{});
        
    }

    getBonsForToday() {
        let today = new Date();
        let todayStr = today.toISOString().split('T')[0];
        let tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);
        let tomorrowStr = tomorrow.toISOString().split('T')[0];
        let self = this;
        Globals.myConfig.myRepo.searchBons({ afterDate: todayStr, beforeDate: tomorrowStr }, (bons) => {
            bons.forEach(b => {
                if (self.manageStatus.find(e => (e === b.status))) {
                    Globals.myConfig.myRepo.getOrders(b.id, (orders) => {
                        self.addBon(b, orders);
                    })
                }
            })
        })

    }

    getAllBons() {
        let self = this;
        Globals.myConfig.myRepo.searchBons({ }, (bons) => {
            bons.forEach(b => {
                if (self.manageStatus.find(e => (e === b.status))) {
                    Globals.myConfig.myRepo.getOrders(b.id, (orders) => {
                        self.addBon(b, orders);
                    })
                }
            })
        })

    }    
}