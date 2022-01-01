

class Helper {
  static getFormProps(form) {
    let res = {};
    form.querySelectorAll("input").forEach((e) => {
      let name = e.getAttribute("name");
      if (name !== null) {
        res[name] = e.value;
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

}



class DayPopupContent {
    content=`
    <div style="background:white;padding:20px;border-radius: 10px;border: 3px solid black;border-style: double;">
    <form id="order">
    <fieldset>
        <legend>Dato</legend>
        <span>
            <input type="date" id="date" name="date">
            <input type="time" id="time" name="time">
        </span>
    </fieldset>
    <fieldset>
        <legend>Kunde</legend>
        <input type="text" name="customer" placeholder="Kunde"><br><br>
        <input type="email" name="mail" placeholder="E-mail"><br><br>
        <input type="tel" name="phone" placeholder="Telefon"><br><br>
    </fieldset>
    <br>
    <span>
        <input type="submit" value="Spara">
        <input type="button" id="delete" value="Ta bort" class="for-update">
        <input type="button" id="copy" value="Kopier" class="for-update">
        <span>&nbsp;&nbsp;</span>
        <input type="button" id="cancel" value="Avbryt">

    </span>
    </form>
    </div>
    
    `
    constructor(popupObj,calendarObj) {
        this.myPopupObj=popupObj;
        this.myCalendarObj=calendarObj;
        this.myDiv=document.createElement("div");
        this.myDiv.innerHTML=this.content;
        let self=this;
        let form=this.myDiv.querySelector("#order");
        form.onsubmit=function() {
            let props=Helper.getFormProps(form);
            let d=new Date(props.date+"T"+props.time);
            self.myPopupObj.hide();

            if(self.currentEvent!==undefined) {
                self.myCalendarObj.updateEvent(self.currentEvent,d,props.time+":"+props.customer,"red",props);
            } else {
                self.myCalendarObj.addEvent(d,props.time+":"+props.customer,"red",props);
            }
            return false;
        }

        form.querySelector("#cancel").onclick=function(e) {
            self.myPopupObj.hide();
        };

        form.querySelector("#delete").onclick=function(e) {
            if(self.currentEvent!==undefined) {
                self.myCalendarObj.deleteEvent(self.currentEvent);
            }
            MessageBox.popup("Vill du verkligen ta bort?",{b1:{text: "Ja"},b2:{text:"Nej"}});
            return;
            self.myPopupObj.hide();
        };

        form.querySelector("#copy").onclick=function(e) {
            if(self.currentEvent!==undefined) {
                let props=Helper.getFormProps(form);
                let d=new Date(props.date+"T"+props.time);
                self.myCalendarObj.addEvent(d,props.time+":"+props.customer,"red",props);

            }
            self.myPopupObj.hide();
        };


    }

    setupContent(content,eventElem) {
        let date=content.eventTime;
        this._clear();

        this.currentEvent=eventElem;

        let display="none";
        let eventData=undefined;
        if(eventElem!==undefined) {
            eventData=eventElem.myData;
            display="";
        }
        this.myDiv.querySelectorAll(".for-update").forEach(e=>{
            e.style.display=display;
        });
        
        let yearStr=date.getFullYear()+"";
        let monthStr=((date.getMonth()+1)+"").padStart(2,"0");
        let dayStr=(date.getDate()+"").padStart(2,"0");
        let hourStr=(date.getHours()+"").padStart(2,"0");
        let minuteStr="00";

        let dateElem=this.myDiv.querySelector("#date");
        dateElem.value=yearStr+"-"+monthStr+"-"+dayStr;

        let timeElem=this.myDiv.querySelector("#time");
        timeElem.value=hourStr+":"+minuteStr;

        if (eventData !== undefined) {
          this.myDiv.querySelectorAll("#order input").forEach((e) => {
            let name = e.getAttribute("name");
            if (name !== null) {
                if(eventData.misc[name]!==undefined) {
                    e.value=eventData.misc[name];
                }
            }
          });
        }



    }

    _clear() {
        this.myDiv.querySelectorAll("#order input").forEach((e) => {
            let name = e.getAttribute("name");
            if (name !== null) {
              e.value="";
            }
        });

        this.myDiv.querySelectorAll(".for-update").forEach(e=>{
            e.style.display="none";
        })  
    }



    getContent() {
        return this.myDiv;;
    }
}