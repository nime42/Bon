class TabsClass {
    div = `
    <style>
    .tab {
        overflow: hidden;
        border: 1px solid #ccc;
        background-color: #f1f1f1;
      }
      
      /* Style the buttons that are used to open the tab content */
      .tab button {
        background-color: inherit;
        float: left;
        border: none;
        outline: none;
        cursor: pointer;
        padding: 14px 16px;
        transition: 0.3s;
      }
      
      /* Change background color of buttons on hover */
      .tab button:hover {
        background-color: #ddd;
      }
      
      /* Create an active/current tablink class */
      .tab button.active {
        background-color: #ccc;
        border: 1px solid black;
      }

   
      
      /* Style the tab content */
      .tabcontent {
        display: none;
        padding: 6px 12px;
        border: 1px solid #ccc;
        border-top: none;
      }
      .content-container {
        overflow: auto;
        max-height: 450;
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