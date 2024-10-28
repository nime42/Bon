class ProductionChores {

    productionTab=`
    <div id=production-tab>
    </div>
    `

    grocyRecipiesTab=`
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
    this.myTabs=new TabsClass(div);
    //this.myTabs.addTab("Produktion",this.productionTab);
    this.myTabs.addTab("Opskrifter",this.grocyRecipiesTab);

    return;
    let productionBon=new BonStrip("#chores-production-bon",true);
    const emptyBon=()=> {
        return {
            customer: {
                "forename": "Produktion",
                "surname": "",
                "email": "",
                "phone_nr": ""
            },
            delivery_date: new Date(),
            id: 0,
            price_category: "Produktion",
            delivery_address: {
                "street_name": "",
                "street_name2": "",
                "street_nr": "",
                "zip_code": "",
                "city": ""
            },
            delivery_info:"",
            kitchen_info: "",
            nr_of_servings: 0,
            payment_type: "Produktion"

        };
    };
    productionBon.initFromBon(emptyBon());
   

}
}
