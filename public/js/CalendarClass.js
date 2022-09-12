class CalendarClass {

  labels = {
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



  calendarBody = `
      <div class="container calendar" style="margin-top: 5%">
      <div class="row">
          <div class="twelwe columns" style="text-align: center;">
          <div id="header"></div>
          <span>
          <i id="prevMonth" class="fa fa-caret-left" aria-hidden="true" style="font-weight: bold;font-size: 25px;cursor: pointer;"></i>
          <span id="currentMonth" style="text-align: center;padding-left: 10px;padding-right: 10px;font-weight: bold;">2022 April</span>
          <i id="nextMonth" class="fa fa-caret-right" aria-hidden="true" style="font-weight: bold;font-size: 25px;cursor: pointer;"></i>
          </span>
          </div>
      </div>
      <div id="month"/>
      </div> 
      `

  //these are not actually used
  weekRow = `
      <div class="row week-row">
      `;
  weekNrCol = `
      <div class="one column week-nr">v. 1</div>
      `;

  dayCol = `
      <div class="one column day">1</div>
      `;


  constructor(div, year, month) {
    if (typeof div === "string") {
      this.myDiv = document.querySelector(div);
    } else {
      this.myDiv = div;
    }
    this.myDiv.innerHTML=this.calendarBody;

    let self=this;
    this.myDiv.querySelector("#prevMonth").onclick=function() {self.changeMonth(-1);};
    this.myDiv.querySelector("#nextMonth").onclick=function() {self.changeMonth(1);};

    this.init(year, month);
  }


  init(year, month) {
    if (year === undefined) {
      year = new Date().getFullYear();
    }
    if (month === undefined) {
      month = new Date().getMonth();
    }

    this.currentYear = year;
    this.currentMonth = month;


    let monthName = month;
    if (this.labels.monthNames[month]) {
      monthName = this.labels.monthNames[month];
    }

    let today=new Date();
    this.myDiv.querySelector("#currentMonth").innerHTML=`${year} ${monthName}`;
    let monthDiv= this.myDiv.querySelector("#month")
    monthDiv.innerHTML="";


   
    let dayHeaders=document.createElement("div");
    dayHeaders.classList.add("row","week-header","week-row");

    let weekNrCol=document.createElement("div");
    weekNrCol.classList.add("one", "column", "week-nr");
    weekNrCol.innerHTML="";
    dayHeaders.appendChild(weekNrCol);    
    this.labels.weekDays.forEach(d=>{
      let dayCol=document.createElement("div");
      dayCol.classList.add("one", "column","day","day-headers");
      dayCol.innerHTML=d;
      dayHeaders.appendChild(dayCol);
    });

    monthDiv.appendChild(dayHeaders);



    let days=this._createDays(year,month);
    days.forEach(w=>{
      let weekRow=document.createElement("div");
      weekRow.classList.add("row","week-row");
      let weekNrCol=document.createElement("div");
      weekNrCol.classList.add("one", "column", "week-nr");
      weekNrCol.innerHTML=`v. ${this._calcWeekNr(w[0])}`;
      weekRow.appendChild(weekNrCol);
      w.forEach(d=> {
        let dayNrCol=document.createElement("div");
        let disabled=d.getMonth() !== month;
        let isToday=d.toDateString()===today.toDateString();

        dayNrCol.classList.add("one", "column", "day");
        if(disabled) {
          dayNrCol.classList.add("disabled");
        }
        dayNrCol.id=`day-${d.getDate()}`;
        dayNrCol.innerHTML=`<span class="${isToday?"circle-to-day":""} ${disabled?"not-current-month":""}" style="width: min-content;align-self: end;">${d.getDate()}</span>`;

        let self=this;
        if(!disabled) {
          dayNrCol.onclick=(event)=>{
            if(!event.target.classList.contains('event')) {//don't trigger if clicking on a event
              self.onDateClick && self.onDateClick(d,self);
            }
          }
        }
        let events=document.createElement("div");
        events.classList.add("event-list");
        dayNrCol.appendChild(events);

        weekRow.appendChild(dayNrCol);

      })
      monthDiv.appendChild(weekRow);
    })
    this.onMonthChange && this.onMonthChange(this.currentYear,this.currentMonth);

  }

  changeMonth(direction) {
    let newDate = new Date(this.currentYear, this.currentMonth + direction);
    this.init(newDate.getFullYear(), newDate.getMonth());
  }

  addEvent(date, header, color, misc, iconClassTokens) {
    if (date.getFullYear() != this.currentYear || date.getMonth() != this.currentMonth) {
      return false;
    }
    let self = this;
    let day = date.getDate();
    let dayCell = this.myDiv.querySelector( "#day-" + day + ":not(.disabled)");


    let eventList = dayCell.querySelector(".event-list");
    let event = document.createElement("div");
    event.classList.add("event");

    event.innerHTML = header;

    if(iconClassTokens) {
      let icon=document.createElement("li"); 
      iconClassTokens.forEach(t=> {
        icon.classList.add(t);
      })
      event.appendChild(icon);     
    }

    event.myData = {
      eventTime: date,
      color: color,
      header: header,
      misc: misc
    }

    event.onclick = function () {
      if (self.onEventClick) {
        self.onEventClick(event, event.myData);
        return false;
      }
    }

    event.style.background = color;
    event.style.color = "black";
    event.classList.add("event");
    eventList.appendChild(event);

    let a = Array.prototype.slice.call(eventList.children);
    a.sort((e1, e2) => (e2.myData.eventTime.getTime() - e1.myData.eventTime.getTime()));
    a.forEach(e => {
      eventList.appendChild(e);
    });

  

    return true;
  }




  updateEvent(eventElem, date, header, color, misc,iconClassTokens) {
    this.deleteEvent(eventElem);
    this.addEvent(date, header, color, misc,iconClassTokens);
  }


  deleteEvent(eventElem) {
    let date = eventElem.myData.eventTime;
    if (date.getFullYear() != this.currentYear || date.getMonth() != this.currentMonth) {
      return false;
    }
    let day = date.getDate();
    let dayCell = this.myDiv.querySelector( "#day-" + day + ":not(.disabled)");
    let eventList = dayCell.querySelector(".event-list");

    eventList.removeChild(eventElem);
  }

  setOnDateClick(fun) {
    this.onDateClick = fun;
  }

  setOnEventClick(fun) {
    this.onEventClick = fun;
  }

  setOnMonthChange(fun, refresh) {
    this.onMonthChange = fun;
    if (refresh) {
      this.onMonthChange(this.currentYear, this.currentMonth);
    }
  }

  getAllEvents() {
    return [...this.myDiv.querySelectorAll(".event")].map(e=>({elem:e,data:e.myData}));
  }

  getHeaderDiv() {
    return this.myDiv.querySelector("#header");
  }

  _createDays(year, month) {
    let d = new Date(year, month, 1);
    let dayIndex = d.getDay();

    let rows = [];
    let currentRow = [];
    let i = new Date(year, month, d.getDate()-((6+dayIndex)%7));
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

    return rows;
    
  }

  _calcWeekNr(datum) {
    let date=new Date(datum);
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