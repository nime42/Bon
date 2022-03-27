class ItemsList {
    background=Globals.background;
    foreground=Globals.foreground;
    shadowColor=Globals.shadowColor;

    style=`
    .items-list fieldset {
        border-radius: 10px;
        -webkit-border-radius: 10px;
        -moz-border-radius: 10px;
        margin: 0px 0px 10px 0px;
        border: 1px solid ${this.foreground};
        padding: 20px;
        background: ${this.background};
        box-shadow: inset 0px 0px 15px ${this.shadowColor};
        -moz-box-shadow: inset 0px 0px 15px ${this.shadowColor};
        -webkit-box-shadow: inset 0px 0px 15px ${this.shadowColor};
    }

    .items-list fieldset legend {
        color: ${this.foreground};
        border-top: 1px solid ${this.foreground};
        border-left: 1px solid ${this.foreground};
        border-right: 1px solid ${this.foreground};
        border-radius: 5px 5px 0px 0px;
        -webkit-border-radius: 5px 5px 0px 0px;
        -moz-border-radius: 5px 5px 0px 0px;
        background: ${this.background};
        padding: 0px 8px 3px 8px;
        box-shadow: -0px -1px 2px ${this.shadowColor};
        -moz-box-shadow: -0px -1px 2px ${this.shadowColor};
        -webkit-box-shadow: -0px -1px 2px ${this.shadowColor};
        font-weight: normal;
    }
    `

    content=`
    <style>
    ${this.style}
    </style>
    <div id="items" class="items-list"></div>
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

    updateItems(priceCategory) {
        let currentItemTabIndex=this.myItemCategories.getActiveTabIndex();
        this.myItemCategories.clearAll();
        this.myRepo.getItems(items=>{
            this.myRepo.getItemsPrices(prices=>{
                this.myItems=items.filter(e=>(e.sellable));
                let price_lookup={};
                prices.items.forEach(e=>{price_lookup[e.id]=e;});
                this.myItems.forEach(e=>{
                    e.price=price_lookup[e.id].price_categories[priceCategory];
                })
                console.log(this.myItems);
                let categories={};
                this.myItems.forEach((i)=>{
                    if(!categories[i.category]) {
                        categories[i.category]=[];
                    }
                    categories[i.category].push(i);
    

                })

                console.log(categories);
                this.insertItems(categories,currentItemTabIndex);

            })
        })

    }

    insertItems(categories,tabIndex) {
        Object.keys(categories).forEach((k)=>{
            let content=document.createElement("div");
            content.style.minWidth="150px";

            categories[k].forEach((n)=>{
                let button=document.createElement("button");
                button.style.width="100%";
                button.style.marginBottom="3px";
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