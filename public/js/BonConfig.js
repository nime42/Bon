class BonConfig {
    background=Globals.background;
    foreground=Globals.foreground;
    shadowColor=Globals.shadowColor;

    style=`
    .config-style {

        font-family: sans-serif;
        font-size:medium;
        background:${this.background};
        padding: 10px;
        -webkit-border-radius: 10px;
        min-width:450px;
    }

    .config-style label {
        display: block;
        margin-bottom: 10px;
    }

    .config-style label>span {
        float: left;
        width: 100px;
        color: ${this.foreground};
        font-weight: bold;
        text-shadow: 1px 1px 1px #fff;
    }

    .config-style fieldset {
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

    .config-style fieldset legend {
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

    .config-style textarea {
        width: 250px;
    }

    .config-style input[type=text],
    .config-style input[type=date],
    .config-style input[type=datetime],
    .config-style input[type=number],
    .config-style input[type=search],
    .config-style input[type=time],
    .config-style input[type=url],
    .config-style input[type=email],
    .config-style input[type=tel],
    .config-style select,
    .config-style textarea {
        border-radius: 3px;
        -webkit-border-radius: 3px;
        -moz-border-radius: 3px;
        border: 2px solid ${this.foreground};
        outline: none;
        color: ${this.foreground};
        padding: 5px 8px 5px 8px;
        box-shadow: inset 1px 1px 4px ${this.shadowColor};
        -moz-box-shadow: inset 1px 1px 4px ${this.shadowColor};
        -webkit-box-shadow: inset 1px 1px 4px ${this.shadowColor};
        background: ${this.background};
        font-size:medium;
    }

    .config-style input[type=submit],
    .config-style input[type=button] {
        background: ${this.background};
        border: 1px solid ${this.foreground};
        padding: 5px 15px 5px 15px;
        color: ${this.foreground};
        box-shadow: inset -1px -1px 3px ${this.shadowColor};
        -moz-box-shadow: inset -1px -1px 3px ${this.shadowColor};
        -webkit-box-shadow: inset -1px -1px 3px ${this.shadowColor};
        border-radius: 3px;
        border-radius: 3px;
        -webkit-border-radius: 3px;
        -moz-border-radius: 3px;
        font-weight: bold;
    }


    .config-style .input-icons {
        color: ${this.foreground};
        width: 5%;
    }

    .required {
        color: red;
        font-weight: normal;
    }

    .config-style table {
        border-collapse: collapse;
        width: 100%;
      }
      
      .config-style td, .config-style th {
        border: 1px solid ${this.foreground};
        padding: 8px;
        color: ${this.foreground};
      }
      
      .tableFixHead          { 
          overflow: auto; 
          height: 300px; 
        }
      .tableFixHead thead th { 
          position: sticky; 
          top: 0; 
          z-index: 1; 
          color: ${this.background};
          background: ${this.shadowColor};
        }

    `;


    items=`
        <div>
        <style>
            ${this.style}
        </style>
        <div class="config-style">
        <input type="button" id="refresh-db" value="Hämta från DB">
        <br><br>
        <div class="tableFixHead">
        <table id="items-table">
        </table>
        </div>

        </div>
        </div>
    `;
    constructor(div) {

        this.myRepo = new BonRepository();

        this.myTabs=new TabsClass(div);
        this.myTabs.addTab("Varer",this.items);
        this.myTabs.addTab("Bruger","");
        this.getItemsFromDB(()=>{
            this.createItemsTable();
            Globals.myCalender.myBonForm.updateItems();

        });
        if(typeof div==="string") {
            this.myItemsTable=document.querySelector(div).querySelector("#items-table");
            this.myRefreshDB=document.querySelector(div).querySelector("#refresh-db");
        } else {
            this.myItemsTable=div.querySelector("##items-table");
            this.myRefreshDB=div.querySelector("#refresh-db");
        }
        let self=this;
        this.myRefreshDB.onclick=function() {
            let p=MessageBox.popup("Uppdaterar DB...");
            self.myRepo.updateDB(function() {
                self.getItemsFromDB(()=>{
                    self.createItemsTable();
                    Globals.myCalender.myBonForm.updateItems();
                    p.hide();
    
                });
            })
        };

    }

    getItemsFromDB(callback) {
        this.myRepo.getItems(items=>{
            this.myRepo.getItemsPrices(prices=>{
                this.price_lookup={};
                this.myItems=items.filter(e=>(e.sellable));
                prices.items.forEach(e=>{this.price_lookup[e.id]=e;});
                this.priceCategories=prices.categoryNames;
                callback();
            });
        });

    }

    getItems(callback) {

        let self=this; 
        
        
        this.myRepo.getItems(items=>{
            this.myRepo.getItemsPrices(prices=>{
                self.createItemsTable(items,prices);
            })
        })

    }
    createItemsTable() {

        this.myItemsTable.innerHTML="";
        
        let categoryHeaders=this.priceCategories.map(n=>(`<th>Pris - ${n} </th>`)).join("\n");
        let headers=`
        <tr>
        <th>Kategorie</th>
        <th>Vare</th>
        <th>Pris</th>
        ${categoryHeaders}
        </tr>
        `;
        let headerRow=document.createElement("thead");
        headerRow.innerHTML=headers;
        this.myItemsTable.append(headerRow);
        let tableRows=document.createElement("tbody");

        let self=this;
        this.myItems.forEach(i=>{
            let priceCategories=this.priceCategories.map(c=>(`<td>${self.price_lookup[i.id].price_categories[c]}</td>`)).join("\n")

            let cols=`
                <td>${i.category}</td>
                <td>${i.name}</td>
                <td>${i.cost_price}</td>
                ${priceCategories}
            `;

            let row=document.createElement("tr");
            row.innerHTML=cols;
            tableRows.append(row);

        })
        this.myItemsTable.append(tableRows);
        



    }
}