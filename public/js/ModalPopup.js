class ModalPopup {
    initDiv() {
        this.div=document.createElement("div");
        this.div.classList.add("modal-popup-background");
        let content=`
        <div class="modal-popup-content" style="display: flex;flex-flow: column wrap;overflow=auto;height:95%">

        </div>
        `;
        this.div.innerHTML=content;

        document.querySelector("body").appendChild(this.div);
    }
    show(content) {
        this.initDiv();
        let contentDiv=this.div.querySelector(".modal-popup-content");
        contentDiv.innerHTML=`<span  class="modal-popup-close" style="width: min-content;align-self: end;">&times;</span>`;
        contentDiv.querySelector(".modal-popup-close").onclick=()=>{
            this.hide();
        }

        if(typeof content==="string") {
            let div=document.createElement("div");
            div.innerHTML=content;
            content=div;
        }
        content.style.overflow="auto";
        contentDiv.appendChild(content);
        this.div.style.display="flex";
    }
    hide() {
        document.querySelector("body").removeChild(this.div);
    }

    _textToElem(text) {
        let temp = document.createElement('template');
        temp.innerHTML = text;
        return temp.content.childNodes;
    }
}