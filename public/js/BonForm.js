class BonForm {
  background = Globals.background;
  foreground = Globals.foreground;
  shadowColor = Globals.shadowColor;
  content = `
  <div class="bon-container" style="margin-top:25px;width: 95%;margin: 60px auto;background:wheat;padding: 10px;border: 1px solid black;border-radius: 5px;">
  <div class="bon-row" style="align-self: end;" onclick="this.parentElement.querySelector('#cancel').click()"><i class="fa fa-times" aria-hidden="true"></i></div>
  <div class="bon-row" style="margin: auto;min-width: 80%;">
      

      <div class="bon-column">
          <form id="order" class="bon-form" style="box-shadow: 5px 5px 5px grey; background:${this.background};padding-left: 10px;border: 2px solid ${this.foreground}; overflow: auto;max-height: 80vh;">

              <h5>Status</h5>
              <div class="bon-row">
                  <button type="button" id="${Globals.Statuses["new"].name}" class="status-button" style="float:left"
                      data-active-background="${Globals.Statuses["new"].color}">${Globals.Statuses["new"].label}</button>
                  <button type="button" id="${Globals.Statuses["needInfo"].name}" class="status-button"
                      style="float:left" data-active-background="${Globals.Statuses["needInfo"].color}">${Globals.Statuses["needInfo"].label}</button>
                  <button type="button" id="${Globals.Statuses["approved"].name}" class="status-button"
                      style="float:left" data-active-background="${Globals.Statuses["approved"].color}">${Globals.Statuses["approved"].label}</button>
                  <button type="button" id="${Globals.Statuses["preparing"].name}" class="status-button"
                      style="float:left" data-active-background="${Globals.Statuses["preparing"].color}">${Globals.Statuses["preparing"].label}</button>
                  <button type="button" id="${Globals.Statuses["done"].name}" class="status-button"
                      style="float:left" data-active-background="${Globals.Statuses["done"].color}">${Globals.Statuses["done"].label}</button>
                  <button type="button" id="${Globals.Statuses["delivered"].name}" class="status-button"
                      style="float:left" data-active-background="${Globals.Statuses["delivered"].color}">${Globals.Statuses["delivered"].label}</button>
                  <button type="button" id="${Globals.Statuses["invoiced"].name}" class="status-button"
                      style="float:left" data-active-background="${Globals.Statuses["invoiced"].color}">${Globals.Statuses["invoiced"].label}</button>
                  <button type="button" id="${Globals.Statuses["closed"].name}" class="status-button"
                      style="float:left" data-active-background="${Globals.Statuses["closed"].color}">${Globals.Statuses["closed"].label}</button>
                  <button type="button" id="${Globals.Statuses["offer"].name}" class="status-button"
                      style="float:left" data-active-background="${Globals.Statuses["offer"].color}">${Globals.Statuses["offer"].label}</button>

              </div>


              <h5>Leveringsdato</h5>
              <div class="bon-row indent">
                  <div class="bon-column">
                      <input id="date" type="date" name="delivery_date">
                  </div>
                  <div class="bon-column">
                      <input id="time" type="time" name="delivery_time">
                  </div>

                  <div class="bon-column">
                      <select name="payment_type" id="payment-types" style="height: auto;">
                          <option>Betaling...</option>
                          <option>Kontant</option>
                          <option>Faktura</option>
                          <option>EAN nr</option>
                      </select>
                  </div>
              </div>


              <h5>Kunde</h5>
              <div class="bon-row indent">
                  <div class="bon-column">
                      <i class="fa fa-envelope icon input-icons"></i>
                  </div>
                  <div class="bon-column">
                      <input id="email" class="u-full-width" type="email" name="email" autocomplete="nope"
                          placeholder="Email">
                  </div>
              </div>
              <div class="bon-row indent">
                  <div class="bon-column">
                      <i class="fa fa-user icon input-icons"></i>
                  </div>
                  <div class="bon-column" style="width:30%">
                      <input autocomplete="nope" id="forename" type="text" name="forename" placeholder="Fornavn">
                  </div>
                  <div class="bon-column" style="width:50%">
                      <input autocomplete="nope" id="surname" type="text" name="surname" placeholder="Efternavn">
                  </div>
              </div>

              <div class="bon-row indent">
                  <div class="bon-column">
                      <i class="fa fa-phone icon input-icons"></i>
                  </div>
                  <div class="bon-column">
                      <input id="phone_nr" type="tel" name="phone_nr" placeholder="Telefon">
                  </div>
              </div>



              <h5>Leveringsadresse </h5>
              <div class="bon-row indent">
                  <div class="bon-column">
                      <span>
                      <input type="checkbox" id="customer_collects" name="customer_collects" value="1"
                          style="margin-right: 5px;"> Afhentes
                      </span>
                  </div>
              </div>
              <div class="bon-row indent">
                  <div class="bon-column">
                      <input type="text" id="street_name2" name="street_name2" placeholder="C/O etc"
                          autocomplete="nope">
                  </div>
              </div>

              <div class="bon-row indent">
                  <div class="bon-column">
                      <input type="text" id="street_name" name="street_name" placeholder="Gade" autocomplete="nope">
                  </div>
                  <div class="bon-column" style="width:15%">
                      <input type="text" id="street_nr" name="street_nr" placeholder="nr" autocomplete="nope">
                  </div>

              </div>


              <div class="bon-row indent">
                  <div class="bon-column" style="width:15%">
                      <input type="text" id="zip_code" name="zip_code" placeholder="Postnr" autocomplete="nope">
                  </div>
                  <div class="bon-column">
                      <input type="text" id="city" name="city" placeholder="By" autocomplete="nope">
                  </div>
              </div>







              <h5>Firma</h5>

              <div class="bon-row indent">
                  <div class="bon-column">
                      <i class="fa fa-industry icon input-icons"></i>
                  </div>
                  <div class="bon-column">
                      <input type="text" name="company_name" placeholder="Firma navn">
                  </div>
              </div>




              <div class="bon-row indent">
                  <div class="bon-column">
                      <i class="fa fa-barcode icon input-icons"></i>
                  </div>
                  <div class="bon-column">
                      <input type="text" name="ean_nr" placeholder="EAN">
                  </div>
              </div>

              <div class="bon-row indent ">
                  <div class="bon-column">
                      <input type="text" id="company_street_name2" name="company_street_name2" placeholder="C/O etc"
                          autocomplete="nope">
                  </div>
              </div>

              <div class="bon-row indent">
                  <div class="bon-column">
                      <input type="text" id="company_street_name" name="company_street_name" placeholder="Gade"
                          autocomplete="nope">
                  </div>
                  <div class="bon-column" style="width:15%">
                      <input type="text" id="company_street_nr" name="company_street_nr" placeholder="nr"
                          autocomplete="nope">
                  </div>

              </div>


              <div class="bon-row indent">
                  <div class="bon-column" style="width:15%">
                      <input type="text" id="company_zip_code" name="company_zip_code" placeholder="Postnr"
                          autocomplete="nope">
                  </div>
                  <div class="bon-column">
                      <input type="text" id="company_city" name="company_city" placeholder="By" autocomplete="nope">
                  </div>
              </div>

              <h5>Kunde önsker</h5>
              <div class="bon-row indent">
                  <div class="bon-column">
                      <textarea name="customer_info" placeholder="Kunde Önsker" rows="2"
                          autocomplete="nope"></textarea>
                  </div>
              </div>


              <h5>Køkken info</h5>
              <div class="bon-row indent">
                  <div class="bon-column">
                     <span>
                      <input type="checkbox" id="kitchen_selects" name="kitchen_selects" value="1"
                          style="margin-right: 5px;"> Køkkenet vælger
                     </span>
                  </div>
              </div>

              <div class="bon-row indent">
                  <div class="bon-column">
                      Pax:
                  </div>
                  <div class="bon-column">
                      <input type="text" id="nr_of_servings" name="nr_of_servings" placeholder="Pax"
                          autocomplete="nope">
                  </div>
              </div>

              <div class="bon-row indent">
                  <div class="bon-column">
                      Pris kategorie:
                  </div>
                  <div class="bon-column">
                      <select name="price_category" id="price-categories"></select>
                  </div>
                  </div>              


                  <div class="bon-row indent">
                      <div class="bon-column">
                          <textarea name="kitchen_info" id="kitchen_info" placeholder="Kökken info" rows="2"
                              autocomplete="nope"></textarea>
                      </div>
                  </div>

                  <div class="bon-row" style="position:sticky;bottom:0;background: wheat;">
                  <div id="buttons" style="text-align: center;padding-top: 10px;">
                  <input class="button-primary" type="button" id="save" value="Gem">
                  <input type="button" id="delete" value="Ta bort" class="for-update">
                  <input type="button" id="copy" value="Kopier" class="for-update">
                  <input type="button" id="cancel" value="Avbryt">
                  </div>
                  </div>


              <input type="hidden" name="bon_id" />

 
      </div>
      <div class="bon-column">
      <div class="bon-container">
        <div class="bon-row">
        <div class="bon-column" style="background:wheat;margin-bottom:20px;float:right;margin-right:5px;"><div id="bon-strip"></div></div>
        <div class="bon-column">
          <div id="items-selector" style="display:none"></div>
          <div id="mail-conversation" style="display:none;width:550px;padding:5px;margin-top:5px;box-shadow: 5px 5px 5px grey; background:${this.background}"></div>

          </div>
        </div>
        </div>
      </div>
  </div>
  </form>

</div>
   
    `;

  itemsTab = `
<span>
<br>
<div>
<span style="margin-right: 5px;color: ${this.foreground};">Pax:</span><input type="text" id="nr_of_servings" name="nr_of_servings" placeholder="Pax" autocomplete="nope" style="vertical-align: top; margin-right:5px;width: 10%;"> 
<select name="price_category" id="price-categories"></select>


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

  miscTab = `
<div>Øvrig info</div>
`;

  constructor(popupObj, repoObj) {
    this.myPopupObj = popupObj;
    this.myRepoObj = repoObj;
    this.myDiv = document.createElement("div");
    this.myDiv.innerHTML = this.content;
    let self = this;
    let form = this.myDiv.querySelector("#order");




   

    this.myBonStrip = new BonStrip(this.myDiv.querySelector("#bon-strip"),true,this.myDiv.querySelector("#items-selector"));
    this.myBonStrip.showMails(this.myDiv.querySelector("#mail-conversation"));

    this.myBonStrip.updateNameOnChange(
      form.querySelector("#forename"),
      form.querySelector("#surname")
    );
    this.myBonStrip.updateDeliveryAdrOnChange(
      form.querySelector("#street_name"),
      form.querySelector("#street_name2"),
      form.querySelector("#street_nr"),
      form.querySelector("#zip_code"),
      form.querySelector("#city"),
      form.querySelector("#customer_collects")
    );
    this.myBonStrip.updateMailAndPhoneNrOnChange(
      form.querySelector("#email"),
      form.querySelector("#phone_nr")
    );
    this.myBonStrip.updateDateAndTimeOnChange(
      form.querySelector("#date"),
      form.querySelector("#time")
    );
    this.myBonStrip.updateKitchenInfoOnChange(
      form.querySelector("#kitchen_info")
    );
    this.myBonStrip.updatePaxOnChange(form.querySelector("#nr_of_servings"));
    this.myBonStrip.updatePaymentTypeOnChange(
      form.querySelector("#payment-types")
    );
    this.myBonStrip.updateKitchenSelectsOnChange(
      form.querySelector("#kitchen_selects")
    );

    let buttons=this.myDiv.querySelector("#buttons");

    buttons.querySelector("#save").onclick = function () {
      let props = Helper.getFormProps(form);

      let bon = self._createBon(props);
      let isNew = bon.id === undefined;
      self.myRepoObj.saveBon(bon, function (bonId) {
          bon.id=bonId;
        self.onFormClose && self.onFormClose("saved", bon, isNew);
        self.myPopupObj.hide();
      });
    };

    buttons.querySelector("#cancel").onclick = function (e) {
      self.onFormClose && self.onFormClose("canceled");
      self.myPopupObj.hide();
    };

    buttons.querySelector("#delete").onclick = function (e) {
      MessageBox.popup("Vill du verkligen ta bort denna Bon?", {
        b1: {
          text: "Ja",
          onclick: () => {
            self.myRepoObj.deleteBon(self.currentId, function () {
              self.onFormClose && self.onFormClose("deleted", self.currentId);
              self.myPopupObj.hide();
            });
          },
        },
        b2: { text: "Nej" },
      });
    };

    buttons.querySelector("#copy").onclick = function (e) {
      let props = Helper.getFormProps(form);
      let bon = self._createBon(props);
      bon.id = "";
      bon.status="new";
      self.myRepoObj.saveBon(bon, function (bonId) {
        bon.id = bonId;
        self.onFormClose && self.onFormClose("copied", bon);
        self.myPopupObj.hide();
      });
    };



    form.querySelectorAll(".status-button").forEach((e) => {
      e.onclick = (event) => {
        form.querySelectorAll(".status-button").forEach((s) => {
          s.style.background = "";
          s.classList.remove("active");
        });
        let elem = event.target;
        elem.style.background = elem.dataset["activeBackground"];
        elem.classList.add("active");
      };
    });

    this.customer_mail_autocomplete = new AutoCompleteClass(
      form.querySelector("#email")
    );
    this.customer_mail_autocomplete.typingFunction = (text) => {
      self.myRepoObj.getCustomers(text, (customers) => {
        self.customer_mail_autocomplete.setOptions(
          customers.map((c) => ({ value: c.email, data: c }))
        );
      });
      return undefined;
    };
    this.customer_mail_autocomplete.onSelect = (option) => {
      form.querySelector("#email");
      self._customerToForm(option.data, form, true);
      self._copyCompanyAddress2Delivery(form, true);
    };

    form.querySelector("#price-categories").onchange = function () {
      let select = self.myDiv.querySelector("#price-categories");
      self.myBonStrip.updatePricesFromCategory(select.value);
    };
  }

  updateItems() {
    this.updatePriceCategories();
  }
  updatePriceCategories() {
    let select = this.myDiv.querySelector("#price-categories");
    let currentSelected = select.value;
    select.innerHTML = "";
    let option = document.createElement("option");
    option.text = "Pris kategorie...";
    option.disabled = true;
    select.add(option);

    Globals.myConfig.priceCategories.forEach((c) => {
      option = document.createElement("option");
      option.text = c;
      select.add(option);
    });
    select.value =
      currentSelected != ""
        ? currentSelected
        : select.options[select.selectedIndex].value;

    this.myBonStrip.updatePricesFromCategory(select.value);

    return select.value;
  }

  getCurrentPriceCategory() {
    let select = this.myDiv.querySelector("#price-categories");
    return select.value;
  }

  createBonLabelAndcolor(bon) {
    let statusColor = this.getStatusColor(bon.status);
    let timeStr =
      bon.delivery_date.getHours().toString().padStart(2, "0") +
      "." +
      bon.delivery_date.getMinutes().toString().padStart(2, "0");
    let label =
      timeStr +
      ",#" +
      bon.id +
      ",P:" +
      (bon.nr_of_servings != "" ? bon.nr_of_servings : 0);
    

      return [label, statusColor];
  }


  _getStatus() {
    let form = this.myDiv.querySelector("#order");
    let elem = form.querySelector(".status-button.active");
    if (elem) {
      return Globals.Statuses[elem.getAttribute("id")].name;
    } else {
      return "";
    }
  }

  getStatusColor(status) {
    return Globals.Statuses[status]
      ? Globals.Statuses[status].color
      : "lightgreen";
  }

  _setStatus(status) {
    let form = this.myDiv.querySelector("#order");
    form.querySelectorAll(".status-button").forEach((s) => {
      s.style.background = "";
      s.classList.remove("active");
    });
    try {
      let elem = form.querySelector("#" + status);
      elem.click();
    } catch (err) {}
  }

  _createBon(props) {
    let bon = {};
    bon.id = props.bon_id;
    bon.delivery_date = new Date(
      props.delivery_date + "T" + props.delivery_time
    );
    bon.status = this._getStatus();
    bon.status2 = "";
    bon.nr_of_servings = props.nr_of_servings;
    bon.kitchen_selects = props.kitchen_selects;
    bon.customer_collects = props.customer_collects;
    bon.price_category = props.price_category;
    bon.payment_type = props.payment_type;
    bon.customer_info = props.customer_info;
    bon.kitchen_info = props.kitchen_info;
    bon.service_type = null;

    bon.customer = {};
    bon.customer.forename = props.forename;
    bon.customer.surname = props.surname;
    bon.customer.email = props.email;
    bon.customer.phone_nr = props.phone_nr;
    bon.customer.company = {};
    bon.customer.company.name = props.company_name;
    bon.customer.company.ean_nr = props.ean_nr;
    bon.customer.company.address = {};
    bon.customer.company.address.street_name = props.company_street_name;
    bon.customer.company.address.street_name2 = props.company_street_name2;
    bon.customer.company.address.street_nr = props.company_street_nr;
    bon.customer.company.address.city = props.company_city;
    bon.customer.company.address.zip_code = props.company_zip_code;

    bon.delivery_address = {};
    bon.delivery_address.street_name = props.street_name;
    bon.delivery_address.street_name2 = props.street_name2;
    bon.delivery_address.street_nr = props.street_nr;
    bon.delivery_address.city = props.city;
    bon.delivery_address.zip_code = props.zip_code;

    let orderInfo=this.myBonStrip.getOrders();
    bon.orders = orderInfo.orders;
    bon.price=orderInfo.totPrice;
    bon.cost_price=orderInfo.totCostPrice;


    return bon;
  }

  _customerToForm(customer, form, merge) {
    this._updateOrMerge(
      form.querySelector("input[name=email]"),
      customer.email,
      merge
    );
    this._updateOrMerge(
      form.querySelector("input[name=forename]"),
      customer.forename,
      merge
    );
    this._updateOrMerge(
      form.querySelector("input[name=surname]"),
      customer.surname,
      merge
    );
    this._updateOrMerge(
      form.querySelector("input[name=phone_nr]"),
      customer.phone_nr,
      merge
    );

    this._updateOrMerge(
      form.querySelector("input[name=company_name]"),
      customer.company.name,
      merge
    );
    this._updateOrMerge(
      form.querySelector("input[name=ean_nr]"),
      customer.company.ean_nr,
      merge
    );

    this._updateOrMerge(
      form.querySelector("input[name=company_street_name]"),
      customer.company.address.street_name,
      merge
    );
    this._updateOrMerge(
      form.querySelector("input[name=company_street_name2]"),
      customer.company.address.street_name2,
      merge
    );
    this._updateOrMerge(
      form.querySelector("input[name=company_street_nr]"),
      customer.company.address.street_nr,
      merge
    );
    this._updateOrMerge(
      form.querySelector("input[name=company_city]"),
      customer.company.address.city,
      merge
    );
    this._updateOrMerge(
      form.querySelector("input[name=company_zip_code]"),
      customer.company.address.zip_code,
      merge
    );
  }
  _copyCompanyAddress2Delivery(form, merge) {
    this._updateOrMerge(
      form.querySelector("input[name=street_name]"),
      form.querySelector("input[name=company_street_name]").value,
      merge
    );
    this._updateOrMerge(
      form.querySelector("input[name=street_name2]"),
      form.querySelector("input[name=company_street_name2]").value,
      merge
    );
    this._updateOrMerge(
      form.querySelector("input[name=street_nr]"),
      form.querySelector("input[name=company_street_nr]").value,
      merge
    );
    this._updateOrMerge(
      form.querySelector("input[name=city]"),
      form.querySelector("input[name=company_city]").value,
      merge
    );
    this._updateOrMerge(
      form.querySelector("input[name=zip_code]"),
      form.querySelector("input[name=company_zip_code]").value,
      merge
    );
  }

  _updateOrMerge(elem, val, merge) {
    if (merge && elem.value.trim() == "") {
      elem.value = val;
    } else if (!merge) {
      elem.value = val;
    }
    try {
      elem.oninput();
    } catch (err) {}
  }

  _bonToForm(bon, formDiv) {
    this.myBonStrip.clear();

    let form = this.myDiv.querySelector(formDiv);

    let date = new Date(bon.delivery_date);
    this._setFormDate(date, formDiv);

    this._customerToForm(bon.customer, form);

    form.querySelector("input[name=bon_id]").value = bon.id;
    form.querySelector("input[name=nr_of_servings]").value = bon.nr_of_servings;
    form.querySelector("input[name=nr_of_servings]").oninput();
    form.querySelector("input[name=customer_collects]").checked =
      bon.customer_collects;
    form.querySelector("input[name=kitchen_selects]").checked =
      bon.kitchen_selects;
    form.querySelector("input[name=kitchen_selects]").onchange();
    form.querySelector("select[name=price_category]").value =
      bon.price_category;
    form.querySelector("select[name=price_category]").onchange();
    form.querySelector("select[name=payment_type]").value = bon.payment_type;
    form.querySelector("select[name=payment_type]").onchange();

    form.querySelector("textarea[name=customer_info]").value =
      bon.customer_info;
    form.querySelector("textarea[name=kitchen_info]").value = bon.kitchen_info;

    this._updateOrMerge(
      form.querySelector("textarea[name=kitchen_info]"),
      bon.kitchen_info
    );

    this._updateOrMerge(
      form.querySelector("input[name=street_name]"),
      bon.delivery_address.street_name
    );
    this._updateOrMerge(
      form.querySelector("input[name=street_name2]"),
      bon.delivery_address.street_name2
    );
    this._updateOrMerge(
      form.querySelector("input[name=street_nr]"),
      bon.delivery_address.street_nr
    );
    this._updateOrMerge(
      form.querySelector("input[name=city]"),
      bon.delivery_address.city
    );
    this._updateOrMerge(
      form.querySelector("input[name=zip_code]"),
      bon.delivery_address.zip_code
    );

    this._setStatus(bon.status !== "" ? bon.status : "new");

    this.myBonStrip.setBonId(bon.id);

    this.myRepoObj.getOrders(bon.id, (orders) => {
      orders.forEach((o) => {
        this.myBonStrip.addOrder(
          o.quantity,
          o.name,
          o.special_request,
          o.item_id,
          o.price,
          o.cost_price,
          o.category
        );
      });
      this.myBonStrip.updateTotalSum();
    });
  }

  _setFormDate(date, formDiv) {
    let form = this.myDiv.querySelector(formDiv);
    let yearStr = date.getFullYear() + "";
    let monthStr = (date.getMonth() + 1 + "").padStart(2, "0");
    let dayStr = (date.getDate() + "").padStart(2, "0");
    let hourStr = (date.getHours() + "").padStart(2, "0");
    let minuteStr = (date.getMinutes() + "").padStart(2, "0");

    this._updateOrMerge(
      form.querySelector("input[name=delivery_date]"),
      yearStr + "-" + monthStr + "-" + dayStr
    );
    this._updateOrMerge(
      form.querySelector("input[name=delivery_time]"),
      hourStr + ":" + minuteStr
    );
  }

  init(content, eventElem) {
    this._clear();

    this.currentEvent = eventElem;

    let display = "none";
    let eventData = undefined;
    if (eventElem !== undefined) {
      eventData = eventElem.myData;
      display = "";
      this._bonToForm(eventData.misc, "#order");
    } else {
      this._setFormDate(new Date(content.eventTime), "#order");
      this._setStatus(Globals.Statuses["new"].name);
      this.myBonStrip.setBonId("");
      this.myBonStrip.clear();
    }
    this.myDiv.querySelectorAll(".for-update").forEach((e) => {
      e.style.display = display;
    });
  }

  initFromBonId(id, onClose) {
    this._clear();
    this.onFormClose = onClose;
    this.currentId = id;

    this.myRepoObj.searchBons({ bonId: id }, (bons) => {
      let bonData = bons[0];
      this._bonToForm(bonData, "#order");
      this.myDiv.querySelectorAll(".for-update").forEach((e) => {
        e.style.display = "";
      });
      this.myPopupObj.show(this.getForm());
    });
  }

  initFromDate(date, onClose) {
    this._clear();
    this.onFormClose = onClose;

    this._setFormDate(date, "#order");
    this._setStatus(Globals.Statuses["new"].name);
    this.myBonStrip.setBonId("");
    this.myBonStrip.clear();
    this.myDiv.querySelectorAll(".for-update").forEach((e) => {
      e.style.display = "none";
    });
    this.myPopupObj.show(this.getForm());
  }

  _clear() {
    this.myDiv.querySelectorAll("#order input,textarea").forEach((e) => {
      let name = e.getAttribute("name");
      if (name !== null) {
        e.value = "";
        try {
          e.oninput();
        } catch (err) {}
      }
    });

    this.myDiv.querySelectorAll(".for-update").forEach((e) => {
      e.style.display = "none";
    });
    this.customer_mail_autocomplete.clearOptions();
  }

  getForm() {
    return this.myDiv;
  }
}