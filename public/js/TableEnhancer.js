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
        console.log(dx, `${w + dx}px`);
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
   * @returns
   */
  static sortable(table) {
    let headers = table.querySelectorAll("th");

    let tableBody = table.querySelector("tbody");
    if (!tableBody) {
      console.warn("The table need to have a tbody element!");
      return;
    }

    headers.forEach((h) => {
      let i = document.createElement("i");
      i.classList.add("fa", "fa-caret-down");
      i.style.display = "none";
      h.appendChild(i);
      h.style.cursor = "pointer";

      h.onclick = () => {
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
        rows.sort((a, b) => {
          let aVal = a.querySelector(qs).textContent;
          let bVal = b.querySelector(qs).textContent;
          if (sort == "A") {
            return TableEnhancer._compare(aVal, bVal);
          } else {
            return TableEnhancer._compare(bVal, aVal);
          }
        });

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

    if (a < b) {
      return -1;
    } else if (a > b) {
      return 1;
    } else {
      return 0;
    }
  }
}
