class PlanBon {
  content = `
            <div style="margin:auto;width:900px">
                <div id="planning-status-filter"></div>
                <div id="plan-bon" style="min-width: 300px;float:left"></div>
                <div style="float:left">
                    <style>
                        #other-bons-div {
                            margin-left: 15px;
                            min-width: 250px;
                            background: #f1e6b2;
                            box-shadow: 5px 5px 5px grey;
                            padding-left: 10px;
                            border: 2px solid #8e631f;

                        }

                        #other-bons-div ul {
                            list-style: none;
                        }

                        #other-bons-div li {
                            margin-bottom: -10px;
                        }
                    </style>
                    <div id="other-bons-div">
                        
                        <label style="padding:0">Andre Bons:</label>
                        <span id="toggle-plan-date-filter" style="cursor: pointer;">Filtrer efter dato</span>
                        <input type="text" id="multiDatePicker" style="width: 120px;font-size: 10px;">
                        <br> 
                        <input type="checkbox" id="select-all-plan-bons" title="Vælge alle" style="margin-bottom: 0;"/>                  
                        <ul id="other-bons-list" style="max-height: 450px;overflow: auto;min-height: 80px;"></ul>
                    </div>
                </div>
    `;

  constructor(div) {
    if (typeof div === "string") {
      this.myDiv = document.querySelector(div);
    } else {
      this.myDiv = div;
    }
    this.myDiv.innerHTML = this.content;

    this.planStatusFilter = new BonStatusFilter(document.querySelector("#planning-status-filter"));
    this.planStatusFilter.setStatus("closed", false);
    this.planStatusFilter.setStatus("invoiced", false);
    this.plan_filterDates = [];

    let self = this;
    flatpickr("#multiDatePicker", {
      mode: "multiple",
      locale: { firstDayOfWeek: 1 },
      dateFormat: "Y-m-d",
      onChange: function (selectedDates) {
        self.plan_filterDates = selectedDates;
        self.getOtherBons();
      },
    });

    const emptyBon = () => {
      return {
        customer: {
          forename: "Planning",
          surname: "",
          email: "",
          phone_nr: "",
        },
        delivery_date: new Date(),
        pickup_time: null,
        id: 0,
        price_category: "Festival",
        delivery_address: {
          street_name: "",
          street_name2: "",
          street_nr: "",
          zip_code: "",
          city: "",
        },
        delivery_info: "",
        kitchen_info: "",
        nr_of_servings: 0,
        payment_type: "",
      };
    };

    document.querySelector("#select-all-plan-bons").onchange = (e) => {
      let bonElems = document.querySelector("#other-bons-list").querySelectorAll("input");
      let selectAll = e.target.checked;
      let otherBons = document.querySelectorAll("#other-bons-list input");
      if (!selectAll) {
        otherBons.forEach((e) => {
          e.checked = false;
        });
        this.planBonStrip.initFromBon(emptyBon());
      } else {
        let orders = [];
        otherBons.forEach((e) => {
          e.checked = true;
          orders = Helper.sumOrders(orders, e.myBon.orders);
        });
        let bon = emptyBon();
        this.planBonStrip.initFromBon(bon, orders);
      }
    };

    document.querySelector("#toggle-plan-date-filter").onclick = () => {
      let display = "";
      let i = document.querySelector("#toggle-plan-date-filter i");
      if (i.classList.contains("fa-caret-up")) {
        i.classList.remove("fa-caret-up");
        i.classList.add("fa-caret-down");
        display = "none";
      } else {
        i.classList.remove("fa-caret-down");
        i.classList.add("fa-caret-up");
      }
      document.querySelector("#date-picker-container").style.display = display;
    };

    this.planStatusFilter.setOnStatusChange((changedStatus, statusValues) => {
      if (!statusValues[changedStatus]) {
        let otherBonsList = document.querySelector("#other-bons-list");
        let elemsWithStatus = otherBonsList.getElementsByClassName("my_status_" + changedStatus);
        Array.from(elemsWithStatus)
          .filter((e) => true)
          .forEach((e) => {
            let checkbox = e.querySelector("input");
            if (checkbox.checked) {
              checkbox.checked = false;
              checkbox.onchange();
            }
          });
      }
      this.getOtherBons();
    });
    this.planBonStrip = new BonStrip("#plan-bon", true, { disablePatching: true });

    this.planBonStrip.initFromBon(emptyBon());
  }

  getOtherBons() {
    let today = new Date();
    let todayStr = today.toISOString().split("T")[0];
    let statuses = this.planStatusFilter.getActiveStatuses();

    let otherBonsList = document.querySelector("#other-bons-list");
    let checkedBons = Array.from(otherBonsList.querySelectorAll("input:checked")).map((e) => {
      return e.id;
    });

    Globals.myConfig.myRepo.searchBons({ includeOrders: true, status: statuses }, (bons) => {
      if (this.plan_filterDates.length > 0) {
        let filterDates = this.plan_filterDates.map((d) => d.toDateString());
        let filteredBons = [],
          unfilteredBons = [];
        bons.forEach((b) => {
          if (filterDates.includes(new Date(b.delivery_date).toDateString())) {
            filteredBons.push(b);
          } else {
            unfilteredBons.push(b);
          }
        });
        bons = filteredBons;
        checkedBons.forEach((c) => {
          let bonToRemove = unfilteredBons.find((b) => b.id == c);
          if (bonToRemove !== undefined) {
            this.planBonStrip.addOrders(bonToRemove.orders, -1);
          }
        });
      }

      otherBonsList.innerHTML = "";
      bons.forEach((b) => {
        //remove eventual comment, to avoid that commented orders come in separate row
        b.orders?.forEach(o => { o.special_request = ""; })
        let li = document.createElement("li");
        li.classList.add("my_status_" + b.status);
        let text = `<b>#${b.id}</b> ${new Date(b.delivery_date).toLocaleDateString()} ${new Date(b.delivery_date).toLocaleTimeString()}`;
        li.innerHTML = `<input type="checkbox" id=${b.id} ${checkedBons.find((e) => e == b.id) != undefined ? "checked" : ""}> ${text}`;
        li.style.background = Globals.Statuses[b.status].color;
        let checkbox = li.querySelector("input");
        checkbox.myBon = b;
        checkbox.onchange = () => {
          if (checkbox.checked) {
            this.planBonStrip.addOrders(b.orders);
          } else {
            this.planBonStrip.addOrders(b.orders, -1);
          }
        };

        otherBonsList.appendChild(li);
      });
    });
  }
}
