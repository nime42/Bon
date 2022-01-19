class TabsClass {
    background=Globals.background;
    foreground=Globals.foreground;
    div = `
    <style>
    .hori-tab .tab {
        overflow: hidden;
      }
      
      /* Style the buttons that are used to open the tab content */
      .hori-tab .tab button {
        cursor: pointer;
        display: inline-block;
        background-color: ${this.foreground};
        color: ${this.background};
        text-align: center;
        transition: .25s ease;
        border: none;
        padding: 10px;
        border-radius: 12px 12px 0 0;
      }
      
      /* Change background color of buttons on hover */
      .hori-tab .tab button:hover {
        background-color: #ddd;
      }
      
      /* Create an active/current tablink class */
      .hori-tab .tab button.active {
        background-color: ${this.background};
        color: ${this.foreground};
        border: 1px solid black;
        border-bottom:0px;
      }

   
      
      /* Style the tab content */
      .hori-tab .tabcontent {
        display: none;
        padding: 6px 12px;
        border: 1px solid ${this.foreground};
        border-top: none;
        border-left: none;
        background:${this.background};
      }
      .hori-tab .content-container {
        overflow: auto;
        max-height: 450;
        border: 1px solid ${this.foreground};

      }
    </style>
    <div class="tab">
    </div>  

    <div class="content-container"></div>
    `;

    currentIndex = -1;
    tabs=0;

    constructor(div) {
        if(typeof div==="string") {
            this.myDiv = document.querySelector(div);
        } else {
            this.myDiv=div;
        }
        this.myDiv.innerHTML = this.div;
        this.myDiv.classList.add("hori-tab");
    }

    addTab(header, content) {
        let headerElem = document.createElement("button");
        headerElem.classList.add("tablinks");
        headerElem.innerHTML = header;
        this.myDiv.querySelector(".tab").appendChild(headerElem);
        let contentElem = document.createElement("div");
        contentElem.classList.add("tabcontent");
        this.myDiv.querySelector(".content-container").appendChild(contentElem);
        if (typeof content === "string") {
            contentElem.innerHTML = content;
        } else {
            contentElem.appendChild(content);
        }

        let tabNr=this.tabs;

        let self = this;
        headerElem.onclick = () => {
            if(self.currentIndex>-1) {
                self.myDiv.querySelector(".tab").children.item(self.currentIndex).classList.remove("active");
                self.myDiv.querySelector(".content-container").children.item(self.currentIndex).style.display="none";
            }

            self.myDiv.querySelector(".tab").children.item(tabNr).classList.add("active");
            self.myDiv.querySelector(".content-container").children.item(tabNr).style.display="block";

            self.currentIndex=tabNr;
            return false;
        }
        if(this.tabs===0) {
            headerElem.click();
        }
        this.tabs++;
    }

}