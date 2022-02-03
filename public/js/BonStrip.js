class BonStrip {
    background=Globals.background;
    foreground=Globals.foreground;
    shadowColor=Globals.shadowColor;

    style=`
    #bon {
        width:250px;
        height: 600px;
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
        font-size: 20px;
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

    #date,
    #time,
    #phonenr,
    #email {
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
        font-size:12px;
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
    font-size: 15px;
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
        font-size:20px;
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
            <legend>Bon-id</legend>
                <div id="bon-id"></div>
        </fieldset>
        <fieldset>
            <legend>Navn</legend>
            <div id="customer"></div>
            <div id="email"></div>
            <div id="phonenr"></div>
        </fieldset>
        <fieldset>
            <legend>Tidspunkt</legend>
            <div>
            <div id="date" style="float:left"></div>
            <div id="time" style="float:left"></div>
            </div>
        </fieldset>

        <fieldset>
            <legend>Leveringsadresse</legend>
            <div id="address">
            </div>
        </fieldset>
        <br>

        <div id="orders">

        </div>

    </div>    
    `



    constructor(div) {
        if(typeof div==="string") {
            this.myDiv = document.querySelector(div);
        } else {
            this.myDiv=div;
        }
        this.myDiv.innerHTML = this.div;


        this.myOrders=new DraggableList(this.myDiv.querySelector("#orders"),true);

        let orderConfigDiv=`
        <div id="order-config" class="order-config-style" style="width:350px;background:${this.background};padding:10px;border-radius: 10px;border: 2px solid ${this.foreground};">   
            <div class="order-config-style">
            <span><i id="plus" class="plus-minus fa fa-plus-square"></i><i id="minus" class="plus-minus fa fa-minus-square" ></i><input type="text" class="nr-of" size="3" name="quantity" id="quantity" "value="1"></span>    
            <span class="x-sign">X</span><span class="order-name" id="order-name">Frikadelle</span>
            </div><br>
            <textarea name="comment" placeholder="Extra info" id="comment" ></textarea>
            <input type="hidden" id="item-id" value="-1">
            <input type="hidden" id="cost-price" value="0">
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
            let costPrice=self.orderConfig.querySelector("#cost-price").value;
            if(self.currentOrder) {
                self.currentOrder.querySelector("#quantity").innerText=quantity;
                self.currentOrder.querySelector("#comment").innerText=comment;
                if(comment!=="") {
                    self.currentOrder.querySelector("#comment").style.display="";
                } else {
                    self.currentOrder.querySelector("#comment").style.display="none";

                }
            

            } else {
                self.addOrder(quantity,orderName,comment,id)
            }

            self.orderConfigPopup.hide();
            self.currentOrder=undefined;
        };


        this.orderConfig.querySelector("#delete").onclick=(e)=>{  
            if(self.currentOrder) {
                self.myOrders.removeElem(self.currentOrder);
                self.currentOrder=undefined;
            }
            self.orderConfigPopup.hide();
        };  
        
        this.orderConfig.querySelector("#cancel").onclick=(e)=>{  
            self.orderConfigPopup.hide();
            self.currentOrder=undefined;
        };         


        this.orderConfigPopup=new ModalPopup();

    }

 

    addOrder(quantity,name,comment,id,costPrice) {
        let tmp=`
        <span id="quantity" class="nr-of">${quantity}</span><span class="x-sign">X</span><span id="order-name" class="order-name">${name}</span><br>
        <span id="comment" class="order-info">${comment}</span>
        <input type="hidden" id="item-id" value="${id}">
        <input type="hidden" id="cost-price" value="${costPrice}">
        `;

        let order=document.createElement("div"); 
        order.classList.add("order");
        order.innerHTML=tmp;

        let self=this;
        order.onclick=() => {

            this.orderConfig.querySelector("#quantity").value=order.querySelector("#quantity").innerText;
            this.orderConfig.querySelector("#order-name").innerHTML=order.querySelector("#order-name").innerText;
            this.orderConfig.querySelector("#comment").value=order.querySelector("#comment").innerText;
            this.orderConfig.querySelector("#item-id").value=order.querySelector("#item-id").value;
            this.orderConfig.querySelector("#cost-price").value=order.querySelector("#cost-price").value;

            self.orderConfigPopup.show(self.orderConfig);
            self.currentOrder=order;
        }

        if(comment==="") {
            order.querySelector("#comment").style.display="none";
        }
        this.myOrders.addElem(order);
    }

    configureOrder(quantity,name,comment,itemId,costPrice) {
        this.orderConfig.querySelector("#quantity").value=quantity;
        this.orderConfig.querySelector("#order-name").innerHTML=name;
        this.orderConfig.querySelector("#comment").value="";
        this.orderConfigPopup.show(this.orderConfig);
        this.orderConfig.querySelector("#item-id").value=itemId;
        this.orderConfig.querySelector("#cost-price").value=costPrice;

    }

    getOrders() {
        let res=[];
        return Array.from(this.myOrders.getElems()).map(order=>{
           return {
            quantity:order.querySelector("#quantity").innerText,
            name:order.querySelector("#order-name").innerText,
            comment:order.querySelector("#comment").innerText,
            id:order.querySelector("#item-id").value,
            costPrice:order.querySelector("#cost-price").value
            }

        })

    }


    setBonId(bonId) {
        if(bonId=="") {
            this.myDiv.querySelector("#bon-id").innerHTML="";    
        } else {
            this.myDiv.querySelector("#bon-id").innerHTML="#"+bonId;
        }
    }


    updateNameOnChange(forenameElem,surnameElem) {
        let f=()=> {
            let name=forenameElem.value+" "+surnameElem.value;
            this.myDiv.querySelector("#customer").innerHTML=name;
        }
        forenameElem.oninput=f;
        surnameElem.oninput=f;
    }

    updateDeliveryAdrOnChange(streetNameElem,streetName2Elem,streetNrElem,zipCodeElem,cityElem) {
        let f=()=> {
            let addr=`
            ${streetName2Elem.value} ${streetName2Elem.value?"<br>":""}
            ${streetNameElem.value} ${streetNrElem.value}<br>
            ${zipCodeElem.value} ${cityElem.value}
            `;
            this.myDiv.querySelector("#address").innerHTML=addr;
        }
        streetNameElem.oninput=f;
        streetName2Elem.oninput=f;
        streetNrElem.oninput=f;
        zipCodeElem.oninput=f;
        cityElem.oninput=f;
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

    clear() {
        this.myOrders.clear();
    }


}