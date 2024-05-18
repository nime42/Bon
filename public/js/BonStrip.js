class BonStrip {
    background=Globals.background;
    foreground=Globals.foreground;
    shadowColor=Globals.shadowColor;
    CUSTOMER_COLLECTS_TXT="Afhentes";

    style=`
    #bon {
        min-width:250px;
        background: ${this.background};
        box-shadow: 5px 5px 5px grey;
        padding-left: 10px;
        border: 2px solid ${this.foreground};
    }
    #bon-id {
        padding-top: 5px;
        padding-bottom: 5px;
        font-weight: bold;
        font-size: large;
        font-family: san-serif;
    }
    #customer {
        padding-left: 15px;
        padding-bottom: 5px;
        font-style: italic;
        font-weight: bold;
        font-family: sans-serif;
        
    }
  

    #address {
        padding-left: 15px;
        font-style: italic;
        font-weight: bold;
        font-family: sans-serif;
        padding-bottom: 10px;
    }

    #bon #date,
    #bon #time,
    #bon #phonenr,
    #bon #email {
        padding-left: 15px;
        font-style: italic;
        font-weight: bold;
        font-family: sans-serif;
        padding-bottom: 5px;

    }
    .order {
        Xpadding-bottom: 8px;
        cursor: pointer;

    }
    .nr-of {
        font-weight: bold;
        font-family: sans-serif;
    }
    .x-sign {
        font-weight: bold;
        font-family: sans-serif;
        font-size:small;
        padding-left: 5px;
        padding-right: 5px;
    }
    .order-name {
        font-style: italic;
        font-weight: bold;
        font-family: sans-serif;
    }
    .order-info {
        font-style: italic;
        font-family: sans-serif;
        padding-left: 20px;
    }

    .price-box {
        float: right;
        margin-right: 3px;
        margin-left: 20px;
        Xborder: 1px solid black;
        Xpadding:2px;
        font-style: italic;
        font-weight: bold;
        font-family: sans-serif;
    }

    #bon fieldset {
        padding: 0px;
        margin-bottom: 5px;
        border: 1px dotted;
    }
    #bon legend {
        float: left;
        color: ${this.foreground};
        width: 100%;
        padding: 0;
        font-style: italic;
        font-size: small;
        margin-bottom: 3px;
    }
    #bon .drag {
    font-size: medium;
    float: right;
    margin-right: 10px;
    opacity: 0.5;
    cursor: grab;
    padding-left: 20px;
    }

    .order-config-style input[type=text],
    .order-config-style textarea {
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
    }

    .order-config-style input[type=button] {
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

    .order-config-style .plus-minus {
        font-size:small;
        padding-right:4px; 
        color:${this.foreground}
    }



    `;



    div=`
    <style>
        ${this.style};
    </style>

    <div id="bon">
        <div id="status-row">
        </div>
        <fieldset>
            <legend>Bon-id <i class="fa fa-caret-up" onclick="Helper.expandShrinkField(this)"></i></legend>
                <div id="bon-id" class="bonstrip-items field-content"></div>
        </fieldset>
        <fieldset>
            <legend>Navn <i class="fa fa-caret-up" onclick="Helper.expandShrinkField(this)"></i></legend>
            <div class="field-content">
            <div id="customer">
            <span id="forename" class="bonstrip-items"></span>&nbsp;<span id="surname" class="bonstrip-items"></span>
            </div>
            <div id="email" class="bonstrip-items"></div>
            <div id="phonenr" class="bonstrip-items"></div>
            </div>
        </fieldset>
        <fieldset>
            <legend>Tidspunkt</legend>
            <div>
            <div id="date" style="float:left" class="bonstrip-items"></div>
            <div id="time" style="float:left" class="bonstrip-items"></div>
            </div>
        </fieldset>

        <fieldset>
            <legend>Leveringsadresse <i class="fa fa-caret-up" onclick="Helper.expandShrinkField(this)"></i></legend>
            <div id="address" class="bonstrip-items field-content">
            </div>
        </fieldset>

        <fieldset>
        <legend>Betaling</legend>
        <span id="payment-type" class="field-content" style="float: left;font-weight: bold;font-style: italic;padding-left: 10px;">Kontant</span>
        </fieldset>

        <fieldset>
            <legend>Pax <i class="fa fa-caret-up" onclick="Helper.expandShrinkField(this)"></i></legend>
            <div class="field-content">
            <span id="pax" style="float: left;font-weight: bold;font-style: italic;padding-left: 10px;"></span>

            <label style="font-weight: bold;font-style: italic;float: right">
            Køkkenet vælger
            <input onclick="return false;" type="checkbox" id="kitchen-selects" value="1" style="margin-left: 5px;">
            </label>
            </div>
        </fieldset>
        <fieldset id="kitchen-field">
            <legend>Køkken info</legend>
            <span id="kitchenInfoText"></span>
        </fieldset>

      

        <div id="orders"></div>
        <br>
        <div id="total-sum-row">
        <span style="font-style: italic;font-weight: bold;font-family: sans-serif;">Sum:</span>
        <span id="total-sum" class="price-box">0.00 kr</span>
        </div>

        <div id="add-items">
        <br>
        <i id="show-items-list" class="fa fa-plus-square" style="font-size:20px; color:${this.foreground};display:none;cursor: pointer;margin-right: 10px;" title="Tilføj menu!"></i>        
        <i id="show-mails" class="fa fa-envelope" style="font-size:20px; color:${this.foreground};display:none;cursor: pointer;margin-right: 10px;" title="Send mail til kunden!"></i>        
        <i id="notify-kitchen" class="fa fa-paper-plane" style="font-size:20px; color:${this.foreground};display:none;cursor: pointer;margin-right: 10px;" title="Send en besked til køkkenet!";margin-right: 10px;></i>
        <i id="ingredients-info" class="fa fa-info-circle" style="font-size:20px; color:${this.foreground};display:none;cursor: pointer;margin-right: 10px;" title="ingredienser!"></i>        
        <i id="move-bon" class="fa fa-exchange fa-rotate-90" style="font-size:20px; color:${this.foreground};display:none;cursor: pointer;margin-right: 10px;" title="Flytte til anden server!"></i>
        <select id="other-bon-instances" style="display:none;"></select>
        <div id="items-list" style="display:none"></div>
        <div id="mail-list" style="display:none"></div>
        </div>
        


    </div>    
    `



    constructor(div,isEditable,externalItemList) {
        if(typeof div==="string") {
            this.myDiv = document.querySelector(div);
        } else {
            this.myDiv=div;
        }
        this.myDiv.innerHTML = this.div;

        if(isEditable) {
            let itemslistElem;
            if(externalItemList) {
                itemslistElem=externalItemList;
            } else {
                itemslistElem = this.myDiv.querySelector("#items-list");
            }
            

            this.myItemsList = new ItemsList(itemslistElem);
            this.myItemsList.SetOnItemClick((item) => {
                this.configureOrder(1, item.name, "", item.id, item.price, item.cost_price, item.category);
            });
            
            this.myDiv.querySelector("#show-items-list").style.display="";
            this.myDiv.querySelector("#show-items-list").onclick=() => {
                if(itemslistElem.style.display=="none") {
                    itemslistElem.style.display=""
                } else {
                    itemslistElem.style.display="none";
                }
            }

            let self=this;
            this.myDiv.querySelector("#notify-kitchen").style.display="";
            this.myDiv.querySelector("#notify-kitchen").onclick=() => {
                MessageBox.popup("Vil du sende en besked til køkkenet?", {
                    b1: {
                      text: "Ja",
                      onclick: (message) => {
                        if(self.bonId) {
                          Globals.myNotifier.notify(self.bonId,message);
                        } else {
                          alert("Gem venligst først!");
                        }
                       
          
                      },
                    },
                    b2: { text: "Nej" },
                  },{label:"extra besked"});
            }



        }
        this.isEditable=isEditable;

        this.myIngredientList=new IngredientList();

        this.myDiv.querySelector("#ingredients-info").style.display="";
        this.myDiv.querySelector("#ingredients-info").onclick=() => {
            this.myIngredientList.show(this.bonId,this.getOrders());
        }




        this.myRepo = new BonRepository();


        this.myOrders=new DraggableList(this.myDiv.querySelector("#orders"),true);

        let orderConfigDiv=`
        <div id="order-config" class="order-config-style" style="width:350px;background:${this.background};padding:10px;border-radius: 10px;border: 2px solid ${this.foreground};">   
            <div class="order-config-style">
            <span><i id="plus" class="plus-minus fa fa-plus-square" style="font-size:30px"></i>&nbsp;&nbsp;<i id="minus" class="plus-minus fa fa-minus-square" style="font-size:30px"></i><input type="text" class="nr-of" size="3" name="quantity" id="quantity" "value="1"></span>    
            <span class="x-sign">X</span><span class="order-name" id="order-name"></span>
            </div><br>
            <textarea name="comment" placeholder="Extra info" id="comment" ></textarea>
            <a id="extra-link" style="padding-left" href="https://by-expressen.dk/" target="_blank">By-Expressen</a>
            <input type="hidden" id="item-id" value="-1">
            <input type="hidden" id="izettle-product-id" value="">
            <input type="hidden" id="price" value="0">
            <input type="hidden" id="cost_price" value="0">
            <input type="hidden" id="category" value="">
            <br>
            <div>
                <div style="margin-top:6px">
                    <input type="button" id="save" value="Gem">
                    <input type="button" id="delete" value="Fjern">
                    <span>&nbsp;&nbsp;</span>
                    <input type="button" id="cancel" value="Afbryd">
            </div>
    
        </div> 
        `;
        this.orderConfig=document.createElement("div");


        this.orderConfig.innerHTML=orderConfigDiv;
        let self=this;

        this.orderConfig.querySelector("#plus").onclick=(e)=>{
            let currVal=self.orderConfig.querySelector("#quantity").value;
            let newVal=parseInt(currVal)+1;
            if(isNaN(newVal)) newVal=0;
            self.orderConfig.querySelector("#quantity").value=newVal;
        };
        

        this.orderConfig.querySelector("#minus").onclick=(e)=>{
            let currVal=self.orderConfig.querySelector("#quantity").value;
            let newVal=parseInt(currVal)-1;
            if(isNaN(newVal)) newVal=0;
            self.orderConfig.querySelector("#quantity").value=newVal;
        };

        this.orderConfig.querySelector("#save").onclick=(e)=>{
            let quantity=self.orderConfig.querySelector("#quantity").value;
            let comment=self.orderConfig.querySelector("#comment").value;
            let orderName=self.orderConfig.querySelector("#order-name").innerText;
            let id=self.orderConfig.querySelector("#item-id").value;
            let price=self.orderConfig.querySelector("#price").value;
            let cost_price=self.orderConfig.querySelector("#cost_price").value;
            let category=self.orderConfig.querySelector("#category").value;
            let izettle_product_id=self.orderConfig.querySelector("#izettle-product-id").value;
            if(izettle_product_id=="null") {izettle_product_id=null;}
            if(self.currentOrder) {
                self.currentOrder.querySelector("#quantity").innerText=quantity;
                self.currentOrder.querySelector("#total-cost").innerText=(quantity*price).toFixed(2)+ (this.showCostPrice?" ("+(quantity*cost_price).toFixed(2)+")":"") + " kr";
                if(self.hidePrice) {
                    self.currentOrder.querySelector("#total-cost").style.display="none";
                }
                self.currentOrder.querySelector("#comment").innerText=comment;
                if(comment!=="") {
                    self.currentOrder.querySelector("#comment").style.display="";
                } else {
                    self.currentOrder.querySelector("#comment").style.display="none";

                }
            

            } else {
                self.addOrder(quantity,orderName,comment,id,price,cost_price,category,izettle_product_id);
            }

            self.orderConfigPopup.hide();
            self.currentOrder=undefined;
            self.updateTotalSum();

            self.onUpdateOrder && self.onUpdateOrder();
        };


        this.orderConfig.querySelector("#delete").onclick=(e)=>{  
            if(self.currentOrder) {
                self.myOrders.removeElem(self.currentOrder);
                self.currentOrder=undefined;
                self.updateTotalSum();
                self.onUpdateOrder && self.onUpdateOrder();
            }
            self.orderConfigPopup.hide();
        };  
        
        this.orderConfig.querySelector("#cancel").onclick=(e)=>{  
            self.orderConfigPopup.hide();
            self.currentOrder=undefined;
        };         


        this.orderConfigPopup=new ModalPopup();


    }

    showMails(externalDiv) {
        let mailElem;
        if(externalDiv) {
            if(typeof externalDiv==="string") {
                mailElem = document.querySelector(externalDiv);
            } else {
                mailElem=externalDiv;
            }
        } else {
            mailElem=this.myDiv.querySelector("#mail-list");
        }

        this.chatDiv=mailElem;

        this.chat=new ChatClass(mailElem);
        this.chat.setIdentity("Bon");
        this.chat.onSend((message)=>{
            let to=this.myDiv.querySelector("#email").innerHTML;
            let bonId=this.bonId;

            message+="\n\n"+this.chat.getQoutedHistory(true,1);
            this.myRepo.sendBonMail(bonId,to,message,(result,data, status, xhr)=>{
                if(!result) {
                    alert("Kan ikke sende e-mail");
                }
            })

            console.log("sending "+message+" to "+to+" subj:"+bonId);

        })


        this.chat.onSelectTemplate((template)=>{
            let fun=(callback)=>{
                Globals.myConfig.getMessages(messages=>{
                    let message=messages.find(m=>(m.name===template));
                    let text=this.bonToText(message?.message);
                    callback(text);
                })

            }
            return fun;
        });


        let self=this;
        this.myDiv.querySelector("#show-mails").style.display="";
        this.myDiv.querySelector("#show-mails").onclick=() => {
            if(mailElem.style.display=="none") {
                if(!self.bonId) {
                    alert("Gem venligst først");
                    return;
                }
                if(self.myDiv.querySelector("#email").innerHTML==="") {
                    alert("E-mailadresse mangler!"); 
                    return;  
                }
                mailElem.style.display=""
                this.chat.clear();
                let p=MessageBox.popup("Henter mails...");
                this.chat.isAllowedToSend();
                this.chat.uppdateTemplates();
                this.myRepo.getBonMails(self.bonId,(mails)=>{
                    p.hide();
                    mails.forEach(m=>{   
                        this.chat.addMessage(m.subject.startsWith("SENT:")?"right":"left",m.from,new Date(m.date),m.message);
                    })
                    Globals.myMails.markAsRead(self.bonId);
                    this.onMailSeen && this.onMailSeen(this.bonId);
                });
                this.chatDiv.scrollIntoView();
            } else {
                mailElem.style.display="none";
            }
        }



    }

    showMailDialogue(text) {
        if(this.chatDiv.style.display==="none") {
            this.myDiv.querySelector("#show-mails").onclick();
        }
        this.chat.prepareMessage(text);

    }

    setOnMailSeen(fun) {
        this.onMailSeen=fun;
    }

    bonToText(template,values) {
        if(values===undefined) {
            values={};
            let orderList=this.getOrders(); 
            values.orderWithPrices=orderList.orders.map(o=>(`${o.quantity} X ${o.name} (${o.price*o.quantity} kr)${o.comment!==""?"  \n\t"+o.comment:""}`)).join("\n");
            values.orders=orderList.orders.map(o=>(`${o.quantity} X ${o.name}${o.comment!==""?"  \n\t"+o.comment:""}`)).join("\n");
            values.totSum=orderList.totPrice;
            values.deliveryDate=this.myDiv.querySelector("#date").innerHTML;
            values.deliveryTime=this.myDiv.querySelector("#time").innerHTML;
            values.deliveryAdr=this.myDiv.querySelector("#address").innerText;
            values.deliveryStreet=this.deliveryAdressDetails.street_name;
            values.deliveryStreetNr=this.deliveryAdressDetails.street_nr;
            values.deliveryZipCode=this.deliveryAdressDetails.zip_code;
            values.deliveryCity=this.deliveryAdressDetails.city;
            values.foreName=this.myDiv.querySelector("#forename").innerText;
            values.surName=this.myDiv.querySelector("#surname").innerText;
            values.pax=this.myDiv.querySelector("#pax").innerHTML;
            values.bonId=this.bonId;
            values.bonPrefix=Globals.bonPrefix;

        }

        return Helper.replaceAllFromValues(template,values);

    }



    /*
    bonToText(withPrices) {  
        let orderList=this.getOrders(); 
        let orders; 
        if(withPrices) {        
            orders=orderList.orders.map(o=>(`${o.quantity} X ${o.name} (${o.price*o.quantity} kr)${o.comment!==""?"  \n\t"+o.comment:""}`));
        } else {
            orders=orderList.orders.map(o=>(`${o.quantity} X ${o.name}${o.comment!==""?"  \n\t"+o.comment:""}`));
        }
        let orderText=orders.join("\n");
        let totSum=`Sum:${orderList.totPrice} kr`;
        let deliveryDate=`${this.myDiv.querySelector("#date").innerHTML} ${this.myDiv.querySelector("#time").innerHTML}`;
        let deliveryAdr=this.myDiv.querySelector("#address").innerText;

        let text="----------------------";
        text+="\n"+"Tidspunkt:";
        text+="\n "+deliveryDate;
        text+="\n\n"+"Leveringsadresse:";
        text+="\n"+deliveryAdr;
        text+="\n\n"+"Bestilling:";
        text+="\n"+orderText;
        if(withPrices) {
            text+="\n"+totSum;
        }
        text+="\n";
        text+="----------------------";
        text+="\n";
        return text;

    }
    */

    saveOrders() {
        Globals.myConfig.myRepo.updateOrders(this.bonId, this.getOrders().orders);
    }

    setOnUpdateOrder(fun) {
        this.onUpdateOrder=fun;
    }

    addStatuses(statuses,onclick) {
        let statusRow=this.myDiv.querySelector("#status-row");
        let statusStyle=`
        float: left;
        border: 1px solid black;
        margin-right: 3px;
        border-radius: 6px;
        padding-left: 1px;
        padding-right: 1px;
        margin-bottom:2px;
        margin-top:2px;
        cursor:pointer;        
        `
        statuses.forEach(s=> {
            let div=document.createElement("div");
            div.style.cssText=statusStyle;
            div.innerText=Globals.Statuses[s].label;
            div.onclick=(ev)=>{
                Array.from(statusRow.children).forEach(c => {
                    if(c!=ev.target) {
                        c.style.background="";
                    }
                })
                if(ev.target.style.background=="") {
                    ev.target.style.background=Globals.Statuses[s].color;
                    onclick && onclick(s,"on");
                } else {
                    ev.target.style.background="";
                    onclick && onclick(s,"off");
                }
            }
            statusRow.appendChild(div);
            if(s==this.status) {
                div.style.background=Globals.Statuses[s].color;
            }
        })
        let endDiv=document.createElement("div");
        endDiv.style.clear="left";
        statusRow.appendChild(endDiv);


    }

    initFromBon(bon,orders) {
        this.clear();
        this.setBonId(bon.id);
        this.setCustomerInfo(bon);
        this.setDeliveryAddr(bon);
        this.setPaxAndKitchenSelects(bon);
        this.setDeliveryDate(bon.delivery_date);
        this.setKitchenInfo(bon.kitchen_info);
        this.setPaymentType(bon.payment_type);
        
        this.status=bon.status;

        if(orders) {
            orders.forEach(o=>{
                this.addOrder(o.quantity,o.name,o.special_request,o.item_id,o.price,o.cost_price,o.category,o.izettle_product_id);
            })
            this.updateTotalSum();
        }
        this.myItemsList && this.myItemsList.updateItems(bon.price_category);


  
    }




    addOrder(quantity,name,comment,id,price,cost_price,category,izettle_product_id) {
        let totalCost=(quantity*price).toFixed(2);
        let totalCostPrice=(quantity*cost_price).toFixed(2);
        let tmp=`
        <span id="quantity" class="nr-of">${quantity}</span><span class="x-sign">X</span><span id="order-name" class="order-name">${name}</span><span id="total-cost" class="price-box">${totalCost} ${this.showCostPrice?" ("+totalCostPrice+")":""} kr</span><br>
        <span id="comment" class="order-info">${comment}</span>
        <input type="hidden" id="item-id" value="${id}">
        <input type="hidden" id="izettle-product-id" value="${izettle_product_id}">
        
        <input type="hidden" id="price" value="${price}">
        <input type="hidden" id="cost_price" value="${cost_price}">
        <input type="hidden" id="category" value="${category}">
        `;

        let order=document.createElement("div"); 
        order.classList.add("order");
        order.innerHTML=tmp;
        if(this.hidePrice) {
            order.querySelector("#total-cost").style.display="none";
        }

        let self=this;
        if (this.isEditable) {
            order.onclick = () => {

                this.orderConfig.querySelector("#quantity").value = order.querySelector("#quantity").innerText;
                this.orderConfig.querySelector("#order-name").innerHTML = order.querySelector("#order-name").innerText;
                this.orderConfig.querySelector("#comment").value = order.querySelector("#comment").innerText;
                this.orderConfig.querySelector("#item-id").value = order.querySelector("#item-id").value;
                this.orderConfig.querySelector("#price").value = order.querySelector("#price").value;
                this.orderConfig.querySelector("#cost_price").value = order.querySelector("#cost_price").value;
                this.orderConfig.querySelector("#category").value = order.querySelector("#category").value;

                let extra = this._getExtraAttributes(order.querySelector("#order-name").innerText);
                if (extra && extra.link) {
                    this.orderConfig.querySelector("#extra-link").style.display = "";
                    this.orderConfig.querySelector("#extra-link").setAttribute("href", extra.link.url);
                    this.orderConfig.querySelector("#extra-link").innerHtml = extra.link.label;
                    this.orderConfig.querySelector("#extra-link").onclick = this.orderConfig.querySelector("#save").onclick;
                } else {
                    this.orderConfig.querySelector("#extra-link").style.display = "none";
                }

                self.orderConfigPopup.show(self.orderConfig);
                self.currentOrder = order;
            }
        }

        if(comment==="") {
            order.querySelector("#comment").style.display="none";
        }

        this.myOrders.addElem(order);
        this._sortOrders();

    }



    _sortOrders() {
        let allOthers=Globals.BonStripOrder.indexOf("*");
        let orderPos={};
        Globals.BonStripOrder.forEach((e,i)=>{
            orderPos[e]=i;
        });

        let sortFun=(a,b) => {
            let aCategory=a.querySelector("#category").value;
            let bCategory=b.querySelector("#category").value;
            let aPos=orderPos[aCategory]!==undefined?orderPos[aCategory]:allOthers;
            let bPos=orderPos[bCategory]!==undefined?orderPos[bCategory]:allOthers;
            return aPos-bPos;

        }
        this.myOrders.sort(sortFun);

    }

    _getExtraAttributes(itemName) {
        let result=null;
        Object.keys(Globals.AttributesForItems).forEach(k=>{
            if(itemName.match(new RegExp(k,"i"))) {
                result=Globals.AttributesForItems[k];
            }
        })
        return result;
    }

    configureOrder(quantity,name,comment,itemId,price,cost_price,category) {
        this.orderConfig.querySelector("#quantity").value=quantity;
        this.orderConfig.querySelector("#order-name").innerHTML=name;
        this.orderConfig.querySelector("#comment").value="";
        this.orderConfigPopup.show(this.orderConfig);
        this.orderConfig.querySelector("#item-id").value=itemId;
        this.orderConfig.querySelector("#price").value=price;
        this.orderConfig.querySelector("#cost_price").value=cost_price;
        this.orderConfig.querySelector("#category").value=category;

        let extra=this._getExtraAttributes(name);
        if(extra && extra.link) {
            this.orderConfig.querySelector("#extra-link").style.display="";
            this.orderConfig.querySelector("#extra-link").setAttribute("href",extra.link.url);
            this.orderConfig.querySelector("#extra-link").innerHtml=extra.link.label;
            this.orderConfig.querySelector("#extra-link").onclick=this.orderConfig.querySelector("#save").onclick;
        } else {
            this.orderConfig.querySelector("#extra-link").style.display="none";
        }

    }

    updatePricesFromCategory(category) {
        this.myItemsList && this.myItemsList.updateItems(category);
        Array.from(this.myOrders.getElems()).forEach(order=>{
            let id=order.querySelector("#item-id").value;
            let quantity=order.querySelector("#quantity").textContent;
            let newPrice=Globals.myConfig.price_lookup[id].price_categories[category];
            //Maybe update cost_price also
            order.querySelector("#price").value=newPrice;
            order.querySelector("#total-cost").innerText=(quantity*newPrice).toFixed(2)+" kr";
            if(this.hidePrice) {
                order.querySelector("#total-cost").style.display="none";
            }            

        });
        this.updateTotalSum();

    }

    hidePrices() {
        this.hidePrice=true;
        this.myDiv.querySelector("#orders").querySelectorAll("#total-cost").forEach(e=>{
            e.style.display="none";
        })


        if(this.getPaymentType()!="Kontant") {
            this.myDiv.querySelector("#total-sum-row").style.display="none";
        }
    }

    showCostPrices(trueFalse) {
        this.showCostPrice=trueFalse;
    }

    getOrders() {
        let totCostPrice=0;
        let totPrice=0;
        let orders=Array.from(this.myOrders.getElems()).map(order=>{
            let costPrice=order.querySelector("#cost_price").value;
            costPrice!=undefined?Number(costPrice):0;
            let price=order.querySelector("#price").value;
            price!=undefined?Number(price):0;

            let quantity=order.querySelector("#quantity").innerText;
            quantity=quantity!=undefined?Number(quantity):1;
            totCostPrice+=costPrice*quantity;
            totPrice+=price*quantity;
            let id=order.querySelector("#item-id").value;
            if(id=="null") {
                id=null;
            }
            let izettle_product_id=order.querySelector("#izettle-product-id").value;
            if(izettle_product_id=="null") {
                izettle_product_id=null;
            }
           return {
            quantity:order.querySelector("#quantity").innerText,
            name:order.querySelector("#order-name").innerText,
            comment:order.querySelector("#comment").innerText,
            id:id,
            izettle_product_id:izettle_product_id,
            price:price,
            cost_price:costPrice
            }
        })
        return {
            orders:orders,
            totPrice:totPrice.toFixed(2),
            totCostPrice:totCostPrice.toFixed(2)
        }

    }

    getPaymentType() {
        return this.myDiv.querySelector("#payment-type").innerHTML; 
    }

    updateTotalSum() {
        let totSums=this.calculateTotalSum();
        let tot=`${totSums.totalCost.toFixed(2)} ${this.showCostPrice?" ("+totSums.totalCostPrice.toFixed(2)+")":""} kr`
        this.myDiv.querySelector("#total-sum").innerHTML=tot;
    }



    calculateTotalSum() {
        let totalCost=0;
        let totalCostPrice=0;
        this.getOrders().orders.forEach(order=>{
            let cost=(order.quantity*order.price);
            if(isNaN(cost)) {cost=0};
            totalCost+=cost;
            let costPrice=(order.quantity*order.cost_price);
            if(isNaN(costPrice)) {costPrice=0};
            totalCostPrice+=costPrice;

        })
        return {totalCost:totalCost,totalCostPrice:totalCostPrice}
        

    }


    setBonId(bonId) {
        if(bonId=="") {
            this.myDiv.querySelector("#bon-id").innerHTML="";    
        } else {
            this.myDiv.querySelector("#bon-id").innerHTML="#"+bonId;
        }
        this.bonId=bonId;
    }

    setCustomerInfo(bon) {
        //let name=bon.customer.forename+" "+bon.customer.surname;
        //this.myDiv.querySelector("#customer").innerHTML=name;
        this.myDiv.querySelector("#forename").innerHTML=bon.customer.forename;
        this.myDiv.querySelector("#surname").innerHTML=bon.customer.surname;

        this.myDiv.querySelector("#email").innerHTML=bon.customer.email;
        this.myDiv.querySelector("#phonenr").innerHTML=bon.customer.phone_nr;
    }
    setDeliveryAddr(bon) {
        let addr;
        if(bon.customer_collects) {
            addr=this.CUSTOMER_COLLECTS_TXT;
        } else {
            addr=`
            ${bon.delivery_address.street_name2} ${bon.delivery_address.street_name2?"<br>":""}
            ${bon.delivery_address.street_name} ${bon.delivery_address.street_nr}<br>
            ${bon.delivery_address.zip_code} ${bon.delivery_address.city}
            `;
    
        }
        this.myDiv.querySelector("#address").innerHTML=addr;
        //We could need these values separate when generating mail messages. 
        this.deliveryAdressDetails=bon.delivery_address;
    }
    setDeliveryDate(deliveryDate) {
        let date=new Date(deliveryDate).toLocaleDateString();
        let time=new Date(deliveryDate).toLocaleTimeString();
        this.myDiv.querySelector("#date").innerHTML=date;
        this.myDiv.querySelector("#time").innerHTML=time;
    }

    setKitchenInfo(text) {
        text=text.replaceAll("\n","<br>");
    
        if(text!=="") {
            this.myDiv.querySelector("#kitchen-field").style.display="";
            this.myDiv.querySelector("#kitchenInfoText").innerHTML=text;
        } else {
            this.myDiv.querySelector("#kitchen-field").style.display="none";

        }
    }

    setPaymentType(pType) {
        this.isProductionBon(pType);
        this.myDiv.querySelector("#payment-type").innerHTML=pType;
    }

    setPaxAndKitchenSelects(bon) {
        this.myDiv.querySelector("#pax").innerHTML=bon.nr_of_servings;
        this.myDiv.querySelector("#kitchen-selects").checked=bon.kitchen_selects;
    }


    updateNameOnChange(forenameElem,surnameElem) {
        let f=()=> {

            this.myDiv.querySelector("#forename").innerHTML=forenameElem.value;
            this.myDiv.querySelector("#surname").innerHTML=surnameElem.value;

        }
        forenameElem.oninput=f;
        surnameElem.oninput=f;
    }


    updateKitchenInfoOnChange(kitchenInfoElem) {
        let self=this;
        let f=()=> {

            let text=kitchenInfoElem.value;
            self.setKitchenInfo(text);
        }
        kitchenInfoElem.oninput=f;

    }    

    updateDeliveryAdrOnChange(streetNameElem,streetName2Elem,streetNrElem,zipCodeElem,cityElem,customerCollectsElem) {
        let f=()=> {
            let addr;
            if(customerCollectsElem.checked) {
                addr=this.CUSTOMER_COLLECTS_TXT;
            } else {
                addr=`
                ${streetName2Elem.value} ${streetName2Elem.value?"<br>":""}
                ${streetNameElem.value} ${streetNrElem.value}<br>
                ${zipCodeElem.value} ${cityElem.value}
                `;    
            }

            this.myDiv.querySelector("#address").innerHTML=addr;
            //We could need these values separate when generating mail messages. 
            this.deliveryAdressDetails={};
            this.deliveryAdressDetails.street_name=streetNameElem.value;
            this.deliveryAdressDetails.street_nr=streetNrElem.value;
            this.deliveryAdressDetails.zip_code=zipCodeElem.value;
            this.deliveryAdressDetails.city=cityElem.value;


        }
        streetNameElem.oninput=f;
        streetName2Elem.oninput=f;
        streetNrElem.oninput=f;
        zipCodeElem.oninput=f;
        cityElem.oninput=f;
        customerCollectsElem.onchange=f;
    }

    updateMailAndPhoneNrOnChange(mailElem,phoneNrElem) {
        let f=()=> {
            this.myDiv.querySelector("#email").innerHTML=mailElem.value;
            this.myDiv.querySelector("#phonenr").innerHTML=phoneNrElem.value;

        }
        mailElem.oninput=f;
        phoneNrElem.oninput=f;
    }

    updateDateAndTimeOnChange(dateElem,timeElem) {
        let f=()=> {
            this.myDiv.querySelector("#date").innerHTML=dateElem.value;
            this.myDiv.querySelector("#time").innerHTML=timeElem.value;

        }
        dateElem.oninput=f;
        timeElem.oninput=f;
    }

    updatePaxOnChange(paxElem) {
        let f=()=> {
            this.myDiv.querySelector("#pax").innerHTML=paxElem.value;
        }
        paxElem.oninput=f;
    }

    updatePaymentTypeOnChange(paymentElem,extra) {
        let f=()=> {
            this.setPaymentType(paymentElem.value);
        }
        if(extra) {
            paymentElem.onchange=()=>{
                f(),extra()};
        } else {
            paymentElem.onchange=f;    
        }
    }

    updateKitchenSelectsOnChange(kitchenSelectsElem) {
        let f=()=> {
            this.myDiv.querySelector("#kitchen-selects").checked=kitchenSelectsElem.checked;
        }
        kitchenSelectsElem.onchange=f;
    }    

    clear() {
        this.myDiv.querySelectorAll(".bonstrip-items").forEach(e=>{
            e.innerText="";
        })
        this.myOrders.clear();
        this.updateTotalSum();
        if(this.chatDiv) {
            this.chatDiv.style.display="none";

        }
    }

    addOrders(otherOrders,factor=1) {
        let orders=this.getOrders().orders;
        this.myOrders.clear();
        this.updateTotalSum();


        otherOrders.forEach(o=>{
            o.comment=o.special_request; //in DB it's called special_request but in bon it's called comment, my misstake :-/
            o.id=o.item_id
            let existing=orders.find(e=>(((e.id!=null && e.id==o.id) ||(e.id==null && e.izettle_product_id==o.izettle_product_id)) && e.comment==o.comment))
            if(existing) {
                existing.quantity=Number(existing.quantity)+Number(o.quantity)*factor;
            } else {
                orders.push(o);
            }

        })

        if(orders) {
            orders.forEach(o=>{
                if(o.quantity>0) {
                    this.addOrder(o.quantity,o.name,o.comment,o.id,o.price,o.cost_price,o.category,o.izettle_product_id);
                }
            })
            this.updateTotalSum();
        }

    }

    isMoveable(bool,moveFunction,bonInstances) {
        if(bool) {
            this.myDiv.querySelector("#move-bon").style.display="";
            this.myDiv.querySelector("#move-bon").onclick=() => {
                let otherBonInstances=this.myDiv.querySelector("#other-bon-instances");
                otherBonInstances.onchange=(e)=>{
                    let bonPrefix=e.target.value;
                    let bonServer=otherBonInstances.options[otherBonInstances.selectedIndex].text;
                    setTimeout(()=>{ //so select element changes before confirm window is seen.
                        if(confirm(`Vil du flytte bon ${this.bonId} til Bon-server ${bonServer}?`)) {
                            this.myRepo.moveBon(this.bonId,bonPrefix,false,(status,data)=>{
                                moveFunction(status,data);
                                otherBonInstances.style.display="none";
                            })
                            
                        }
                    },100);
                    
                    
                };

                if(otherBonInstances.style.display==="none") {
                    let instances=[];
                    if(bonInstances instanceof Function) {
                        instances=bonInstances();
                    } else {
                        instances=bonInstances;
                    }
                    otherBonInstances.style.display="";
                    otherBonInstances.innerHTML="";
                    let f=document.createElement("option");
                    f.text="vælg Bon-server...";
                    f.style.display="none";
                    otherBonInstances.add(f);
                    instances.forEach(i=>{
                        let o=document.createElement("option");
                        o.text=i.instance;
                        o.value=i.prefix;
                        otherBonInstances.add(o);
                    });

                } else {
                    otherBonInstances.style.display="none";
                }
            }           
        } else {
            this.myDiv.querySelector("#move-bon").style.display="none";
            this.myDiv.querySelector("#other-bon-instances").style.display="none";
        }
    }


    isProductionBon(payment_type) {

        let bonDiv=this.myDiv.querySelector("#bon");
        if(payment_type=="Produktion") {
            bonDiv.style.background="lightblue";
        } else {
            bonDiv.style.background=this.background;
        }
    }

}