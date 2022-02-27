class BonConfig {
    background=Globals.background;
    foreground=Globals.foreground;
    shadowColor=Globals.shadowColor;

    style=`
    .config-style {

        font-family: sans-serif;
        font-size:medium;
        background:${this.background};
        padding: 10px;
        -webkit-border-radius: 10px;
        min-width:450px;
    }

    .config-style label {
        display: block;
        margin-bottom: 10px;
    }

    .config-style label>span {
        float: left;
        width: 100px;
        color: ${this.foreground};
        font-weight: bold;
        text-shadow: 1px 1px 1px #fff;
    }

    .config-style fieldset {
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

    .config-style fieldset legend {
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

    .config-style textarea {
        width: 250px;
    }

    .config-style input[type=text],
    .config-style input[type=date],
    .config-style input[type=datetime],
    .config-style input[type=number],
    .config-style input[type=search],
    .config-style input[type=time],
    .config-style input[type=url],
    .config-style input[type=email],
    .config-style input[type=tel],
    .config-style select,
    .config-style textarea {
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

    .config-style input[type=submit],
    .config-style input[type=button] {
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


    .config-style .input-icons {
        color: ${this.foreground};
        width: 5%;
    }

    .required {
        color: red;
        font-weight: normal;
    }

    .config-style table {
        border-collapse: collapse;
        width: 100%;
      }
      
      .config-style td, .config-style th {
        border: 1px solid ${this.foreground};
        padding: 8px;
        color: ${this.foreground};
      }
      


    `;


    items=`
        <div>
        <style>
            ${this.style}
        </style>
        <div class="config-style">
        <input type="button" id="refresh-db" value="Hämta från DB">
        <br><br>
        <table>
                <tr>
                    <th>Kategorie</th>
                    <th>Vare</th>
                    <th>Salgbar</th>
                    <th>Pris - Cafe </th>
                    <th>Pris - Festival </th>
                </tr>
        </table>


        </div>
        </div>
    `;
    constructor(div) {

        this.myRepo = new BonRepository();

        this.myTabs=new TabsClass(div);
        this.myTabs.addTab("Varer",this.items);
        this.myTabs.addTab("Bruger","");
        this.getItems();
    }

    getItems() {
        this.myRepo.getItems(items=>{
            console.log(items);
            this.myRepo.getItemsPrices(prices=>{
                console.log(prices);
            })
        })


    }
}