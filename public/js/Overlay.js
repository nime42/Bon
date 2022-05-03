class OverLay {
    initDiv() {
        this.div=document.createElement("div");
        this.div.style.cssText=`
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0);
        z-index: 2;
        overflow:auto;
        `;
        document.querySelector("body").appendChild(this.div);
    }

    show(content,background) {

        this.initDiv();

        if(typeof content==="string") {
            let div=document.createElement("div");
            div.innerHTML=content;
            content=div;
        }

        if(background) {
            this.div.style.background=background;
        }
        this.div.appendChild(content);

    }

    hide() {
        document.querySelector("body").removeChild(this.div);
    }


}