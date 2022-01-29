class ModalPopup {
    initDiv() {
        this.div=document.createElement("div");
        this.div.classList.add("modal-popup-background");
        let content=`
        <div class="modal-popup-content" style="display: inline-block; -webkit-border-radius: 10px;">

        </div>
        `;
        this.div.innerHTML=content;

        document.querySelector("body").appendChild(this.div);
    }
    show(content) {
        this.initDiv();
        let contentDiv=this.div.querySelector(".modal-popup-content");
        contentDiv.innerHTML=`<span class="modal-popup-close">&times;</span>`;
        contentDiv.querySelector(".modal-popup-close").onclick=()=>{
            this.hide();
        }

        if(typeof content==="string") {
            contentDiv.innerHTML=content;
        } else {
            contentDiv.appendChild(content);
        }
        this.div.style.display="flex";
    }
    hide() {
        document.querySelector("body").removeChild(this.div);
    }
}