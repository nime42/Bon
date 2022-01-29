class MessageBox {
    static background=Globals.background;
    static foreground=Globals.foreground;
    static shadowColor=Globals.shadowColor;
    static myContent=`
    <style type="text/css">

    div.mb-style {
        background:${this.background};
        padding:50px;
        text-align: center;
        border-radius: 10px;
        -webkit-border-radius: 10px;
        -moz-border-radius: 10px;

    }
    .mb-style button {
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
    </style>



        <div class="mb-style">

            <span id="message"></span><br><br>
            <span class="mb-style">
            <button class="mb-style" type="button" id="b1"/>
            <button class="mb-style" type="button" id="b2"/>
            <button class="mb-style" type="button" id="b3"/>
            </span>
        </div>
        `;
    
    static popup(message, buttons) {
        let popup=new ModalPopup();
        let div=document.createElement("div");
        div.innerHTML=MessageBox.myContent;
        div.querySelector("#message").innerHTML=message;

        div.querySelectorAll("button").forEach(e=>{e.style.display="none"});
        buttons && ["b1","b2","b3"].forEach((b) => {
            if(buttons[b]) {
                let button=div.querySelector("#"+b);
                button.innerHTML=buttons[b].text;
                button.style.display="";
                button.onclick=function() {
                    buttons[b].onclick && buttons[b].onclick();
                    popup.hide();
                }
            }

        })

     
        popup.show(div);

    }
    
}