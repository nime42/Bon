class BonForm {
    background=Globals.background;
    foreground=Globals.foreground;
    shadowColor=Globals.shadowColor;
    content=`
    <div style="background:${this.background};padding:20px;border-radius: 10px;border: 3px solid black;border-style: double;">

    <style type="text/css">
        .form-style {

            font-family: sans-serif;
            background:${this.background};
            padding: 10px;
            -webkit-border-radius: 10px;
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
            font-size: 13px;
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
            font-size: 12px;
        }

        .form-style textarea {
            width: 250px;
            height: 100px;
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

        .required {
            color: red;
            font-weight: normal;
        }
    </style>



    <form id="order" class="form-style">
    <div id="input-fields">
    <fieldset>
    <legend>Status</legend>
    <button type="button" id="new" class="status-button" style="float:left" data-active-background="lightgreen">Ny</button>
    <button type="button" id="approved" class="status-button" data-active-background="yellow">Godkendt</button>
    <button type="button" id="offer" class="status-button" style="float:right" data-active-background="lightblue">Tilbud</button>
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
    </div> 
    `;

    customerInfoTab=`
    <fieldset>
    <legend>Leveringsdato</legend>
    <span>
        <input type="date" name="delivery_date">
        <input type="time" name="delivery_time">
    </span>
</fieldset>
<fieldset>
    <legend>Kunde</legend>
    <label> Email<br> <input id="email" type="email" name="email" autocomplete="nope"></label> 
    <span>
    <label style="float:left;width: 30%"> Fornavn<br> <input type="text" name="forename"></label>
    <label> Efternavn<br> <input type="text" name="surname" ></label>
    </span>
    <label> Telefon<br> <input type="tel" name="phone_nr"></label>
    <br>
    <fieldset>
    <legend>Forretning <button type="button" id="expand-company-info">&gt;</button></legend>
    
    <div id="company-info">
    <label> Firma navn<br> <input type="text" name="company_name"></label>
    <label> EAN kod<br> <input type="text" name="ean_nr" ></label>
    <fieldset>
    <legend style="font-weight: bold;">Adresse</legend>
    <input type="text" name="company_street_name2" placeholder="C/O etc"> <br>
    <span>
        <input type="text" name="company_street_name" placeholder="Gade">
        <input type="text" name="company_street_nr" placeholder="nr" style="width:15%">
    </span><br>
    <span>
        <input type="text" name="company_zip_code" placeholder="Postnr" style="width:20%">
        <input type="text" name="company_city" placeholder="By">
    </span>
    </fieldset>

    </div>
    </fieldset>
</fieldset>
<fieldset>
<legend style="font-weight: bold;">Leveringsadresse</legend>
<input type="text" name="street_name2" placeholder="C/O etc"> <br>
<span>
    <input type="text" name="street_name" placeholder="Gade">
    <input type="text" name="street_nr" placeholder="nr" style="width:15%">
</span><br>
<span>
    <input type="text" name="zip_code" placeholder="Postnr" style="width:15%">
    <input type="text" name="city" placeholder="By">
</span>
</fieldset>
<input type="hidden" name="bon_id"/>
</div>      
    `;

itemsTab=`
<div id="items" style=";min-height:400px;">
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

        this.myItems=new VertTabsClass(this.myDiv.querySelector("#items"));


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
            if(expandCompanyInfo.innerText===">") {
                    expandCompanyInfo.innerText="<";
                    companyInfo.style.display="";
            } else {
                expandCompanyInfo.innerText=">";
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
        }
    }

    updateItems() {
        let self=this;
        this.myRepoObj.getItems((items)=>{
            let categories={};
            items.forEach(i=>{
                if(i.sellable) {
                    if(!categories[i.category]) {
                        categories[i.category]=[];
                    }
                    categories[i.category].push({name:i.name,id:i.id});
                }
            })

            Object.keys(categories).forEach((k)=>{
                let content=document.createElement("div");
                content.style.minWidth="150px";

                categories[k].forEach((n)=>{
                    let button=document.createElement("button");
                    button.style.width="100%";
                    button.style.marginBottom="3px";
                    button.innerHTML=n.name;
                    button.onclick=()=>{
                        this.selectItem(n.name,n.id);
                        return false;
                    }
                    content.appendChild(button);
                    content.appendChild(document.createElement("br"));
                    
                })
                this.myItems.addTab(k,content);

            }
        )
        });

    }

    selectItem(name,id) {
        console.log(name,id);
    }

    createBonLabelAndcolor(bon) {
        let statusColor=this.getStatusColor(bon.status);
        let timeStr=bon.delivery_date.getHours().toString().padStart(2,"0")+"."+bon.delivery_date.getMinutes().toString().padStart(2,"0");
        let label=timeStr+":"+bon.customer.forename+" "+bon.customer.surname;
        return [label,statusColor];

    }

    _getStatus() {
        let form=this.myDiv.querySelector("#order");
        let elem=form.querySelector(".status-button.active");
        if(elem) {
            return elem.getAttribute("id");
        } else {
            return "";
        }
    }

    getStatusColor(status) {
        let form=this.myDiv.querySelector("#order");
        let elem=form.querySelector("#"+status);
        if(elem) {
            return elem.dataset["activeBackground"];
        } else {
            return "";
        }
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
        } catch(err) {}
    }

    _createBon(props) {
        let bon={};
        bon.id=props.bon_id;
        bon.delivery_date=new Date(props.delivery_date+"T"+props.delivery_time);
        bon.status=this._getStatus();
        bon.status2="";
        bon.nr_of_servings=0;
        bon.info= "";
        bon.service_type=null;
        bon.payment_type=null;
    



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

    _updateOrMerge(elem,val,merge) {
        if(merge && elem.value.trim()=="") {
            elem.value=val;
        } else if(!merge) {
            elem.value=val;
        }
    }

    _bonToForm(bon,formDiv) {
        let form=this.myDiv.querySelector(formDiv);

        let date=new Date(bon.delivery_date);
        this._setFormDate(date,formDiv);

        this._customerToForm(bon.customer,form);

        form.querySelector("input[name=bon_id]").value=bon.id;

        form.querySelector("input[name=email]").value=bon.customer.email;
        form.querySelector("input[name=forename]").value=bon.customer.forename;
        form.querySelector("input[name=surname]").value=bon.customer.surname;
        form.querySelector("input[name=phone_nr]").value=bon.customer.phone_nr;

        form.querySelector("input[name=company_name]").value=bon.customer.company.name;
        form.querySelector("input[name=ean_nr]").value=bon.customer.company.ean_nr;

        form.querySelector("input[name=company_street_name]").value=bon.customer.company.address.street_name;
        form.querySelector("input[name=company_street_name2]").value=bon.customer.company.address.street_name2;
        form.querySelector("input[name=company_street_nr]").value=bon.customer.company.address.street_nr;
        form.querySelector("input[name=company_city]").value=bon.customer.company.address.city;
        form.querySelector("input[name=company_zip_code]").value=bon.customer.company.address.zip_code;



        form.querySelector("input[name=street_name]").value=bon.delivery_address.street_name;
        form.querySelector("input[name=street_name2]").value=bon.delivery_address.street_name2;
        form.querySelector("input[name=street_nr]").value=bon.delivery_address.street_nr;
        form.querySelector("input[name=city]").value=bon.delivery_address.city;
        form.querySelector("input[name=zip_code]").value=bon.delivery_address.zip_code;

        this._setStatus(bon.status!==""?bon.status:"new");

    }

    _setFormDate(date,formDiv) {
        let form=this.myDiv.querySelector(formDiv);
        let yearStr=date.getFullYear()+"";
        let monthStr=((date.getMonth()+1)+"").padStart(2,"0");
        let dayStr=(date.getDate()+"").padStart(2,"0");
        let hourStr=(date.getHours()+"").padStart(2,"0");
        let minuteStr=(date.getMinutes()+"").padStart(2,"0");

        form.querySelector("input[name=delivery_date]").value=yearStr+"-"+monthStr+"-"+dayStr;
        form.querySelector("input[name=delivery_time]").value=hourStr+":"+minuteStr;


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
            this._setStatus("new");
        }
        this.myDiv.querySelectorAll(".for-update").forEach(e=>{
            e.style.display=display;
        });




    }

    _clear() {
        this.myDiv.querySelectorAll("#order input").forEach((e) => {
            let name = e.getAttribute("name");
            if (name !== null) {
              e.value="";
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