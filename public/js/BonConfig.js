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
            <input type="button" id="remove-user" value="Ta bort">

            <input type="button" id="cancel" value="Avbryd" >
        </div>
        <input type="hidden" id="userid" name="userid">

    </form> 
   `
    constructor(div) {

        this.myRepo = new BonRepository();

        this.myTabs=new TabsClass(div);
        this.myTabs.addTab("Varer",this.items);
        this.myTabs.addTab("Bruger",this.users,()=>{this.getUsers()});
        this.getItemsFromDB(()=>{
            this.createItemsTable();
            Globals.myCalender.myBonForm.updateItems();

        });
        if(typeof div==="string") {
            this.myItemsTable=document.querySelector(div).querySelector("#items-table");
            this.myRefreshDB=document.querySelector(div).querySelector("#refresh-db");
            this.myUsersTable=document.querySelector(div).querySelector("#users-table");
            this.myAddUser=document.querySelector(div).querySelector("#add-user");
        } else {
            this.myItemsTable=div.querySelector("#items-table");
            this.myRefreshDB=div.querySelector("#refresh-db");
            this.myUsersTable=div.querySelector("#users-table");
            this.myAddUser=div.querySelector("#add-user");
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
                            errorMsg = "Användaren finns redan";
    
                        } else {
                            errorMsg = "Det gick inte att registrera användaren, försök senare!";
    
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

    }



    getItemsFromDB(callback) {
        this.myRepo.getItems(items=>{
            this.cachedItems=items;
            this.myRepo.getItemsPrices(prices=>{
                this.cachedPrices=prices;
                this.price_lookup={};
                this.myItems=items.filter(e=>(e.sellable));
                prices.items.forEach(e=>{this.price_lookup[e.id]=e;});
                this.priceCategories=prices.categoryNames;
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
                            errorMsg = "Användaren finns redan";
    
                        } else {
                            errorMsg = "Det gick inte att registrera användaren, försök senare!";
    
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
        }
        tableRows.append(row);
        })
        this.myUsersTable.append(tableRows);


    }



    _populateUserForm(userProps) {
        Object.keys(userProps).forEach(k=>{
            console.log(k, this.UserAdminForm.querySelector("#"+k));
            this.UserAdminForm.querySelector("#"+k).value=userProps[k];
        });
    }
}