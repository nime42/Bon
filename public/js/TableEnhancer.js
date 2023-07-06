class TableEnhancer {
  /**
   * Takes a table and makes its columns resizable (but this doesn't work if the table have scrollbars).
   * @param {table-element} table
   */
  static resizeable(table) {
    let headers = table.querySelectorAll("th");
    headers.forEach((h) => {
      let x, w;
      const mouseMove = (e) => {
        const dx = e.clientX - x;
        h.style.width = `${w + dx}px`;
      };
      const mouseUp = (e) => {
        document.removeEventListener("mousemove", mouseMove);
        document.removeEventListener("mouseup", mouseUp);
      };

      let style = `width:2px; height:${10}px;float: right;cursor:col-resize`;
      let resizer = document.createElement("div");
      resizer.style.cssText = style;
      resizer.onmousedown = (e) => {
        x = e.clientX;
        const styles = window.getComputedStyle(h);
        w = parseInt(styles.width, 10);

        document.addEventListener("mousemove", mouseMove);
        document.addEventListener("mouseup", mouseUp);
      };

      h.appendChild(resizer);
    });
  }
  /**
   * Make a table sortable by clicking on its header columns.
   * @param {table-element} table
   * @param {Object{colNr:function}} valuefunctions a function(td-element) thats extract the value from a table column
   * @returns
   */
  static sortable(table,valueFunctions={}) {
    let headers = table.querySelectorAll("th");

    let tableBody = table.querySelector("tbody");
    if (!tableBody) {
      console.warn("The table need to have a tbody element!");
      return;
    }

    headers.forEach((h) => {
      let arrow = document.createElement("i");
      arrow.classList.add("fa", "fa-caret-down");
      arrow.style.display = "none";
      h.appendChild(arrow);
      h.style.cursor = "pointer";

      h.onclick = (event) => {
        if(!(event.target==h || event.target==arrow)) {
          return;
        }
        headers.forEach((th) => {
          if (th !== h) {
            th.querySelector("i").style.display = "none";
          }
        });

        let colIndex = h.cellIndex;
        let qs = `td:nth-child(${colIndex + 1})`;

        let sort = "A";

        let i = h.querySelector("i");
        if (i.style.display === "none") {
          i.style.display = "";
        } else if (i.classList.contains("fa-caret-down")) {
          sort = "D";
          i.classList.replace("fa-caret-down", "fa-caret-up");
        } else if (i.classList.contains("fa-caret-up")) {
          sort = "A";
          i.classList.replace("fa-caret-up", "fa-caret-down");
        }

        let rows = Array.from(tableBody.querySelectorAll("tr"));
        if (valueFunctions[colIndex]) {
          rows.sort((a, b) => {
            let aVal = valueFunctions[colIndex](a.querySelector(qs));
            let bVal = valueFunctions[colIndex](b.querySelector(qs));
            if (sort == "A") {
              return TableEnhancer._compare(aVal, bVal);
            } else {
              return TableEnhancer._compare(bVal, aVal);
            }
          });
        } else {
          rows.sort((a, b) => {
            let aVal = a.querySelector(qs).textContent;
            let bVal = b.querySelector(qs).textContent;
            if (sort == "A") {
              return TableEnhancer._compare(aVal, bVal);
            } else {
              return TableEnhancer._compare(bVal, aVal);
            }
          });
        }

        rows.forEach((r) => tableBody.appendChild(r));
      };
    });
  }

  static _compare(a, b) {
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() - b.getTime();
    }

    if (!isNaN(a) && !isNaN(b)) {
      return a - b;
    }

    if(a) a=a.toLowerCase();
    if(b) b=b.toLowerCase();

    if (a < b) {
      return -1;
    } else if (a > b) {
      return 1;
    } else {
      return 0;
    }
  }

  static filterable(table,valueFunctions={},excludeCols=[]) {
    let header = table.querySelector("thead");
    let headerRow=header.querySelector("tr");

    let tableBody = table.querySelector("tbody");
    if (!tableBody) {
      console.warn("The table need to have a tbody element!");
      return;
    }

    let nrOfCols=headerRow.children.length;
    for(let c=0;c<nrOfCols;c++) {
      headerRow.children[c].appendChild(document.createElement("br"));

      let filterInput=document.createElement("input");
      filterInput.classList.add("filter");
      filterInput.type = "text";
      filterInput.value = "";
      filterInput.placeholder="filter..."
      filterInput.style.maxWidth="10ch"; 
      filterInput.style.height="20px";
      filterInput.onkeyup=()=>{
        let rows = Array.from(tableBody.querySelectorAll("tr"));
        let filters=headerRow.querySelectorAll(".filter");
        rows.forEach(r=>{
          let cols=r.children;
          r.style.display="";
          for(let f=0;f<r.children.length;f++) {
            let filter=filters[f].value;
            let value=valueFunctions[f]?valueFunctions[f](cols[f]):cols[f].textContent.toLowerCase();
            if(!this._filterMatch(value,filter)) {
              r.style.display="none";
            }
          }
        })
      }
      headerRow.children[c].appendChild(filterInput);
      if(excludeCols.find((e)=>(e==c))) {
        filterInput.style.display="none";
      }
    }

  }

  static _filterMatch(value,filter) {
    if(filter.startsWith("<=")) {
      filter=filter.replace("<=","");
      return value <= filter;
    }
    if(filter.startsWith("<")) {
      filter=filter.replace("<","");
      return value < filter;
    }

    if(filter.startsWith(">=")) {
      filter=filter.replace(">=","");
      return value >= filter;
    }
    if(filter.startsWith(">")) {
      filter=filter.replace(">","");
      return value > filter;
    }

    if(filter.startsWith("!")) {
      filter=filter.replace("!","");
      return !value.startsWith(filter);
    }

    return value.startsWith(filter);

  }

}
