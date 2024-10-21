class KitchenChores {

grocyPurchase=`
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
                <h2>1. Tjek Varer</h2>
                <p>
                Tjek om varer stemmer overens med følgesedel.
                </p>
            </div>
            <div class="box">
                <h2>2. Tjek Indkøbsliste</h2>
                <p>
                Vælg leverandør og
                sammenligne varerne med indkøbslisten på lageret
                </p>
                <a href="${Globals.grocyLink}/shoppinglist?list=1" target="”_blank”"> Gå til Grocy indkøbsliste</a>
            </div>
            <div class="box">
                <h2>3. Tag kopi av følgesedel</h2>
                <p>
                Tag et billede af følgesedlen med iPad-kameraet. Vælg nedskalering af billedet og upload billedet til Grocy
                </p>
                <a href="${Globals.grocyLink}/userobjects/kvittering" target="”_blank”"> Gå til Grocy Følgesedler</a>
            </div>

        </div>
    </div>

`
    production=`
    <div>
        <div id="chores-production-bon" style="max-width: 300px;"/>
    </div>
    `
constructor(div) {
    this.myTabs=new TabsClass(div);
    this.myTabs.addTab("Indkøb",this.grocyPurchase);
    return;
    this.myTabs.addTab("Produktion",this.production);
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
