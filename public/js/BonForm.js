class BonForm {
    content=`
    <div style="background:white;padding:20px;border-radius: 10px;border: 3px solid black;border-style: double;">
    <style>
    label {
        display: block;
        padding-bottom: 3px;
        padding-top:0px;
        font-weight: bold;
    }
    input[type="text" i] {
        margin-bottom: 5px;
    }

    .status-button {
        border-radius: 6px;
        margin-right: 3px;
    }



    </style>

    <form id="order">
    <div id="input-fields" style="max-height: 600px;overflow: auto;">
    <fieldset>
    <legend>Status</legend>
    <button type="button" id="new" class="status-button" style="float:left" data-active-background="lightgreen">Ny</button>
    <button type="button" id="approved" class="status-button" data-active-background="yellow">Godkendt</button>
    <button type="button" id="offer" class="status-button" style="float:right" data-active-background="lightblue">Tilbud</button>
    </fieldset>
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

    <br>
    <span>
        <input type="button" id="save" value="Spara">
        <input type="button" id="delete" value="Ta bort" class="for-update">
        <input type="button" id="copy" value="Kopier" class="for-update">
        <span>&nbsp;&nbsp;</span>
        <input type="button" id="cancel" value="Avbryt">

    </span>
    </form>
    </div>
    
    `
    constructor(popupObj,calendarObj,repoObj) {
        this.myPopupObj=popupObj;
        this.myCalendarObj=calendarObj;
        this.myRepoObj=repoObj;
        this.myDiv=document.createElement("div");
        this.myDiv.innerHTML=this.content;
        let self=this;
        let form=this.myDiv.querySelector("#order");
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