class CalendarClass {

    labels= {
        monthNames: [
          "Januar",
          "Februar",
          "Marts",
          "April",
          "Maj",
          "Juni",
          "Juli",
          "August",
          "September",
          "Oktober",
          "November",
          "December",
        ],
        weekNr: "uge",
        weekDays: ["mon", "tir", "ons", "tor", "fre", "lör", "sön"],
      };



    constructor(div,year, month) {
        this.myDiv=div;
        this.init(year, month);
    }


    init(year, month) {
        if (year === undefined) {
          year = new Date().getFullYear();
        }
        if (month === undefined) {
          month = new Date().getMonth();
        }

        this.currentYear=year;
        this.currentMonth=month;

    
        let monthName = month;
        if (this.labels.monthNames[month]) {
          monthName = this.labels.monthNames[month];
        }
    
        let mainElem = document.querySelector(this.myDiv);
    
        mainElem.classList.add("calendar-style");
        mainElem.innerHtml = "";
        let navigation = `
            <span>
              <button type="button" id="prevMonth">&lt;</button>
                <span id="currentMonth" style="min-width: 120px;display: inline-block;text-align: center;">${year} ${monthName}</span>
                <button type="button" id="nextMonth">&gt;</button>
    
            </span>
            `;
    
        mainElem.innerHTML = navigation;
        let headers = `
            <tr>
                    <th style="width:1%">${this.labels.weekNr}</th>
                    <th>${this.labels.weekDays[0]}</th>
                    <th>${this.labels.weekDays[1]}</th>
                    <th>${this.labels.weekDays[2]}</th>
                    <th>${this.labels.weekDays[3]}</th>
                    <th>${this.labels.weekDays[4]}</th>
                    <th>${this.labels.weekDays[5]}</th>
                    <th>${this.labels.weekDays[6]}</th>
                </tr>
            `;
    
        let days = this._createDays(year, month);
    
        let content = `
            <table style="width:80%">
            ${headers}
            ${days}
            </table>
            `;
    
        mainElem.innerHTML += content;

        let self=this;

        mainElem.querySelector("#prevMonth").onclick=function() {self.changeMonth(-1);};
        mainElem.querySelector("#nextMonth").onclick=function() {self.changeMonth(1);};

        mainElem.querySelectorAll(".day-cell:not(.disabled)").forEach(e=>{
          e.onclick=(event)=>{
            if(this.onDateClick && !event.target.classList.contains('event')) {
              let day=parseInt(event.currentTarget.querySelector(".day-nr").innerText);
              this.onDateClick(new Date(self.currentYear,self.currentMonth,day),self);
            }
          };
        });

      }

      changeMonth(direction) {
        let newDate = new Date(this.currentYear, this.currentMonth + direction);
        this.init(newDate.getFullYear(), newDate.getMonth());
      }

      addEvent(date,header,color,misc) {
        if(date.getFullYear()!=this.currentYear || date.getMonth()!=this.currentMonth) {
          return false;
        }
        let self=this;
        let day=date.getDate();
        let dayCell=document.querySelector(this.myDiv+" #day-"+day+":not(.disabled)");

        
        let eventList = dayCell.querySelector("#events");
        let event = document.createElement("div");
        event.innerHTML=header;
        event.myData={
          eventTime:date,
          color:color,
          header:header,
          misc:misc
        }

        event.onclick=function() {
          if(self.onEventClick) {
            self.onEventClick(event,event.myData);
            return false;
          }
        }

        event.style.background=color;
        event.style.color=Helper.contrastColor(color);
        event.classList.add("event");
        eventList.appendChild(event);

        let a=Array.prototype.slice.call(eventList.children);
        a.sort((e1,e2)=>(e2.myData.eventTime.getTime()-e1.myData.eventTime.getTime()));
        a.forEach(e=>{
          eventList.appendChild(e);
        });
        
        return true;
      }

      updateEvent(eventElem,date,header,color,misc) {
        this.deleteEvent(eventElem);
        this.addEvent(date,header,color,misc);
      }


      deleteEvent(eventElem) {
        let date=eventElem.myData.eventTime;
        if(date.getFullYear()!=this.currentYear || date.getMonth()!=this.currentMonth) {
          return false;
        }
        let day=date.getDate();
        let dayCell=document.querySelector(this.myDiv+" #day-"+day+":not(.disabled)");
        let eventList = dayCell.querySelector("#events");

        eventList.removeChild(eventElem);
      }

      setOnDateClick(fun) {
        this.onDateClick=fun;
      }

      setOnEventClick(fun) {
        this.onEventClick=fun;
      }

      _createDays(year, month) {
        let d = new Date(year, month, 1);
        let dayIndex = d.getDay();
    
        let rows = [];
        let currentRow = [];
        let i = new Date(year, month, 2 - dayIndex);
        let c = 0;
        while (
          i.getFullYear() * 12 + i.getMonth() <= year * 12 + month ||
          c % 7 !== 0
        ) {
          currentRow.push(new Date(i));
          i.setDate(i.getDate() + 1);
          c++;
          if (c % 7 === 0) {
            rows.push(currentRow);
            currentRow = [];
          }
        }
    
        let table = "";
        let today=new Date();
        rows.forEach((week) => {
          let weeknr = this._calcWeekNr(
            week[0].getFullYear(),
            week[0].getMonth(),
            week[0].getDate()
          );
          let r = "<tr>\n";
          r += `<td>${weeknr}</td>\n`;
          for (d in week) {
            let day = week[d];
            let disabled=day.getMonth() !== month;
            let isToday=day.getFullYear()===today.getFullYear() && day.getMonth()===today.getMonth() && day.getDate()===today.getDate(); 
            let col = `
                <td id=day-${day.getDate()} class="day-cell ${disabled?'disabled':''}">
                    <div class="day-content">
                    <p class="day-nr"><span class=${isToday?"circle":""}>${day.getDate()}</span></p>
                    <div id=events style="width: 95%;display:flex;flex-direction: column-reverse;height: 100%;">
                    </div>
                    </div>
                </td>`;
            r += col + "\n";
          }
          r += "</tr>\n";
          table += r;
        });
    
        return table;
      }

      _calcWeekNr(year, month, day) {
        let date = new Date(year, month, day);
        date.setHours(0, 0, 0, 0);
        // Thursday in current week decides the year.
        date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
        // January 4 is always in week 1.
        var week1 = new Date(date.getFullYear(), 0, 4);
        // Adjust to Thursday in week 1 and count number of weeks from date to week1.
        return (
          1 +
          Math.round(
            ((date.getTime() - week1.getTime()) / 86400000 -
              3 +
              ((week1.getDay() + 6) % 7)) /
              7
          )
        );
      }




}