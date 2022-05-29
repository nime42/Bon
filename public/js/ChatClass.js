class ChatClass {
    background=Globals.background;
    foreground=Globals.foreground;
    shadowColor=Globals.shadowColor;
    chatContent=`
    <ul id="chat">
    </ul>
    <div>
          <textarea id="chat-input" rows="4"></textarea>
    </div>
    <div style="width:95%">
        <button type="button" id="send-message" class="button-primary" >Send</button>
        <button type="button" style="float: right;">Insätt Bon(uden pris)</button>
        <button type="button" style="float: right;margin-right:5px">Insätt Bon</button>
    </div>         
    `;
    messageLeftRow=`
            <div class="header">
                <span class="status green" style="background:${this.foreground}"></span>
                <h2 class="name"></h2>
                <h3 class="when" style="color:${this.foreground}"></h3>
            </div>
            <div class="triangle" style="border-color: transparent transparent ${this.foreground} transparent;"></div>
            <div>
            <pre class="message" style="margin: 0; white-space: pre-wrap;background:${this.foreground}"></pre>
            </div> 
    `;
    messageRightRow=`
            <div class="header">
                <span class="status blue" style="background:${this.foreground}"></span>
                <h3 class="when" style="color:${this.foreground}"></h3>
                <h2 class="name"></h2>
            </div>
            <div class="triangle" style="border-color: transparent transparent ${this.foreground} transparent;"></div>
            <div>
            <pre class="message" style="margin: 0; white-space: pre-wrap;background:${this.foreground}"></pre>
            </div> 
    `;


    constructor(div) {
        if(typeof div==="string") {
            this.myDiv = document.querySelector(div);
        } else {
            this.myDiv=div;
        }
        this.myDiv.innerHTML=this.chatContent;
        let self=this;
        let textInput=this.myDiv.querySelector("#chat-input");
        this.myDiv.querySelector("#send-message").onclick=()=>{
            let message=textInput.value;
            if(message.trim()==="") {
                return;
            }
            self.addMessage("right",this.identity,new Date(),message);
            textInput.value="";
            self.onSend && self.onSend(message);
        }
    }
    addMessage(leftRight,name,date,message) {
        let row=document.createElement("li");
        row.classList.add(leftRight);
        row.innerHTML=leftRight=="left"?this.messageLeftRow:this.messageRightRow;
        row.querySelector(".name").innerHTML=name;
        row.querySelector(".when").innerHTML=this._formatDate(date);
        row.querySelector(".message").innerHTML=message;
        this.myDiv.querySelector("#chat").appendChild(row);
        this.myDiv.querySelector("#chat").scrollTo(0, this.myDiv.querySelector("#chat").scrollHeight);
    }
    _formatDate(date) {
        return date.toLocaleTimeString("default", { hour: '2-digit', minute: '2-digit',hour12: false  })+" "+date.toLocaleDateString("default",{day:"numeric",month:"short",year:"numeric"})
    }

    onSend(fun) {
        this.onSend=fun;
    }

    setIdentity(name) {
        this.identity=name;
    }

    clear() {
        this.myDiv.querySelector("#chat").innerHTML="";
    }

}

