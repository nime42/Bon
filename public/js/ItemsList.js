class ItemsList {
    background=Globals.background;
    foreground=Globals.foreground;
    shadowColor=Globals.shadowColor;

    style=`
 
    `

    content=`
    <style>
    ${this.style}
    </style>
    <div id="items" class="items-list" style="box-shadow: 5px 5px 5px grey; background:${this.background};padding-left: 10px;border: 2px solid ${this.foreground}; overflow: auto;max-height: 80vh;"></div>
    `

    constructor(div) {
        if (typeof div === "string") {
            this.myDiv = document.querySelector(div);
        } else {
            this.myDiv = div;
        }


        this.myRepo = new BonRepository();

        this.myDiv.innerHTML=this.content;
        this.myItemCategories=new VertTabsClass(this.myDiv.querySelector("#items"));

    }

    _getAllItems(callback) {
        if(Globals.myConfig.cachedItems) {
            callback(Globals.myConfig.cachedItems)
        } else {
            this.myRepo.getItems(callback);
        }
    }

    _getAllPrices(callback) {
        if(Globals.myConfig.cachedPrices) {
            callback(Globals.myConfig.cachedPrices)
        } else {
            this.myRepo.getItemsPrices(callback);
        }        
    }

    updateItems(priceCategory) {
        let currentItemTabIndex=this.myItemCategories.getActiveTabIndex();
        this.myItemCategories.clearAll();
        this._getAllItems(items=>{
            this._getAllPrices(prices=>{
                this.myItems=items.filter(e=>(e.sellable));
                let price_lookup={};
                prices.items.forEach(e=>{price_lookup[e.id]=e;});
                this.myItems.forEach(e=>{
                    e.price=price_lookup[e.id].price_categories[priceCategory];
                })
                let categories={};
                this.myItems.forEach((i)=>{
                    if(!categories[i.category]) {
                        categories[i.category]=[];
                    }
                    categories[i.category].push(i);
    

                })

                this.insertItems(categories,currentItemTabIndex);

            })
        })

    }

    insertItems(categories,tabIndex) {
        Object.keys(categories).forEach((k)=>{
            let content=document.createElement("div");
            content.style.minWidth="150px";

            categories[k].forEach((n)=>{
                let button=document.createElement("span");
                button.style.cssText=`
                width: 100%;
                margin-bottom: 5px;
                border: 1px solid black;
                padding: 2px;
                border-radius: 4px;
                cursor: pointer;`;
                button.innerHTML=n.name +" ("+n.price+" kr)";
                button.onclick=()=>{
                    this.onItemClick && this.onItemClick(n);
                    return false;
                }
                content.appendChild(button);
                content.appendChild(document.createElement("br"));
                
            })
            this.myItemCategories.addTab(k,content);

        })

        this.myItemCategories.setActiveTabIndex(tabIndex);
    }

    SetOnItemClick(fun) {
        this.onItemClick=fun;
    }
}