class ChatClass {
    background=Globals.background;
    foreground=Globals.foreground;
    shadowColor=Globals.shadowColor;
    chatContent=`
    <ul id="chat">
    </ul>
    <div data-check-access="\${ADMIN\}">
    <div>
          <textarea id="chat-input" rows="4"></textarea>
    </div>
    <div style="min-width: 350px;">
        <button type="button" id="send-message" class="button-primary" style="padding: 0 5px;">Send</button>
        <select type="button" id="add-template" style="float: right; padding: 0 5px;"></select>
    </div>
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




        this.templateSelector=this.myDiv.querySelector("#add-template");


        this.uppdateTemplates();



        this.templateSelector.onchange=()=>{
            let text;
            if(self.onSelectTemplate) {
                let text=self.onSelectTemplate(self.templateSelector.value);
                if(text instanceof Function) {
                    text((message)=>{
                        Helper.typeInTextarea(message,textInput);         
                    })
                } else {
                    Helper.typeInTextarea(text,textInput);
                }
            }
            self.templateSelector.value=self.templateSelector.firstChild?.textContent;

        }

    }

    uppdateTemplates() {
        this.templateSelector.innerHTML="";
        Globals.myConfig.getMessages((messages=>{
            messages=[{name:"indsæt besked..."},...messages]
            messages.forEach(m=>{
                let o=document.createElement("option");
                o.text=m.name;
                this.templateSelector.add(o);
            })
        }))

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

    onSelectTemplate(fun) {
        this.onSelectTemplate=fun;
    }



    setIdentity(name) {
        this.identity=name;
    }

    clear() {
        this.myDiv.querySelector("#chat").innerHTML=""; 
        this.myDiv.querySelector("#chat-input").value="";
    }

    prepareMessage(newText) {
        if(newText!==undefined) {
            this.myDiv.querySelector("#chat-input").value=newText;
        }
    }

    getHistory() {
        let history=[...this.myDiv.querySelector("#chat").childNodes].map(e=>{
            let name=e.querySelector(".name").innerHTML;
            let when=e.querySelector(".when").innerHTML;
            let message=e.querySelector(".message").innerHTML;
            return {name:name,when:when,message:message};
        });
        return history;
    }

    getQoutedHistory(reverse,start=0,end=undefined) {
        let history=this.getHistory();
        if(reverse) {
            history=history.reverse();
        }
        history=history.slice(start,end);
        if(history.length===0) {
            return "";
        }
        let qoutedMessages="";
        history.forEach(h=>{
            let r=`${h.when}| ${h.name}:\n${h.message.replace(/^/gm,"\t") }`;
            qoutedMessages+=r+"\n";
        })
        return qoutedMessages.replace(/^/gm,">");
    }  
    
    isAllowedToSend() {
        Globals.myLoginHandler.checkAccess(Globals.userInfo?.roles,this.myDiv);
    }

}   

