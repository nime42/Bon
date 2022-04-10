class BonForm {
    background=Globals.background;
    foreground=Globals.foreground;
    shadowColor=Globals.shadowColor;
    content=`
    <div style="background:${this.background};padding:20px;border-radius: 10px;border: 3px solid black;border-style: double; display: flex;flex-direction: row;">

    <style type="text/css">
        .form-style {

            font-family: sans-serif;
            font-size:medium;
            background:${this.background};
            padding: 10px;
            -webkit-border-radius: 10px;
            min-width:450px;
        }

        .form-style label {
            display: block;
            margin-bottom: 10px;
        }

        .form-style label>span {
            float: left;
            width: 100px;
            color: ${this.foreground};
            font-weight: bold;
            text-shadow: 1px 1px 1px #fff;
        }

        .form-style fieldset {
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

        .form-style fieldset legend {
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

        .form-style textarea {
            width: 250px;
        }

        .form-style input[type=text],
        .form-style input[type=date],
        .form-style input[type=datetime],
        .form-style input[type=number],
        .form-style input[type=search],
        .form-style input[type=time],
        .form-style input[type=url],
        .form-style input[type=email],
        .form-style input[type=tel],
        .form-style select,
        .form-style textarea {
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

        .form-style input[type=submit],
        .form-style input[type=button] {
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


        .form-style .input-icons {
            color: ${this.foreground};
            width: 5%;
        }

        .required {
            color: red;
            font-weight: normal;
        }
    </style>



    <form id="order" class="form-style" autocomplete="off">
    <div id="input-fields">
    <fieldset>
    <legend>Status</legend>
    <button type="button" id="${Globals.Statuses["new"].name}" class="status-button" style="float:left" data-active-background="${Globals.Statuses["new"].color}">${Globals.Statuses["new"].label}</button>
    <button type="button" id="${Globals.Statuses["needInfo"].name}" class="status-button" style="float:left" data-active-background="${Globals.Statuses["needInfo"].color}">${Globals.Statuses["needInfo"].label}</button>
    <button type="button" id="${Globals.Statuses["approved"].name}" class="status-button" style="float:left" data-active-background="${Globals.Statuses["approved"].color}">${Globals.Statuses["approved"].label}</button>
    <button type="button" id="${Globals.Statuses["preparing"].name}" class="status-button" style="float:left" data-active-background="${Globals.Statuses["preparing"].color}">${Globals.Statuses["preparing"].label}</button>
    <button type="button" id="${Globals.Statuses["done"].name}" class="status-button" style="float:left" data-active-background="${Globals.Statuses["done"].color}">${Globals.Statuses["done"].label}</button>
    <button type="button" id="${Globals.Statuses["delivered"].name}" class="status-button" style="float:left" data-active-background="${Globals.Statuses["delivered"].color}">${Globals.Statuses["delivered"].label}</button>
    <button type="button" id="${Globals.Statuses["invoiced"].name}" class="status-button" style="float:left" data-active-background="${Globals.Statuses["invoiced"].color}">${Globals.Statuses["invoiced"].label}</button>
    <button type="button" id="${Globals.Statuses["offer"].name}" class="status-button" style="float:left" data-active-background="${Globals.Statuses["offer"].color}">${Globals.Statuses["offer"].label}</button>
    </fieldset>
    <br>
    
    <div id="order-tabs" style=""></div>
    
    <div style="margin-top:6px">
        <input type="button" id="save" value="Spara">
        <input type="button" id="delete" value="Ta bort" class="for-update">
        <input type="button" id="copy" value="Kopier" class="for-update">
        <span>&nbsp;&nbsp;</span>
        <input type="button" id="cancel" value="Avbryt">

    </div>
    </div>
    </form>
    <div id="bon-strip">
    </div>
    </div> 
    `;

    customerInfoTab=`
    <fieldset>
    <legend>Leveringsdato</legend>
    <span>
        <input id="date" type="date" name="delivery_date">
        <input id="time" type="time" name="delivery_time">
    </span>
</fieldset>
<fieldset>
    <legend>Kunde</legend>

    <div style="margin-bottom:5px">
    <i class="fa fa-envelope icon input-icons"></i>
    <input id="email" type="email" name="email" autocomplete="nope" placeholder="Email">
    </div>


    <div style="margin-bottom:5px">
    <i class="fa fa-user icon input-icons"></i>
    <input autocomplete="nope" id="forename" type="text" name="forename" placeholder="Fornavn" style="width:25%">
    <input autocomplete="nope" id="surname" type="text" name="surname" placeholder="Efternavn" style="width:35%">
    </div>


    <div style="margin-bottom:5px">
    <i class="fa fa-phone icon input-icons"></i>
    <input id="phone_nr" type="tel" name="phone_nr" placeholder="Telefon">
    </div><br>

    <div style="margin-bottom:5px">
    <i class="fa fa-industry icon input-icons"></i>
    <input type="text" name="company_name" placeholder="Firma navn"> <i id="expand-company-info" class="fa fa-caret-down" style="font-size:25px; color: ${this.foreground};"></i>
    </div><br>
    
    <div id="company-info" style="padding: 5px 5px 5px 35px;;border: 1px solid  ${this.foreground};">
    
    <div style="margin-bottom:5px">
    <i class="fa fa-barcode icon input-icons"></i>
    <input type="text" name="ean_nr" placeholder="EAN" >
    </div>

    <fieldset style="max-width: min-content;min-width: fit-content;">
    <legend style="font-weight: bold;">Adresse</legend>
    <input type="text" name="company_street_name2" placeholder="C/O etc" autocomplete="nope"> <br>
    <span>
        <input type="text" name="company_street_name" placeholder="Gade" autocomplete="nope">
        <input type="text" name="company_street_nr" placeholder="nr" style="width:15%" autocomplete="nope">
    </span><br>
    <span>
        <input type="text" name="company_zip_code" placeholder="Postnr" style="width:25%" autocomplete="off">
        <input type="text" name="company_city" placeholder="By" autocomplete="nope">
    </span>
    </fieldset>

    </div>

    
</fieldset>
<fieldset>
<legend style="font-weight: bold;">Leveringsadresse </legend>
<span><input type="checkbox" id="customer_collects" name="customer_collects" value="1" style="float: left;margin-right: 5px;"><label for="customer_collects" style="float: left"> Afhentes</label></span><br><br>

<input type="text" id="street_name2" name="street_name2" placeholder="C/O etc" autocomplete="nope"> <br>
<span>
    <input type="text" id="street_name" name="street_name" placeholder="Gade" autocomplete="nope">
    <input type="text" id="street_nr" name="street_nr" placeholder="nr" style="width:15%" autocomplete="nope">
</span><br>
<span>
    <input type="text" id="zip_code" name="zip_code" placeholder="Postnr" style="width:25%" autocomplete="nope">
    <input type="text" id="city" name="city" placeholder="By" autocomplete="nope">
</span>
</fieldset>
<input type="hidden" name="bon_id"/>
</div>      
    `;

itemsTab=`
<span>
<br>
<div>
<span style="margin-right: 5px;color: ${this.foreground};">Pax:</span><input type="text" id="nr_of_servings" name="nr_of_servings" placeholder="Pax" autocomplete="nope" style="vertical-align: top; margin-right:5px;width: 10%;"> 
<select name="price_category" id="price-categories"></select>
<select name="payment_type" id="payment-types">
    <option disabled >Betaling...</option>
    <option>Kontant</option>
    <option>Faktura</option>
    <option>EAN nr</option>

</select>

  <br><br>
  <label style="color:${this.foreground}">
  Køkkenet vælger
  <input type="checkbox" id="kitchen_selects" name="kitchen_selects" value="1" style="margin-left: 5px;">
  </label>
  
  <br>
</div>
<textarea name="customer_info" placeholder="Kunde Önsker" rows="2" autocomplete="nope" ></textarea>
</span><br><br>


<div id="items" style=""></div>
<textarea name="kitchen_info" id="kitchen_info" placeholder="Kökken info" rows="2" autocomplete="nope" ></textarea>

`;

miscTab=`
<div>Øvrig info</div>
`;

    constructor(popupObj,calendarObj,repoObj) {
        this.myPopupObj=popupObj;
        this.myCalendarObj=calendarObj;
        this.myRepoObj=repoObj;
        this.myDiv=document.createElement("div");
        this.myDiv.innerHTML=this.content;
        let self=this;
        let form=this.myDiv.querySelector("#order");

        this.myTabs=new TabsClass(this.myDiv.querySelector("#order-tabs"));
        this.myTabs.addTab("Navn og Tid",this.customerInfoTab);
        this.myTabs.addTab("Varer",this.itemsTab);
        this.myTabs.addTab("Øvrig info",this.miscTab);

        //this.myItems=new VertTabsClass(this.myDiv.querySelector("#items"));
        this.myItems = new ItemsList(this.myDiv.querySelector("#items"));

        this.myBonStrip=new BonStrip(this.myDiv.querySelector("#bon-strip"));
        this.myBonStrip.updateNameOnChange(form.querySelector("#forename"),form.querySelector("#surname"));
        this.myBonStrip.updateDeliveryAdrOnChange(form.querySelector("#street_name"),form.querySelector("#street_name2"),form.querySelector("#street_nr"),form.querySelector("#zip_code"),form.querySelector("#city"),form.querySelector("#customer_collects"));
        this.myBonStrip.updateMailAndPhoneNrOnChange(form.querySelector("#email"),form.querySelector("#phone_nr"));
        this.myBonStrip.updateDateAndTimeOnChange(form.querySelector("#date"),form.querySelector("#time"));
        this.myBonStrip.updateKitchenInfoOnChange(form.querySelector("#kitchen_info"));
        this.myBonStrip.updatePaxOnChange(form.querySelector("#nr_of_servings"));
        this.myBonStrip.updatePaymentTypeOnChange(form.querySelector("#payment-types"));
        this.myBonStrip.updateKitchenSelectsOnChange(form.querySelector("#kitchen_selects"));

        this.myItems.SetOnItemClick((item)=>{
            this.myBonStrip.configureOrder(1,item.name,"",item.id,item.price,item.cost_price,item.category);
        })

        form.querySelector("#save").onclick=function() {
            let props=Helper.getFormProps(form);

            let bon=self._createBon(props);
            self.myRepoObj.saveBon(bon,function(bonId) {
                bon.id=bonId;
                let [label,statusColor]=self.createBonLabelAndcolor(bon);
                if(self.currentEvent!==undefined) {
                    self.myCalendarObj.updateEvent(self.currentEvent,bon.delivery_date,label,statusColor,bon);
                } else {
                    self.myCalendarObj.addEvent(bon.delivery_date,label,statusColor,bon);
                }
                self.myPopupObj.hide();
    

            });

        }

        form.querySelector("#cancel").onclick=function(e) {
            self.myPopupObj.hide();
        };

        form.querySelector("#delete").onclick=function(e) {

            MessageBox.popup("Vill du verkligen ta bort denna Bon?",
            {
                b1:{
                    text: "Ja",
                    onclick:()=>{
                        self.myRepoObj.deleteBon(self.currentEvent.myData.misc.id,function() {
                            self.myCalendarObj.deleteEvent(self.currentEvent);
                            self.myPopupObj.hide();
                        })
                    }
                },
             b2:{text:"Nej"}
            });
        };

        form.querySelector("#copy").onclick=function(e) {
            if(self.currentEvent!==undefined) {
                let props=Helper.getFormProps(form);

                let bon=self._createBon(props);
                bon.id="";
                self.myRepoObj.saveBon(bon,function(bonId) {
                    bon.id=bonId;
                    let [label,statusColor]=self.createBonLabelAndcolor(bon);

                    self.myCalendarObj.addEvent(bon.delivery_date,label,statusColor,bon);
                    self.myPopupObj.hide();
                })

            }
        };

        let expandCompanyInfo=form.querySelector("#expand-company-info");
        let companyInfo=form.querySelector("#company-info");
        companyInfo.style.display="none";

        expandCompanyInfo.onclick=function(e) {
            if(expandCompanyInfo.classList.contains('fa-caret-down')) {
                expandCompanyInfo.classList.remove('fa-caret-down');
                expandCompanyInfo.classList.add('fa-caret-up');
                companyInfo.style.display="";
            } else {
                expandCompanyInfo.classList.remove('fa-caret-up');
                expandCompanyInfo.classList.add('fa-caret-down');
                companyInfo.style.display="none";
            }
        }

        form.querySelectorAll(".status-button").forEach(e=>{
            e.onclick=(event)=>{
                form.querySelectorAll(".status-button").forEach(s=>{
                    s.style.background="";
                    s.classList.remove("active");
                });
                let elem=event.target;
                elem.style.background=elem.dataset["activeBackground"];
                elem.classList.add("active");
            }
        })

        this.customer_mail_autocomplete=new AutoCompleteClass(form.querySelector("#email"));
        this.customer_mail_autocomplete.typingFunction=(text)=> {
           self.myRepoObj.getCustomers(text,(customers)=>{
                self.customer_mail_autocomplete.setOptions(customers.map(c=>({value:c.email,data:c})));
           })
            return undefined;
        }
        this.customer_mail_autocomplete.onSelect=(option)=>{
            form.querySelector("#email")
            self._customerToForm(option.data,form,true);
            self._copyCompanyAddress2Delivery(form,true);
        }


        form.querySelector("#price-categories").onchange=function() {
            self.updateItems();
        }

    }


    

    updateItems() {
        this.updatePriceCategories();
        let currentPrice=this.getCurrentPriceCategory();
        this.myItems.updateItems(currentPrice);

    }
    updatePriceCategories() {
        let select=this.myDiv.querySelector("#price-categories");
        let currentSelected=select.value;
        select.innerHTML="";
        let option = document.createElement("option");
        option.text = "Pris kategorie...";
        option.disabled=true;
        select.add(option);

        Globals.myConfig.priceCategories.forEach(c=>{
            option = document.createElement("option");
            option.text=c;
            select.add(option);

        });
        select.value=currentSelected!=""?currentSelected:select.options[select.selectedIndex].value;

        this.myBonStrip.updatePricesFromCategory(select.value);
        
        return select.value;
    }

    getCurrentPriceCategory() {
        let select=this.myDiv.querySelector("#price-categories");
        return select.value;

    }









    createBonLabelAndcolor(bon) {
        let statusColor=this.getStatusColor(bon.status);
        let timeStr=bon.delivery_date.getHours().toString().padStart(2,"0")+"."+bon.delivery_date.getMinutes().toString().padStart(2,"0");
        let label=timeStr+", #"+bon.id+", Pax= "+(bon.nr_of_servings!=""?bon.nr_of_servings:0);
        return [label,statusColor];

    }

    _getStatus() {
        let form=this.myDiv.querySelector("#order");
        let elem=form.querySelector(".status-button.active");
        if(elem) {
            return Globals.Statuses[elem.getAttribute("id")].name;
        } else {
            return "";
        }
    }

    getStatusColor(status) {
        return Globals.Statuses[status]?Globals.Statuses[status].color:"lightgreen";
    }

    _setStatus(status) {
        let form=this.myDiv.querySelector("#order");
        form.querySelectorAll(".status-button").forEach(s=>{
            s.style.background="";
            s.classList.remove("active");
        });
        try {
            let elem=form.querySelector("#"+status);
            elem.click();
        } catch(err) {
        }
    }

    _createBon(props) {
        let bon={};
        bon.id=props.bon_id;
        bon.delivery_date=new Date(props.delivery_date+"T"+props.delivery_time);
        bon.status=this._getStatus();
        bon.status2="";
        bon.nr_of_servings=props.nr_of_servings;
        bon.kitchen_selects=props.kitchen_selects;
        bon.customer_collects=props.customer_collects;
        bon.price_category=props.price_category;
        bon.payment_type=props.payment_type;
        bon.customer_info= props.customer_info;
        bon.kitchen_info= props.kitchen_info;
        bon.service_type=null;
    



        bon.customer={};
        bon.customer.forename=props.forename;
        bon.customer.surname=props.surname;
        bon.customer.email=props.email;
        bon.customer.phone_nr=props.phone_nr;
        bon.customer.company={};
        bon.customer.company.name=props.company_name;
        bon.customer.company.ean_nr=props.ean_nr;
        bon.customer.company.address={};
        bon.customer.company.address.street_name=props.company_street_name;
        bon.customer.company.address.street_name2=props.company_street_name2;
        bon.customer.company.address.street_nr=props.company_street_nr;
        bon.customer.company.address.city=props.company_city;
        bon.customer.company.address.zip_code=props.company_zip_code;

        bon.delivery_address={};
        bon.delivery_address.street_name=props.street_name;
        bon.delivery_address.street_name2=props.street_name2;
        bon.delivery_address.street_nr=props.street_nr;
        bon.delivery_address.city=props.city;
        bon.delivery_address.zip_code=props.zip_code;

        bon.orders=this.myBonStrip.getOrders();


        return bon;
    }

    _customerToForm(customer,form,merge) {
        this._updateOrMerge(form.querySelector("input[name=email]"),customer.email,merge);
        this._updateOrMerge(form.querySelector("input[name=forename]"),customer.forename,merge);
        this._updateOrMerge(form.querySelector("input[name=surname]"),customer.surname,merge);
        this._updateOrMerge(form.querySelector("input[name=phone_nr]"),customer.phone_nr,merge);

        this._updateOrMerge(form.querySelector("input[name=company_name]"),customer.company.name,merge);
        this._updateOrMerge(form.querySelector("input[name=ean_nr]"),customer.company.ean_nr,merge);

        this._updateOrMerge(form.querySelector("input[name=company_street_name]"),customer.company.address.street_name,merge);
        this._updateOrMerge(form.querySelector("input[name=company_street_name2]"),customer.company.address.street_name2,merge);
        this._updateOrMerge(form.querySelector("input[name=company_street_nr]"),customer.company.address.street_nr,merge)
        this._updateOrMerge(form.querySelector("input[name=company_city]"),customer.company.address.city,merge);
        this._updateOrMerge(form.querySelector("input[name=company_zip_code]"),customer.company.address.zip_code,merge);


    }
    _copyCompanyAddress2Delivery(form,merge) {
        this._updateOrMerge(form.querySelector("input[name=street_name]"),form.querySelector("input[name=company_street_name]").value,merge);
        this._updateOrMerge(form.querySelector("input[name=street_name2]"),form.querySelector("input[name=company_street_name2]").value,merge);
        this._updateOrMerge(form.querySelector("input[name=street_nr]"),form.querySelector("input[name=company_street_nr]").value,merge)
        this._updateOrMerge(form.querySelector("input[name=city]"),form.querySelector("input[name=company_city]").value,merge);
        this._updateOrMerge(form.querySelector("input[name=zip_code]"),form.querySelector("input[name=company_zip_code]").value,merge);

    }

    _updateOrMerge(elem,val,merge) {
        if(merge && elem.value.trim()=="") {
            elem.value=val;
        } else if(!merge) {
            elem.value=val;
        }
        try {elem.oninput();} catch(err) {}
    }

    _bonToForm(bon,formDiv) {

        this.myBonStrip.clear();

        let form=this.myDiv.querySelector(formDiv);

        let date=new Date(bon.delivery_date);
        this._setFormDate(date,formDiv);

        this._customerToForm(bon.customer,form);

        form.querySelector("input[name=bon_id]").value=bon.id;
        form.querySelector("input[name=nr_of_servings]").value=bon.nr_of_servings;
        form.querySelector("input[name=nr_of_servings]").oninput();
        form.querySelector("input[name=customer_collects]").checked=bon.customer_collects;
        form.querySelector("input[name=kitchen_selects]").checked=bon.kitchen_selects;
        form.querySelector("input[name=kitchen_selects]").onchange();
        form.querySelector("select[name=price_category]").value=bon.price_category;
        form.querySelector("select[name=price_category]").onchange();
        form.querySelector("select[name=payment_type]").value=bon.payment_type;
        form.querySelector("select[name=payment_type]").onchange();

        form.querySelector("textarea[name=customer_info]").value=bon.customer_info;
        form.querySelector("textarea[name=kitchen_info]").value=bon.kitchen_info;

        this._updateOrMerge(form.querySelector("textarea[name=kitchen_info]"),bon.kitchen_info);


        this._updateOrMerge(form.querySelector("input[name=street_name]"),bon.delivery_address.street_name);
        this._updateOrMerge(form.querySelector("input[name=street_name2]"),bon.delivery_address.street_name2);
        this._updateOrMerge(form.querySelector("input[name=street_nr]"),bon.delivery_address.street_nr);
        this._updateOrMerge(form.querySelector("input[name=city]"),bon.delivery_address.city);
        this._updateOrMerge(form.querySelector("input[name=zip_code]"),bon.delivery_address.zip_code);

        this._setStatus(bon.status!==""?bon.status:"new");

        this.myBonStrip.setBonId(bon.id);
        this.myRepoObj.getOrders(bon.id,(orders)=>{
            orders.forEach(o=>{
                this.myBonStrip.addOrder(o.quantity,o.name,o.special_request,o.item_id,o.price,o.cost_price,o.category);
            });
            this.myBonStrip.updateTotalSum();
        })

    }

    _setFormDate(date,formDiv) {
        let form=this.myDiv.querySelector(formDiv);
        let yearStr=date.getFullYear()+"";
        let monthStr=((date.getMonth()+1)+"").padStart(2,"0");
        let dayStr=(date.getDate()+"").padStart(2,"0");
        let hourStr=(date.getHours()+"").padStart(2,"0");
        let minuteStr=(date.getMinutes()+"").padStart(2,"0");

        this._updateOrMerge(form.querySelector("input[name=delivery_date]"),yearStr+"-"+monthStr+"-"+dayStr);
        this._updateOrMerge(form.querySelector("input[name=delivery_time]"),hourStr+":"+minuteStr);


    }

    init(content,eventElem) {
        this._clear();

        this.currentEvent=eventElem;

        let display="none";
        let eventData=undefined;
        if(eventElem!==undefined) {
            eventData=eventElem.myData;
            display="";
            this._bonToForm(eventData.misc,"#order");
        } else {
            this._setFormDate(new Date(content.eventTime),"#order");
            this._setStatus(Globals.Statuses["new"].name);
            this.myBonStrip.setBonId("");
            this.myBonStrip.clear();
        }
        this.myDiv.querySelectorAll(".for-update").forEach(e=>{
            e.style.display=display;
        });




    }

    _clear() {
        this.myDiv.querySelectorAll("#order input,textarea").forEach((e) => {
            let name = e.getAttribute("name");
            if (name !== null) {
              e.value="";
              try {e.oninput();} catch(err) {}
            }
        });

        this.myDiv.querySelectorAll(".for-update").forEach(e=>{
            e.style.display="none";
        })  
        this.customer_mail_autocomplete.clearOptions();
    }



    getForm() {
        return this.myDiv;
    }
}