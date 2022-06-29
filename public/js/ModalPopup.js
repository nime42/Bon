class ModalPopup {

    style=`
    .modal-popup-content {
        /*width: 80%;*/
        /*border-radius: 25px;
        border: 2px solid Black;*/
        /*padding: 15px 15px 15px 15px;
        margin: 20px 20px 20px 20px;*/
        /*background: #A4D3EE;
        overflow: visible;
        box-shadow: 5px 5px 2px #888888;*/
        position: relative;
      }
      
      .modal-popup-close {
          position: absolute;
          top: 20px;
          right: 20px;
          border:0;
      }
    
    `
    initDiv() {
        this.div=document.createElement("div");
        this.div.classList.add("modal-popup-background");
        this.div.style.cssText="overflow: auto;";
        let content=`
        <style>${this.style}</style>
        <div class="modal-popup-content" style="overflow=auto;height:95%">
        <button class="modal-popup-close">&times;</button>
        </div>
        `;
        this.div.innerHTML=content;

        document.querySelector("body").appendChild(this.div);
    }
    show(content) {
        this.initDiv();
        let contentDiv=this.div.querySelector(".modal-popup-content");
        /*contentDiv.innerHTML=`<span  class="modal-popup-close" style="width: min-content;align-self: end; position: -webkit-sticky;
        position: sticky;
        top: 10px;">&times;</span>`;*/
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