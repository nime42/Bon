class AutoCompleteClass {
  constructor(inputDiv) {
    this.myInputDiv = inputDiv;
    this.myList = document.createElement("datalist");
    this.myList.id = this.myInputDiv.id + "-datalist";
    this.myInputDiv.setAttribute("list", this.myList.id);
    this.myOptions=[];
    document.querySelector("body").appendChild(this.myList);
    let self = this;
    this.myInputDiv.onkeyup = () => {
      if (self.typingFunction) {
        self.myList.innerHTML = "";
        let found = self.myOptions.find(
          (e) => (e.value ? e.value : e) === self.myInputDiv.value
        );
        if (!found) {
          let listElems = self.typingFunction(self.myInputDiv.value);
          if (listElems) {
            self.setOptions(listElems);
          }
        }
      }
    };
  }

  setOptions(options) {
    this.myList.innerHTML = "";

    options.forEach((e) => {
      let opt = document.createElement("option");
      opt.value = e.value?e.value:e;
      this.myList.appendChild(opt);
    });
    this.myOptions=options;
  }
  clearOptions() {
    this.myList.innerHTML = "";
  }

}