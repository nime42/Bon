class AutoCompleteClass {
  background=Globals.background;
  foreground=Globals.foreground;
  styling=`
  <style>
  .container {
      display: inline-block;
      position: relative;
  }

  .container input {
    width: 100%;
  }

  .dropdown {
      border: 1px solid black;
     
      position: absolute;
      z-index: 1;
      background: ${this.background};
      width: 100%;
  }
  .dropdown-item {
      padding: 5px;
      cursor: pointer;
      background-color: ${this.background}; 
      border-bottom: 1px solid #d4d4d4; 
      overflow: hidden;
      display: block;
      font-style: italic;
      font-weight: normal;
      color:${this.foreground};
      
  }
  .dropdown-item.active,
  .dropdown-item:hover {
      background-color: lightgrey; 
  }

</style>  
  `;



  constructor(inputDiv) {
    this.myInputDiv = inputDiv;
    let container=document.createElement("DIV");
    container.classList.add("container");
    this.myInputDiv.replaceWith(container);
    container.insertAdjacentHTML('beforebegin',this.styling);
    container.appendChild(this.myInputDiv);
    this.myList = document.createElement("DIV");
    this.myList.classList.add("dropdown");
    this.myList.style.display = 'none';
    container.appendChild(this.myList);
    this.myOptions=[];
    let self = this;

    //when input looses focus then hide options (but wait a little, it could be that the user clicked an option)
    this.myInputDiv.onblur=(event)=> {
      setTimeout(()=>{self.clearOptions()},200); 
    };


    this.myInputDiv.onkeydown=(evt) => {
      if(self.myList.children.length===0) return;
      switch(evt.keyCode) {
        case 38:
          if(self.currentfocus>-1) {
            self.myList.children.item(self.currentfocus).classList.remove("active");
            self.currentfocus--;
            self.currentfocus>-1 && self.myList.children.item(self.currentfocus).classList.add("active");

          }
            break;
        case 40:
          if(self.currentfocus+1<self.myOptions.length) {
            self.currentfocus>-1 && self.myList.children.item(self.currentfocus).classList.remove("active");
            self.currentfocus++;
            self.myList.children.item(self.currentfocus).classList.add("active");

          }

          break;
        case 13:
          if(self.currentfocus>=0) {
            self.myList.children.item(self.currentfocus).click()
          }
      }
    }


    this.myInputDiv.onkeyup = (evt) => {
      if((evt.keyCode>=37 && evt.keyCode<=40) || evt.keyCode===13) {
        return;
      }
      if (self.typingFunction) {
 
        if (self.myInputDiv.value.trim()!=="") {
          let listElems = self.typingFunction(self.myInputDiv.value);
          if (listElems) {
            self.setOptions(listElems);
          }
        }
      }
    };
  }

  setOptions(options) {
    this.clearOptions();

    options.forEach((o) => {
      let opt = document.createElement("div");
      opt.classList.add("dropdown-item");
      opt.innerHTML = o.value?o.value:o;
      let self=this;
      opt.onclick=function() {
        self.onSelect && self.onSelect(o);
        self.myInputDiv.value=o.value?o.value:o;
        try {self.myInputDiv.oninput();} catch(err) {}
        self.clearOptions();
      }
      this.myList.appendChild(opt);
    });
    this.myOptions=options;
    if(this.myOptions.length>0) {
      this.myList.style.display = '';
    }
  }
  clearOptions() {
    this.currentfocus=-1;
    this.myList.innerHTML = "";
    this.myList.style.display = 'none';
  }

}