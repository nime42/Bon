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
        font-style: italic;
        font-weight: bold;
        font-size: large;
        font-family: cursive;
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
        padding-bottom: 8px;
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
        padding:2px;
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
        <fieldset>
            <legend>Bon-id <i class="fa fa-caret-up" onclick="Helper.expandShrinkField(this)"></i></legend>
                <div id="bon-id" class="bonstrip-items field-content"></div>
        </fieldset>
        <fieldset>
            <legend>Navn <i class="fa fa-caret-up" onclick="Helper.expandShrinkField(this)"></i></legend>
            <div class="field-content">
            <div id="customer" class="bonstrip-items"></div>
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
            <legend>Kökken info</legend>
            <span id="kitchenInfoText"></span>
        </fieldset>

      

        <div id="orders"></div>
        <br>
        <div>
        <span style="font-style: italic;font-weight: bold;font-family: sans-serif;">Sum:</span>
        <span id="total-sum" class="price-box">0.00 kr</span>
        </div>

        <div id="add-items" style="display:none">
        <br>
        <i id="show-items-list" class="fa fa-plus-square" style="font-size:20px; color:${this.foreground}"></i>        
        <div id="items-list" style="display:none"/>
        </div>
        


    </div>    
    `



    constructor(div,isEditable,instantSave,externalItemList) {
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
            
            this.myDiv.querySelector("#add-items").style.display="";
            this.myDiv.querySelector("#show-items-list").onclick=() => {
                if(itemslistElem.style.display=="none") {
                    itemslistElem.style.display=""
                } else {
                    itemslistElem.style.display="none";
                }
            }

        }

        if (instantSave) {
            this.saveOrders = () => {
                Globals.myConfig.myRepo.updateOrders(this.bonId, this.getOrders().orders);

            }
        }


        this.myOrders=new DraggableList(this.myDiv.querySelector("#orders"),true);

        let orderConfigDiv=`
        <div id="order-config" class="order-config-style" style="width:350px;background:${this.background};padding:10px;border-radius: 10px;border: 2px solid ${this.foreground};">   
            <div class="order-config-style">
            <span><i id="plus" class="plus-minus fa fa-plus-square" style="font-size:20px"></i><i id="minus" class="plus-minus fa fa-minus-square" style="font-size:20px"></i><input type="text" class="nr-of" size="3" name="quantity" id="quantity" "value="1"></span>    
            <span class="x-sign">X</span><span class="order-name" id="order-name"></span>
            </div><br>
            <textarea name="comment" placeholder="Extra info" id="comment" ></textarea>
            <a id="extra-link" style="padding-left" href="https://by-expressen.dk/" target="_blank">By-Expressen</a>
            <input type="hidden" id="item-id" value="-1">
            <input type="hidden" id="price" value="0">
            <input type="hidden" id="cost_price" value="0">
            <input type="hidden" id="category" value="">
            <br>
            <div>
                <div style="margin-top:6px">
                    <input type="button" id="save" value="Spara">
                    <input type="button" id="delete" value="Ta bort">
                    <span>&nbsp;&nbsp;</span>
                    <input type="button" id="cancel" value="Avbryt">
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
            if(self.currentOrder) {
                self.currentOrder.querySelector("#quantity").innerText=quantity;
                self.currentOrder.querySelector("#total-cost").innerText=(quantity*price)+" kr";
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
                self.addOrder(quantity,orderName,comment,id,price,cost_price,category);
            }

            self.orderConfigPopup.hide();
            self.currentOrder=undefined;
            self.updateTotalSum();

            self.saveOrders && self.saveOrders();
        };


        this.orderConfig.querySelector("#delete").onclick=(e)=>{  
            if(self.currentOrder) {
                self.myOrders.removeElem(self.currentOrder);
                self.currentOrder=undefined;
                self.updateTotalSum();
                self.saveOrders && self.saveOrders();
            }
            self.orderConfigPopup.hide();
        };  
        
        this.orderConfig.querySelector("#cancel").onclick=(e)=>{  
            self.orderConfigPopup.hide();
            self.currentOrder=undefined;
        };         


        this.orderConfigPopup=new ModalPopup();


    }

 
    initFromBon(bon,orders) {
        this.setBonId(bon.id);
        this.setCustomerInfo(bon);
        this.setDeliveryAddr(bon);
        this.setPaxAndKitchenSelects(bon);
        this.setDeliveryDate(bon.delivery_date);
        this.setKitchenInfo(bon.kitchen_info);

        if(orders) {
            orders.forEach(o=>{
                this.addOrder(o.quantity,o.name,o.special_request,o.item_id,o.price,o.cost_price,o.category);
            })

        }
        this.updateTotalSum();

        this.makeEditable(bon);

    }

    makeEditable(bon) {

        let itemslistElem = this.myDiv.querySelector("#items-list");

        this.myItemsList = new ItemsList(itemslistElem);
        this.myItemsList.updateItems(bon.price_category);
        this.myItemsList.SetOnItemClick((item) => {
            this.configureOrder(1, item.name, "", item.id, item.price, item.cost_price, item.category);
        });
        
        this.myDiv.querySelector("#add-items").style.display="";
        this.myDiv.querySelector("#show-items-list").onclick=() => {
            if(itemslistElem.style.display=="none") {
                itemslistElem.style.display=""
            } else {
                itemslistElem.style.display="none";
            }
        }
        this.saveOrders=()=>{
            Globals.myConfig.myRepo.updateOrders(bon.id,this.getOrders().orders);

        }


    }


    addOrder(quantity,name,comment,id,price,cost_price,category) {
        let totalCost=(quantity*price).toFixed(2);
        let tmp=`
        <span id="quantity" class="nr-of">${quantity}</span><span class="x-sign">X</span><span id="order-name" class="order-name">${name}</span><span id="total-cost" class="price-box">${totalCost} kr</span><br>
        <span id="comment" class="order-info">${comment}</span>
        <input type="hidden" id="item-id" value="${id}">
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
        order.onclick=() => {

            this.orderConfig.querySelector("#quantity").value=order.querySelector("#quantity").innerText;
            this.orderConfig.querySelector("#order-name").innerHTML=order.querySelector("#order-name").innerText;
            this.orderConfig.querySelector("#comment").value=order.querySelector("#comment").innerText;
            this.orderConfig.querySelector("#item-id").value=order.querySelector("#item-id").value;
            this.orderConfig.querySelector("#price").value=order.querySelector("#price").value;
            this.orderConfig.querySelector("#cost_price").value=order.querySelector("#cost_price").value;
            this.orderConfig.querySelector("#category").value=order.querySelector("#category").value;

            let extra=this._getExtraAttributes(order.querySelector("#order-name").innerText);
            if(extra && extra.link) {
                this.orderConfig.querySelector("#extra-link").style.display="";
                this.orderConfig.querySelector("#extra-link").setAttribute("href",extra.link.url);
                this.orderConfig.querySelector("#extra-link").innerHtml=extra.link.label;
                this.orderConfig.querySelector("#extra-link").onclick=this.orderConfig.querySelector("#save").onclick;
            } else {
                this.orderConfig.querySelector("#extra-link").style.display="none";
            }          

            self.orderConfigPopup.show(self.orderConfig);
            self.currentOrder=order;
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
        console.log(orderPos);

        let sortFun=(a,b) => {
            let aCategory=a.querySelector("#category").value;
            let bCategory=b.querySelector("#category").value;
            let aPos=orderPos[aCategory]?orderPos[aCategory]:allOthers;
            let bPos=orderPos[bCategory]?orderPos[bCategory]:allOthers;
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
    }

    getOrders() {
        let totCostPrice=0;
        let totPrice=0;
        let orders=Array.from(this.myOrders.getElems()).map(order=>{
            let costPrice=order.querySelector("#cost_price").value;
            let price=order.querySelector("#price").value;

            totCostPrice+=costPrice!=undefined?costPrice:0;
            totPrice+=price!=undefined?price:0;
           return {
            quantity:order.querySelector("#quantity").innerText,
            name:order.querySelector("#order-name").innerText,
            comment:order.querySelector("#comment").innerText,
            id:order.querySelector("#item-id").value,
            price:price,
            cost_price:costPrice
            }
        })
        return {
            orders:orders,
            totPrice:totPrice,
            totCostPrice:totCostPrice
        }

    }

    updateTotalSum() {
        let totSum=this.calculateTotalSum();
        this.myDiv.querySelector("#total-sum").innerHTML=totSum.toFixed(2)+" kr";
    }

    calculateTotalSum() {
        let sum=this.getOrders().orders.reduce((tot,order)=>{
            let s=(order.quantity*order.price);
            if(isNaN(s)) {
                s=0;
            }
            return tot+s;
        },0);
        return sum;


    }


    setBonId(bonId) {
        if(bonId=="") {
            this.myDiv.querySelector("#bon-id").innerHTML="";    
        } else {
            this.myDiv.querySelector("#bon-id").innerHTML="#"+bonId;
        }
    }

    setCustomerInfo(bon) {
        let name=bon.customer.forename+" "+bon.customer.surname;
        this.myDiv.querySelector("#customer").innerHTML=name;
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

    setPaxAndKitchenSelects(bon) {
        this.myDiv.querySelector("#pax").innerHTML=bon.nr_of_servings;
        this.myDiv.querySelector("#kitchen-selects").checked=bon.kitchen_selects;
    }


    updateNameOnChange(forenameElem,surnameElem) {
        let f=()=> {
            let name=forenameElem.value+" "+surnameElem.value;
            this.myDiv.querySelector("#customer").innerHTML=name;
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

    updatePaymentTypeOnChange(paymentElem) {
        let f=()=> {
            this.myDiv.querySelector("#payment-type").innerHTML=paymentElem.value;
        }
        paymentElem.onchange=f;
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
    }


}