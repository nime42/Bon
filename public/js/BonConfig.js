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
      }
      
      .config-style td, .config-style th {
        border: 1px solid ${this.foreground};
        padding: 8px;
        color: ${this.foreground};
        text-overflow: ellips;
        white-space: nowrap;
        overflow:hidden;
        
      }
      
      .tableFixHead { 
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


        #izettle-products-table thead th {  
            color: ${this.foreground};
            background: ${this.background};
          }

        #izettle-products-table tbody td, #izettle-products-table thead th {
            border: 0px solid ${this.foreground};
            padding: 2px;
            color: ${this.foreground};
            text-overflow: ellips;
            white-space: nowrap;
            overflow:hidden;
            vertical-align: top;
            
          }

          #izettle-products-table {
            width:70%;
          }


    `;


    items=`
        <div>
        <style>
            ${this.style}
        </style>
        <div class="config-style">
        <input type="button" id="refresh-db" value="Hænter fra DB">
        <br><br>
        <div class="tableFixHead">
        <table id="items-table">
        </table>
        </div>
        <a href="api/productFile">Download</a>
        </div>
        </div>
    `;

    izettleProducts=`
    <div>
    <style>
        ${this.style}
    </style>
    <div class="config-style">
    <datalist id="grocy-items-data-list"></datalist>
    <div class="tableFixHead">
    <table id="izettle-products-table">
    </table>
    </div>

    </div>
    </div>
`;

    users=`
    <div>
    <style>
        ${this.style}
    </style>
    <div class="config-style">
    <div class="tableFixHead">
    <table id="users-table">
    </table>
    </div>
    <input type="button" id="add-user" value="Ny Bruger">
    </div>
    </div>
    `

    bons=`
    <div>
    <style>
        ${this.style}
    </style>
    <div class="config-style">
    <div class="tableFixHead" style="width: 90%;">
    <table id="bons-table">
    </table>
    </div>
    <a href="api/bonSummaryFile">Download</a>

    </div>
    </div>
    `
    messages=`
    <div id="message-div">
    <select id="messages" style="height: auto;">
    <option>Bekræftelse</option>
    </select>
    <br>
    <div>
    <div style="float: left;margin-right: 20px;width: 70%;">
    <p style="margin-bottom: 0;">Besked</p>
    <textarea id="message-content" rows="6" style="width: 100%;"></textarea>
    </div>
    <div>
        <p style="margin-bottom: 0;">Variabler</p>
        <select id="message-variables" size="6">
        </select>
        <br>
        <input type="button" id="test-message" value="Test">
    </div>
    </div>
    <br>
    <input type="button" id="save-message" value="Opdater">
    <input type="button" id="new-message" value="Ny">
    <input type="button" id="del-message" value="Slet">
    </div>
    `

    userForm=`
    <form id="user-admin" class="form"  autocomplete="off" method="post" >
        <p id="error-msg" style="color:red"></p>
        <label for="username">Bruger-id:</label><input type="text" name="username" id="username"><br>
        <label for="name">Navn:</label><input type="text" name="name" id="name"><br>
        <label for="email">Email:</label><input type="email" name="email" id="email"><br>
        <label for="phonenr">Telefon:</label><input type="tel" name="phonenr" id="phonenr"><br>
        <label for="password">Password:</label><input type="password" name="password" id="password"><br>
        <br>
        <fieldset>
        <legend>Roller</legend>
        <div id="roles"/> 
        </fieldset> 
       <br> 
        <div style="width:100%">
            <input type="submit" id="create-update-user" value="Uppdater">
            <input type="button" id="remove-user" value="Fjern">

            <input type="button" id="cancel" value="Avbryd" >
        </div>
        <input type="hidden" id="userid" name="userid">

    </form> 
   `
    constructor(div,callback) {

        this.myRepo = new BonRepository();

        this.myTabs=new TabsClass(div);
        this.myTabs.addTab("Varer",this.items);
        this.myTabs.addTab("Izettle produkter",this.izettleProducts,()=>{this.getIzettleProducts()});
        this.myTabs.addTab("Bruger",this.users,()=>{this.getUsers()});
        this.myTabs.addTab("Bons",this.bons,()=>{this.getBons()});
        this.myTabs.addTab("Beskeder",this.messages,()=>{this.setupMessageEditor()});



        if(typeof div==="string") {
            div=document.querySelector(div);
        }

        this.myItemsTable=div.querySelector("#items-table");
        this.myRefreshDB=div.querySelector("#refresh-db");
        this.myUsersTable=div.querySelector("#users-table");
        this.myAddUser=div.querySelector("#add-user");
        this.myBonTable=div.querySelector("#bons-table");
        this.myIZettleProductTable=div.querySelector("#izettle-products-table");
        this.myGrocyItemsDatalist=div.querySelector("#grocy-items-data-list");
        this.myMessages=div.querySelector("#message-div");
        
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




        this.UserAdminForm=document.createElement("div");
        this.UserAdminForm.style.cssText=`
        padding: 20px;
        border: 1px solid black;
        border-radius: 15px;
        background:${this.background}
        `;
        this.UserAdminForm.innerHTML=this.userForm;
    

        this.userInfoAdminPopup=new ModalPopup();
        

        this.myAddUser.onclick=function() {
            self.UserAdminForm.querySelector("#create-update-user").value="Spar";
            self.UserAdminForm.querySelector("#error-msg").innerHTML="";
            self.UserAdminForm.querySelector("#username").disabled = false;
            self.clearRoles();
            self.UserAdminForm.querySelector("#create-update-user").onclick=function() {
                let userInfo={};
                self.UserAdminForm.querySelectorAll("input").forEach(e => {
                    userInfo[e.name] = e.value.trim();
                });
                userInfo["roles"]=self.getCheckedRoles();
                Globals.myLoginHandler.createUser(userInfo,(status,data)=>{
                    if(!status) {
                        let errorMsg;
                        if (data.status === 403) {
                            errorMsg = "Brugeren findes allerede";
    
                        } else {
                            errorMsg = "Det gik ikke at registrere brugeren, forsøg senere!";
    
                        }
                        self.UserAdminForm.querySelector("#error-msg").innerHTML=errorMsg;  
                    } else {
                        self.userInfoAdminPopup.hide();
                        self.getUsers();
                    }
                })
    
                return false;

                                
            }
            let empty={
                "username": "",
                "name": "",
                "email": "",
                "phonenr": "",
                "password": "",
                "userid":""
            }
            self._populateUserForm(empty);
            self.UserAdminForm.querySelector("#remove-user").style.display="none";
            self.userInfoAdminPopup.show(self.UserAdminForm);

        }

        self.UserAdminForm.querySelector("#cancel").onclick=function() {
            self.userInfoAdminPopup.hide();
        }


        this.getItemsFromDB(()=>{
            this.createItemsTable();
            Globals.myCalender.myBonForm.updateItems();

            callback && callback();

        });

    }

    //If we have specified an order of categorynames then sort the feched categories as that
    //if there is categories not in the list of sorted categories just add them to the end.
    _sortCategoryNames(categoryNames) {
        if(Globals.CategoryOrder) {
            let unordered=new Set(categoryNames);
            let ordered=Globals.CategoryOrder;
            unordered.forEach(c=>{
                if(!ordered?.includes(c)) {
                    ordered.append(c);
                }
            });
            return ordered;
        } else {
            return categoryNames;
        }
    }

    getItemsFromDB(callback) {
        this.myRepo.getItems(items=>{
            this.cachedItems=items;
            this.myRepo.getItemsPrices(prices=>{
                this.cachedPrices=prices;
                this.price_lookup={};
                this.myItems=items.filter(e=>(e.sellable));
                prices.items.forEach(e=>{this.price_lookup[e.id]=e;});

                this.priceCategories=this._sortCategoryNames(prices.categoryNames);
                callback();
            });
        });

    }



    getUsers() {
        this.getAllRoles();

        let self=this; 
        Globals.myLoginHandler.getAllUsers(users=>{
            self.createUsersTable(users);
        })

    }

    getIzettleProducts() {
        let self=this;
        this.myRepo.getIZettleProducts((products)=>{
            self.createIzettleTable(products);
        });

    }

    getAllRoles() {
        let rolesElem=this.UserAdminForm.querySelector("#roles");
        rolesElem.innerHTML="";
        Globals.myLoginHandler.getAllRoles(roles=>{
            roles.forEach(r=>{
                let l=document.createElement("label");
                l.innerHTML=`<input type="checkbox" value="${r.id}">${r.description}`;
                rolesElem.appendChild(l);
                rolesElem.appendChild(document.createElement("br"));

            })
        })
    }

    clearRoles() {
        let rolesElem=this.UserAdminForm.querySelector("#roles");
        rolesElem.querySelectorAll("input[type=checkbox]").forEach(c=>{
            c.checked = false
        })
    }

    setRoles(roles) {
        let rolesElem=this.UserAdminForm.querySelector("#roles");
        roles.forEach(r => {
            let cb=rolesElem.querySelector(`input[type='checkbox'][value='${r}']`);
            if(cb) {
                cb.checked=true;
            }
        })
    }

    getCheckedRoles() {
        let res=[];
        let rolesElem=this.UserAdminForm.querySelector("#roles");
        rolesElem.querySelectorAll("input[type='checkbox']:checked").forEach(c=>{
            res.push(c.value);
        })
        return res;
    }

    getBons() {
        let b=MessageBox.popup("Henter Bons...");
        this.myRepo.getBonSummary(undefined,bons=>{
            this.createBonSummaryTable(bons);
            b.hide();
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
        TableEnhancer.sortable(this.myItemsTable);
    }

    createIzettleTable(products) {
        this.myGrocyItemsDatalist.innerHTML="";
        let option=document.createElement("option");
        option.value="-";
        this.myGrocyItemsDatalist.append(option);
        this.myItems.forEach(i=>{
            let option=document.createElement("option");
            option.value=i.category+":"+i.name;
            this.myGrocyItemsDatalist.append(option);
        })

        this.myIZettleProductTable.innerHTML="";
        let headers=`
        <tr>
        <th style="width:40%">iZettle Produkt</th>
        <th style="width:5%"></th>
        <th style="width:50%">Grocy Vare</th>
        <th style="width:5%">Antal</th>
        </tr>
        `;
        let headerRow=document.createElement("thead");
        headerRow.innerHTML=headers;
        this.myIZettleProductTable.append(headerRow);
        let tableRows=document.createElement("tbody");

        products.forEach(p=>{
            let grocy_val="";
            if (p.connectable) {
              let grocy = this.myItems.find((e) => e.id == p.grocy_id);
              if (grocy) {
                grocy_val = grocy.category + ":" + grocy.name;
              }
            } else {
                grocy_val="-";
            } 

            let cols=`
                <td>${p.name}</td>
                <td><i class="fa fa-arrow-right"></i></td>
                <td><input list="grocy-items-data-list" id="grocy-item" style="width:100%;margin-bottom: 0px;" value="${grocy_val}"></td>
                <td><input type="number" id="quantity" name="quantity" min="1" style="width:70px; padding-bottom: 0px;margin-bottom: 0px;margin-left: 2px" value="${p.quantity}"></td>
            `; 

            let row=document.createElement("tr");
            row.innerHTML=cols;

            let onchangeF=() =>{
                let grocy_val=row.querySelector("#grocy-item").value;
                let grocy_id=null;
                let connectable=1;

                if(grocy_val=="-") {
                    grocy_id=-1;
                    connectable=0;
                } else {
                    let grocy=this.myItems.find(e=>(e.category+":"+e.name==grocy_val));

                    grocy && (grocy_id=grocy.id);
                }
                

                
            
                let q=row.querySelector("#quantity").value;
                this.myRepo.updateIZettleProduct(p.id,grocy_id,q,connectable);
                row.querySelector("#grocy-item").setSelectionRange(0, 0);
                row.querySelector("#grocy-item").focus();

            }

            row.querySelector("#grocy-item").onchange=onchangeF;
            row.querySelector("#quantity").onchange=onchangeF;

            tableRows.append(row);


        });

        this.myIZettleProductTable.append(tableRows);
        TableEnhancer.sortable(this.myIZettleProductTable,{2:(td)=>(td.querySelector("input").value),3:(td)=>(td.querySelector("input").value)});
        TableEnhancer.filterable(this.myIZettleProductTable,{2:(td)=>(td.querySelector("input").value),3:(td)=>(td.querySelector("input").value)},[1]);




    }
    createUsersTable(users) {
        this.myUsersTable.innerHTML="";
        
        let headers=`
        <tr>
        <th>Bruger id</th>
        <th>Navn</th>
        <th>Mail</th>
        <th>Telefon</th>
        </tr>
        `;
        let headerRow=document.createElement("thead");
        headerRow.innerHTML=headers;
        this.myUsersTable.append(headerRow);
        let tableRows=document.createElement("tbody");
        users.forEach(u=>{
            let cols=`
            <td>${u.username}</td>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>${u.phonenr}</td>
            `;

        let row=document.createElement("tr");
        row.style.cursor="pointer";
        row.innerHTML=cols;
        row.onclick=()=>{
            this.UserAdminForm.querySelector("#create-update-user").value="Uppdater";
            this.UserAdminForm.querySelector("#remove-user").style.display="";
            this.UserAdminForm.querySelector("#error-msg").innerHTML="";
            this.UserAdminForm.querySelector("#username").disabled = true;
            this.clearRoles();
            Globals.myLoginHandler.getUserRoles(u.userid,roles=>{
                this.setRoles(roles.map(r=>(r.roleid)))
            })

            this._populateUserForm(u);
            this.userInfoAdminPopup.show(this.UserAdminForm);

            let self=this;

            this.UserAdminForm.querySelector("#create-update-user").onclick=function() {
                let userInfo={};
                self.UserAdminForm.querySelectorAll("input").forEach(e => {
                    userInfo[e.name] = e.value.trim();
                });
                let roles=self.getCheckedRoles();

                Globals.myLoginHandler.updateUser(userInfo,(status,data)=>{
                    if(!status) {
                        let errorMsg;
                        if (data.status === 403) {
                            errorMsg = "Brugeren findes allerede";
    
                        } else {
                            errorMsg = "Det gik ikke at registrere brugeren, forsøg senere!";
    
                        }
                        self.UserAdminForm.querySelector("#error-msg").innerHTML=errorMsg;  
                    } else {
                        Globals.myLoginHandler.updateUserRoles(userInfo["userid"],roles,(status)=>{
                            if(status) {
                                self.userInfoAdminPopup.hide();
                                self.getUsers();
                            } else {
                                self.UserAdminForm.querySelector("#error-msg").innerHTML="Det gick inte att skapa roller";
                            }
                        })
                    }
                })
    
                return false;                     
            }
            this.UserAdminForm.querySelector("#remove-user").onclick=function() {
                MessageBox.popup("Vil du virkelig fjerne denne bruger?", {
                    b1: {
                      text: "Ja",
                      onclick: () => {
                          let userId=self.UserAdminForm.querySelector("#userid").value;
                          Globals.myLoginHandler.deleteUser(userId, (status)=> {
                            if(status) {
                                self.userInfoAdminPopup.hide();
                                row.remove();
                            } else {
                                self.UserAdminForm.querySelector("#error-msg").innerHTML="Det gick inte att fjerne brugeren";
                            }
                          })
                      },
                    },
                    b2: { text: "Nej" },
                  });
                  return false;
            
            }
        }
        tableRows.append(row);
        })
        this.myUsersTable.append(tableRows);
        TableEnhancer.sortable(this.myUsersTable);


    }

    createBonSummaryTable(bons) {
        this.myBonTable.innerHTML="";
        
        let headers=`
        <tr>
        <th>Id</th>
        <th>Leveringsdato</th>
        <th>Status</th>
        <th>Pax</th>
        <th>Pax-enheter</th>
        <th>Køkkenet vælger</th>
        <th>Leveringsadresse</th>
        <th>Navn</th>
        <th>Mail</th>
        <th>Telefon</th>
        <th>Firma</th>
        <th>EAN</th>
        <th>Betaling</th>
        <th>Priskategorie</th>
        <th>Købspris</th>
        <th>Pris</th>
        <th>Fakturadato</th>
        <th>Afstand(km)</th>
        </tr>
        `;
        let headerRow=document.createElement("thead");
        headerRow.innerHTML=headers;
        this.myBonTable.append(headerRow);
        let tableRows=document.createElement("tbody");
        bons.forEach(b=>{
            let cols=this._createTableRow(b);
            let row=document.createElement("tr");
            row.innerHTML=cols;
            tableRows.append(row);
        });
        this.myBonTable.append(tableRows);

        TableEnhancer.sortable(this.myBonTable, {0:(td)=>(parseInt(td.textContent.replace("#","")))});

        TableEnhancer.filterable(this.myBonTable);
    }

     _createTableRow(b) {
        let c={...b};
        Object.keys(c).forEach(k=>{if(c[k]===null) c[k]=""});
        
        return `
        <td><a href="javascript:void(0);"  onclick="Globals.myConfig.showBonForm(${c.id},this.parentNode.parentNode);">#${c.id}</a></td>
        <td>${Helper.formatDate(c.delivery_date)}</td>
        <td style="background-color:${Globals.Statuses[c.status].color};color:${Helper.contrastColor(Globals.Statuses[c.status].color)}">${Globals.Statuses[c.status].label}</td>
        <td>${c.nr_of_servings}</td>
        <td>${c.pax_units}</td>      
        <td>${c.kitchen_selects?"Ja":"Nej"}</td>
        <td>${c.customer_collects?"Afhentes":c.delivery_adr}</td>
        <td>${c.name}</td>
        <td>${c.email}</td>
        <td>${c.phone_nr}</td>
        <td>${c.company}</td>
        <td>${c.ean_nr}</td>
        <td>${c.payment_type}</td>
        <td>${c.price_category}</td>
        <td>${c.cost_price?c.cost_price.toFixed(2):0}</td>
        <td>${c.price?c.price.toFixed(2):0}</td>
        <td>${Helper.formatDate(c.invoice_date)}</td>
        <td>${c.distance?(c.distance/1000).toFixed(2):0}</td>
        `;
    }


    showBonForm(id,rowElem) {
        Globals.myCalender.myBonForm.initFromBonId(id,(event,arg1,arg2,arg3) => {
            if (rowElem) {
                switch (event) {
                    case "saved":
                        let bon = arg1;
                        this.myRepo.getBonSummary(bon.id, bons => {
                            bon = bons[0];
                            rowElem.innerHTML = this._createTableRow(bon);
                        })
                        break;
                    case "deleted":
                        rowElem.remove();
                        break;
                    case "copied":
                        this.getBons();
                        break;
                }
            }
        });
    }


    _populateUserForm(userProps) {
        Object.keys(userProps).forEach(k=>{
            this.UserAdminForm.querySelector("#"+k).value=userProps[k];
        });
    }


    valuesExample={
        bonId:"42",
        bonPrefix:Globals.bonPrefix,
        deliveryAdr: "Gadegaden 2\n11111 Byn",
        deliveryStreet:"Gadegaden",
        deliveryStreetNr:"2",
        deliveryZipCode:"11111",
        deliveryCity:"Byn",
        deliveryDate: "2022-11-22",
        deliveryTime: "12:00",
        foreName: "Ole",
        surName: "Svendsen",
        pax: "2",
        paxUnits:"10x3",
        totSum: "150.00",
        orderWithPrices: "1 X Dansk italiene (75 kr)\n1 X Bobler (75 kr)",
        orders: "1 X Dansk italiene\n1 X Bobler"
    }



    setupMessageEditor() {
        this.myRepo.getMessages(messages=>{
            let select=this.myMessages.querySelector("#messages");
            let textArea=this.myMessages.querySelector("#message-content");
            select.innerHTML="";

            select.onchange=()=>{
                let message=messages.find(m=>(m.name===select.value));
                textArea.value="";
                if(message) {
                    textArea.value=message.message;
                }
                
            };

            messages.forEach(m=>{
                let o=document.createElement("option");
                o.text=m.name;
                select.add(o);
            })
            select.onchange();

            let variableList=this.myMessages.querySelector("#message-variables");
            variableList.innerHTML="";
            Object.keys(this.valuesExample).forEach(k=>{
                let o=document.createElement("option");
                o.text="${"+k+"}";
                o.onclick=()=>{
                    Helper.typeInTextarea(o.text,textArea);
                    textArea.focus();
                }
                variableList.add(o);
            })


            let saveButton=this.myMessages.querySelector("#save-message");
            saveButton.onclick=()=>{
                let message=messages.find(m=>(m.name===select.value));
                if(message) {
                    let p=MessageBox.popup("Gemmer...");
                    message.message=textArea.value;
                    this.myRepo.updateMessage(message.id,message, ()=>{
                        p.hide();
                    });
                }

            }

            let newButton=this.myMessages.querySelector("#new-message");
            newButton.onclick=()=>{
                let newMessage = prompt("indtast navn til ny besked")?.trim();
                if(newMessage!==undefined && newMessage!=="") {

                    this.myRepo.addMessage(newMessage, (status,message) => {
                        if (status) {
                            messages.push(message);
                            let o = document.createElement("option");
                            o.text = newMessage;
                            select.add(o);
                            select.value = newMessage;
                            textArea.value = "";
                        } else {
                            if(message.status==409) {
                                alert("beskeden findes allerede!");
                            } else {
                                alert("Kunne ikke gemme!");
                            }
                        }
                    })

                }

            }

            let delButton=this.myMessages.querySelector("#del-message");
            delButton.onclick=()=>{

                if(confirm("vil du fjerne beskeden \""+select.value+"\"")) {
                    let message=messages.find(m=>(m.name===select.value));
                    if(message) {
                        this.myRepo.delMessage(message.id,message, ()=>{
                            messages=messages.filter(m=>(m.id!==message.id));
                            let o=[...select.options].find(o=>(o.selected));
                            o && o.remove();
                            message=messages.find(m=>(m.name===select.value));
                            textArea.value=message?.message;
                        });
    

                    }
                    
                }
                return

            }



            let testButton=this.myMessages.querySelector("#test-message");
            testButton.onclick=()=>{
                let message=messages.find(m=>(m.name===select.value));
                if(message) {

                    alert(Helper.replaceAllFromValues(textArea.value,this.valuesExample));

                }

            }

            

        })

    }

    getMessages(callback) {
        this.myRepo.getMessages(messages=>{
            callback(messages);
        })
    }

}