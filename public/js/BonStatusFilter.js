class BonStatusFilter {

    buttons=`
    <style>
        .status-buttons {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
        }
        .status-buttons .status-filter {
            padding: 3px;
            letter-spacing: 0;
            border-radius: 0px;
            border: 2px solid black;
            padding-top: 0;
            font-size: 9px;
            margin-right: 3px;
            color:black;
            box-shadow: 5px 5px 5px grey;
        }

        .status-buttons .filtered {
            opacity:0.3;
            box-shadow: none;
        }


        </style>
    <div class="status-buttons">
    <button type="button" id="${Globals.Statuses["new"].name}" class="status-filter" style="float:left;background:${Globals.Statuses["new"].color}">${Globals.Statuses["new"].label}</button>
    <button type="button" id="${Globals.Statuses["needInfo"].name}" class="status-filter" style="float:left;background:${Globals.Statuses["needInfo"].color}">${Globals.Statuses["needInfo"].label}</button>
    <button type="button" id="${Globals.Statuses["approved"].name}" class="status-filter" style="float:left;background:${Globals.Statuses["approved"].color}">${Globals.Statuses["approved"].label}</button>
    <button type="button" id="${Globals.Statuses["preparing"].name}" class="status-filter" style="float:left;background:${Globals.Statuses["preparing"].color}">${Globals.Statuses["preparing"].label}</button>
    <button type="button" id="${Globals.Statuses["done"].name}" class="status-filter" style="float:left; background:${Globals.Statuses["done"].color}">${Globals.Statuses["done"].label}</button>
    <button type="button" id="${Globals.Statuses["delivered"].name}" class="status-filter" style="float:left; background:${Globals.Statuses["delivered"].color}">${Globals.Statuses["delivered"].label}</button>
    <button type="button" id="${Globals.Statuses["invoiced"].name}" class="status-filter" style="float:left; background:${Globals.Statuses["invoiced"].color}">${Globals.Statuses["invoiced"].label}</button>
    <button type="button" id="${Globals.Statuses["closed"].name}" class="status-filter" style="float:left; background:${Globals.Statuses["closed"].color}">${Globals.Statuses["closed"].label}</button>
    <button type="button" id="${Globals.Statuses["offer"].name}" class="status-filter" style="float:left; background:${Globals.Statuses["offer"].color}">${Globals.Statuses["offer"].label}</button>
    </div>
    `


    constructor(div) {
        if(typeof div==="string") {
            this.myDiv = document.querySelector(div);
        } else {
            this.myDiv=div;
        }
        this.myDiv.innerHTML=this.buttons;

        let self=this;
        this.myDiv.querySelectorAll(".status-filter").forEach(e=>{
            e.onclick=()=> {
                let show;
                if(e.classList.contains("filtered")) {
                    e.classList.remove("filtered");
                    show=true;
                } else {
                    e.classList.add("filtered");
                    show=false;
                }
                self.onStatusChange && self.onStatusChange(e.id,self.getStatuses());

            }
        })
    }

    setOnStatusChange(fun) {
        this.onStatusChange=fun;

    }

    setStatus(statusName,active) {

        let b=this.myDiv.querySelector("#"+statusName);
        if(active) {
            b.classList.remove("filtered");
        } else {
            b.classList.add("filtered");
        }

    }

    getStatuses() {
        let res={};
        this.myDiv.querySelectorAll(".status-filter").forEach(e=>{
            let id=e.id;
            let active=true;
            if(e.classList.contains("filtered")) {
                active=false;
            }
            res[id]=active;
        })
        return res; 
    }

    getActiveStatuses() {
        let statuses=this.getStatuses();
        return Object.keys(statuses).filter(e=>(statuses[e]));
    }
 }