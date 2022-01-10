class AutoCompleteClass {
    constructor(inputDiv) {
        this.myInputDiv=inputDiv;
        this.myList=document.createElement("datalist");
        this.myList.id=this.myInputDiv.id+"-datalist";
        this.myInputDiv.setAttribute("list",this.myList.id);
        document.querySelector("body").appendChild(this.myList);
        let self=this;
        this.myInputDiv.onkeyup=()=>{
            if(self.typingFunction) {
                this.myList.innerHTML = '';
                let listElems=self.typingFunction(self.myInputDiv.value);
                listElems.forEach(e=>{
                    let opt=document.createElement("option");
                    opt.value=e;
                    self.myList.appendChild(opt);

                });
            }
        }
    }
}