class VertTabsClass {
    background=Globals.background;
    div = `
    <style>
    .vert-tab #tabs {
        width: 50%;
        margin-right: 10px;
    }
    .vert-tab div {
        background: ${this.background};
    }

    .vert-tab .tab {
        border: 1px solid black;  
        padding: 3px;
        Xborder-bottom: 0px;
        margin: 1px 0px 0px 1px;
        cursor: pointer;
    }


    .vert-tab .tab.active { 
        background:lightgrey;
    }

    .vert-tab .tab:hover {
        background-color: #ddd;
    }

    .vert-tab .tabcontent {
        display: none;
        padding: 1px 5px;
        border-top: none;
        border:0px;
    }

    </style>
    <div style="display: flex;">
        <fieldset>
        <legend>Kategori</legend>
        <div class="tabs"></div>
        </fieldset>
        <fieldset>
        <legend>Vare</legend>  
        <div class="content-container"></div>
        </fieldset>
    </div>
    `;
    currentIndex = -1;
    tabs = 0;

    constructor(div) {
        if (typeof div === "string") {
            this.myDiv = document.querySelector(div);
        } else {
            this.myDiv = div;
        }
        this.myDiv.innerHTML = this.div;
        this.myDiv.classList.add("vert-tab");
    }

    addTab(header, content) {
        let headerElem = document.createElement("div");
        headerElem.classList.add("tab");
        headerElem.innerHTML = header;
        this.myDiv.querySelector(".tabs").appendChild(headerElem);
        let contentElem = document.createElement("div");
        contentElem.classList.add("tabcontent");
        this.myDiv.querySelector(".content-container").appendChild(contentElem);
        if (typeof content === "string") {
            contentElem.innerHTML = content;
        } else {
            contentElem.appendChild(content);
        }

        let tabNr = this.tabs;

        let self = this;
        headerElem.onclick = () => {
            if (self.currentIndex > -1) {
                self.myDiv.querySelector(".tabs").children.item(self.currentIndex).classList.remove(
                    "active");
                self.myDiv.querySelector(".content-container").children.item(self.currentIndex).style
                    .display = "none";
            }

            self.myDiv.querySelector(".tabs").children.item(tabNr).classList.add("active");
            self.myDiv.querySelector(".content-container").children.item(tabNr).style.display = "block";

            self.currentIndex = tabNr;
            return false;
        }
        if (this.tabs === 0) {
            headerElem.click();
        }
        this.tabs++;
    }

    clearAll() {
        this.myDiv.querySelector(".tabs").innerHTML="";
        this.myDiv.querySelector(".content-container").innerHTML="";
    }


}