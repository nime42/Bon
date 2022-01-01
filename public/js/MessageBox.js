class MessageBox {
    static myContent=`
        <div style="background:lightgray;padding:50px;text-align: center;">
            <span id="message"></span><br><br>
            <span>
            <button type="button" id="b1" style="margin-right: 5px;"/>
            <button type="button" id="b2" style="margin-right: 5px;"/>
            <button type="button" id="b3" style="margin-right: 5px;"/>
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
                    buttons[b].onclick && buttons.onclick();
                    popup.hide();
                }
            }

        })

     
        popup.show(div);

    }
    
}