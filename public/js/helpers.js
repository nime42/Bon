

class Helper {
  static getFormProps(form) {
    let res = {};
    form.querySelectorAll("input, textarea, select").forEach((e) => {
      let name = e.getAttribute("name");
      if (name !== null) {
        if(e.type==="checkbox") {
          res[name] = e.checked?1:0;
        } else {
          res[name] = e.value;
        }
      }
    });
    return res;
  }

  //copied from https://stackoverflow.com/questions/34980574/how-to-extract-color-values-from-rgb-string-in-javascript/34980657
  static colorValues(color) {
      if (color === '')
          return;
      if (color.toLowerCase() === 'transparent')
          return [0, 0, 0, 0];
      if (color[0] === '#')
      {
          if (color.length < 7)
          {
              // convert #RGB and #RGBA to #RRGGBB and #RRGGBBAA
              color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3] + (color.length > 4 ? color[4] + color[4] : '');
          }
          return [parseInt(color.substr(1, 2), 16),
              parseInt(color.substr(3, 2), 16),
              parseInt(color.substr(5, 2), 16),
              color.length > 7 ? parseInt(color.substr(7, 2), 16)/255 : 1];
      }
      if (color.indexOf('rgb') === -1)
      {
          // convert named colors
          var temp_elem = document.body.appendChild(document.createElement('fictum')); // intentionally use unknown tag to lower chances of css rule override with !important
          var flag = 'rgb(1, 2, 3)'; // this flag tested on chrome 59, ff 53, ie9, ie10, ie11, edge 14
          temp_elem.style.color = flag;
          if (temp_elem.style.color !== flag)
              return; // color set failed - some monstrous css rule is probably taking over the color of our object
          temp_elem.style.color = color;
          if (temp_elem.style.color === flag || temp_elem.style.color === '')
              return; // color parse failed
          color = getComputedStyle(temp_elem).color;
          document.body.removeChild(temp_elem);
      }
      if (color.indexOf('rgb') === 0)
      {
          if (color.indexOf('rgba') === -1)
              color += ',1'; // convert 'rgb(R,G,B)' to 'rgb(R,G,B)A' which looks awful but will pass the regxep below
          return color.match(/[\.\d]+/g).map(function (a)
          {
              return +a
          });
      }


  }

  static contrastColor(color) {
      let [r,g,b]=this.colorValues(color);
    var yiq = ((r*299)+(g*587)+(b*114))/1000;
	return (yiq >= 128) ? 'black' : 'white';
  }

  static expandShrinkField(legend) {
      if(legend.classList.contains("fa-caret-down")) {
        legend.parentElement.parentElement.querySelector(".field-content").style.display="";
        legend.classList.toggle("fa-caret-down");
        legend.classList.toggle("fa-caret-up");
      } else {
        legend.parentElement.parentElement.querySelector(".field-content").style.display="none";
        legend.classList.toggle("fa-caret-down");
        legend.classList.toggle("fa-caret-up");
      }
      
  }

  static typeInTextarea(newText, el = document.activeElement) {
    const [start, end] = [el.selectionStart, el.selectionEnd];
    el.setRangeText(newText, start, end, 'select');
  }


  static expandCollapse(caret,collapsibleId) {
    let collapsElem=document.querySelector(collapsibleId);
    if(caret.classList.contains("fa-caret-down")) {
      collapsElem.style.display="";
      caret.classList.toggle("fa-caret-down");
      caret.classList.toggle("fa-caret-up");
    } else {
      collapsElem.style.display="none";
      caret.classList.toggle("fa-caret-down");
      caret.classList.toggle("fa-caret-up");
    }

  }

/**
 * Replaces all variable references "${key}" in  atext with the value for that key in values-element
 * example
 * replaceAllFromValues("Hello ${name} ${lastname}!", {name:"Bob",lastname:"Smith"}) => "Hello Bob Smith!"
 *
 * @static
 * @param {*} text
 * @param {*} values
 * @return {*} 
 * @memberof Helper
 */
static replaceAllFromValues(text, values) {
    Object.keys(values).forEach(k => {
      text = text.replaceAll("${" + k + "}", values[k]);
    });
    return text;
  }


  static isNumeric(num){
    return !isNaN(num)
  }

  static formatDate(date) {
    if(date) {
      return  `${new Date(date).toLocaleDateString("sv-SE")} ${new Date(date).toLocaleTimeString("sv-SE",{hour: '2-digit', minute:'2-digit'})}`;
    } else {
      return "";
    }
  }

}


