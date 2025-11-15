class ProductionChores {
  productionTab = `
    <div id=production-tab style="min-height: 500px; display:flex">
        <div style="margin-right: 60px;">
            <input class="button-primary" type="button" id="start-production-bon" value="Ny Bon">



            <div id="myDropDown" class="myDropDown" style="display: none;">
                <div id="production-date" style="margin-bottom:5px"></div>
                <div style="margin-top: 15px;">
                    <label for="production-time" style="float: left">Start tid:</label>
                    <input id="production-time" type="time"/>
                </div>

                <div style="text-align: center;padding-top: 10px;">
                    <input class="button-primary" type="button" id="create-production-bon" value="Ok">
                    <input type="button" id="cancel" value="Afbryd">
                </div>
            </div>
            <div id="items-list"></div>
            <div id="finish-production-bon" style="text-align: left;padding-top: 10px;display:none">
                <input class="button-primary" type="button" id="save-production-bon" value="Tilføj">
                <input type="button" id="cancel-new-bon" value="Afbryd">
            </div>
        </div>

        <div id="bon-strip" style="max-width:250px">
        </div>

    </div>
    `;

  grocyRecipiesTab = `
        <style>
        #chores .container {
            display: flex;
            justify-content: space-between; /* Skapar jämn avstånd mellan divarna */
        }
        #chores .box {
            border: 1px solid #000;
            box-sizing: border-box;
            margin-right: 15px;
            padding: 5px;
        }
        #chores h2 {
            font-size: 2rem;
            margin: 0 0 3px 0;
        }
        #chores p {
            margin: 0; /* Tar bort marginalen från paragraferna */
        }
        
    </style>
    <div id=chores>
        <div class="container">
            <div class="box">
                <h2>Opskrifter</h2>
                <a href="${Globals.grocyLink}/recipes?search=produktion" target="”_blank”">Gå til Produktion opskrifter</a><br>
                <a href="${Globals.grocyLink}/recipes?search=01 Sandwich" target="”_blank”">Gå til Sandwich opskrifter</a><br>
                <a href="${Globals.grocyLink}/recipes?search=02 Salat" target="”_blank”">Gå til Salat opskrifter</a><br>

                </div>

        </div>
    </div>

    `;

  constructor(div) {
    if (typeof div === "string") {
      this.myDiv = document.querySelector(div);
    } else {
      this.myDiv = div;
    }

    this.myRepo = new BonRepository();

    this.myTabs = new TabsClass(div);
    this.myTabs.addTab("Produktion", this.productionTab);
    this.myTabs.addTab("Opskrifter", this.grocyRecipiesTab);

    this.myDiv.querySelector("#start-production-bon").onclick = () => {
      let dropDown = this.myDiv.querySelector("#myDropDown");
      if (dropDown.style.display == "none") {
        dropDown.style.display = "";
        this.myDiv.querySelector("#production-time").value = "12:30"
      } else {
        dropDown.style.display = "none";
      }
    };

    this.myDatePicker = flatpickr("#production-date", {
      locale: { firstDayOfWeek: 1 },
      dateFormat: "Y-m-d",
      onChange: function (selectedDates) {
        this.selectedDate = selectedDates[0];
      },
      inline: true,
    });

    this.myDiv.querySelector("#cancel").onclick = () => {
      this.myDiv.querySelector("#start-production-bon").click();
    };

    this.myDiv.querySelector("#create-production-bon").onclick = () => {
      this.myDiv.querySelector("#start-production-bon").click(); //toggle selection
      this.myDiv.querySelector("#finish-production-bon").style.display = "";
      this.myDiv.querySelector("#start-production-bon").style.display = "none";

      let options = {
        externalItemList: this.myDiv.querySelector("#items-list"),
      };
      this.myBonStrip = new BonStrip(this.myDiv.querySelector("#bon-strip"), true, options);
      const emptyBon = () => {
        return {
          id: "",
          customer: {
            forename: "Produktion",
            surname: "",
            email: "",
            phone_nr: "",
          },
          delivery_date: new Date(),
          pickup_time: null,
          price_category: "Produktion",
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
          payment_type: "Produktion",
          status: "approved",
        };
      };
      this.newBon = Helper.getEmptyBon();
      this.newBon.customer.forename = "Produktion";
      this.newBon.payment_type = "Produktion";
      this.newBon.price_category = "Produktion";
      this.newBon.status = "approved";

      this.newBon.delivery_date = this.getDate();
      this.myBonStrip.initFromBon(this.newBon);
      this.myBonStrip.compactLegends();
      this.myBonStrip.hidePrices();
      let selectedItemCategory = false;
      this.myDiv
        .querySelector("#items-list")
        .querySelectorAll(".tab")
        .forEach((e) => {
          if (e.innerHTML.match(/.*Produktion.*/i) === null) {
            e.style.display = "none";
          } else {
            if (!selectedItemCategory) {
              e.click();
              selectedItemCategory = true;
            }
          }
        });
    };

    this.myDiv.querySelector("#cancel-new-bon").onclick = () => {
      this.myDiv.querySelector("#finish-production-bon").style.display = "none";
      this.myDiv.querySelector("#start-production-bon").style.display = "";
      this.myDiv.querySelector("#items-list").innerHTML = "";
      this.myDiv.querySelector("#bon-strip").innerHTML = "";
    };

    let self = this;
    this.myDiv.querySelector("#save-production-bon").onclick = () => {
      this.newBon.orders = self.myBonStrip.getOrders()["orders"];
      self.myRepo.saveBon(self.newBon, function (bonId) {
        bon.id = bonId;

        MessageBox.popup("Ny produktionsbon: #" + bonId, {
          b1: {
            text: "Ok",
          },
        });

        self.myDiv.querySelector("#cancel-new-bon").click();
      });
    };
  }

  getDate() {
    let [h, m] = this.myDiv.querySelector("#production-time").value.split(":");
    let date = this.myDatePicker.selectedDate;
    if (!date) {
      date = new Date();
    }
    date.setHours(isNaN(parseInt(h)) ? 0 : parseInt(h), isNaN(parseInt(m)) ? 0 : parseInt(m));
    return date;
  }
}
