class DraggableList {
    noBullets = `
    list-style-type: none; /* Remove bullets */
    padding: 0; /* Remove padding */
    margin: 0; /* Remove margins */
    `;

    constructor(div, noBullets) {
        if (typeof div === "string") {
            this.myDiv = document.querySelector(div);
        } else {
            this.myDiv = div;
        }
        this.myUl = document.createElement("ul");
        this.myDiv.appendChild(this.myUl);
        this.myUl.classList.add("draggable-list");

        if (noBullets) {
            this.myUl.style.cssText = this.noBullets;
        }

        let self = this;
        this.dragIndex = null;
        this.myUl.addEventListener('drag', (ev) => {

            if (self.dragIndex === null) {
                self.dragIndex = self._getElemIndex(ev.target);
            }
        });
        this.myUl.addEventListener('dragover', (ev) => {
            ev.preventDefault();
        });
        this.myUl.addEventListener('drop', (ev) => {
            let dropIndex = self._getElemIndex(self._getDraggagleParent(ev.target));
            let elem = self.myUl.children[self.dragIndex]
            let referenceElem = self.myUl.children[dropIndex];

            if (elem === referenceElem) return;

            self.myUl.removeChild(elem);

            if (dropIndex > self.dragIndex) {
                self._insertAfter(elem, referenceElem)
            } else {
                self.myUl.insertBefore(elem, referenceElem);
            }

            self.dragIndex = null;
        });


    }

    _getElemIndex(child) {
        let i = 0;
        while ((child = child.previousSibling) != null) {
            i++;
        }
        return i;
    }

    _getDraggagleParent(child) {
        let parent = child;
        while (parent !== null && !parent.hasAttribute("draggable")) {
            parent = parent.parentElement;
        }
        return parent;
    }

    _insertAfter(newNode, existingNode) {
        existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
    }

    addElem(content) {
        let li = document.createElement("li");
        li.style.marginBottom = "0px";
        if (typeof content === "string") {
            li.innerHTML = content;
        } else {
            li.appendChild(content);
        }
        li.setAttribute("draggable", true);


        this.myUl.appendChild(li);
    }
    getElems() {
        return this.myUl.children;
    }
    removeElem(elem) {
        this.myUl.removeChild(elem.parentElement);
    }
    clear() {
        this.myUl.innerHTML = "";
    }
    sort(sortFun) {
        let elems = [...this.myUl.children];
        let self = this;
        elems.sort(sortFun).forEach(e => {
            self.myUl.appendChild(e);
        })
    }
}
