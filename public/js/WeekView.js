class WeekView {
    background = Globals.background;
    foreground = Globals.foreground;
    shadowColor = Globals.shadowColor;
    content = `
    <style>
        #week-table {
            overflow:auto;
            margin:5%
        }
        #week-table table {
            background: ${this.background};
            border-radius: 16px;
            border-collapse: collapse;
            box-shadow: 5px 5px 5px grey;
        }
        #week-table th,td {
            border-right: solid 1px ${this.foreground}; 
            border-left: solid 1px ${this.foreground};
            border-bottom: none;
        }

        #week-table th:last-child,td:last-child {
            border-right: none; 
            border-left: none;

        }

        #week-table th:first-child,td:first-child {
            border-right: none; 
            border-left: none;

        }        

        #week-table th {
            text-align: center;
            padding:2px;
            color: ${this.foreground};
        }

        #week-table tr {
            border-bottom: solid 1px ${this.foreground};
        }
        #week-table tbody tr:last-child {
        border-bottom: none;
        }

        #week-table td {
            text-align: center;
            padding:4px;
            vertical-align: bottom;
            min-width:120px;
        }  
        
        #week-table td:first-child {
            vertical-align: middle;
            font-weight: bold;
            color: ${this.foreground};
        }


        #week-table .entry {
            border: 0.5px solid black;  
            padding: 3px;
            border-radius: 6px;
            height: 16px;
            font-size: small;
            cursor: pointer;
            white-space: nowrap;
            overflow: hidden;
            width:fit-content;
          }

        #week-table .missing {
            border: 4px solid red !important;
        }



        #week-table .today {
            text-decoration: underline;
            text-decoration-color: red;
            text-decoration-thickness: 3px;
        }

    </style>
    <div id="week-table">
    <table>
    <caption>
    <div id="status-filter"></div>
    <br>
    <i id="prev-week" class="fa fa-caret-left" aria-hidden="true" style="font-size: larger;color:${this.foreground};cursor: pointer;"></i><span id="current-week" style="margin-left: 20px;margin-right: 20px;color:${this.foreground};font-weight: bold;">Uge 23, 2022</span> <i id="next-week" class="fa fa-caret-right" aria-hidden="true" style="font-size: larger;color:${this.foreground};cursor: pointer;"></i>
    </caption>
    <thead>
    <tr>
      <th></th>
      <th>Mon</th>
      <th>Tir</th>
      <th>Ons</th>
      <th>Tor</th>
      <th>Fre</th>
      <th>Lør</th>
      <th>Søn</th>
    </tr>
    </thead>
    <tbody>
    </tbody>
  </table>


  </div>
    `;

    instanceRow = `
    <td class="instance-name"></td>
    <td class="day-0"></td>
    <td class="day-1"></td>
    <td class="day-2"></td>
    <td class="day-3"></td>
    <td class="day-4"></td>
    <td class="day-5"></td>
    <td class="day-6"></td>    
    `;



    constructor(div) {

        if (typeof div === "string") {
            this.myDiv = document.querySelector(div);
        } else {
            this.myDiv = div;
        }
        this.myDiv.innerHTML = this.content;

        let today = new Date();
        this.currentMonday = this._getMonday(today);

        let self = this;
        this.myDiv.querySelector("#prev-week").onclick = () => {
            self.changeWeek(-1);
        }
        this.myDiv.querySelector("#next-week").onclick = () => {
            self.changeWeek(1);
        }

        this.myRepo = new BonRepository();
        this.myPopUp = new ModalPopup();
        this.myBonStripDiv = document.createElement("div");
        this.myBonStrip = new BonStrip(this.myBonStripDiv, false, { hideGotoMap: true });
        this.myBonStrip.showMails();
        this.myBonStrip.setOnMailSeen((bonId) => {
            let entries = Array.from(this.myDiv.querySelectorAll(".entry"));
            let e = entries.find(elem => (elem.myData.id === bonId));
            if (e) {
                e.querySelector(".mail").style.display = "none";
            }
        })

        this.myInstances = [];
        this.myBonStrip.isMoveable(true, (status, data) => {
            this.myPopUp.hide();
            this.refresh();
        }, () => { return this.myInstances });

        this.myStatusFilter = new BonStatusFilter(this.myDiv.querySelector("#status-filter"));
        this.myStatusFilter.setOnStatusChange((changedStatus, statusValues) => {
            let show = statusValues[changedStatus];

            self.myDiv.querySelectorAll(".status-" + changedStatus).forEach((e) => {
                if (show) {
                    e.style.display = "";
                } else {
                    e.style.display = "none";
                }
            })
        });

    }

    _filter() {
        let self = this;
        let statuses = this.myStatusFilter.getStatuses();
        Object.keys(statuses).forEach(k => {
            let statusName = k;
            let active = statuses[k];

            self.myDiv.querySelectorAll(".status-" + statusName).forEach((e) => {
                if (active) {
                    e.style.display = "";
                } else {
                    e.style.display = "none";
                }
            })

        })
    }


    initWeek(date) {
        let year = date.getFullYear();
        let week = this._calcWeekNr(date);
        let monday = this._getMonday(date);

        this.myDiv.querySelector("#current-week").innerHTML = `Uge ${week}, ${year}`;

        let headers = this.myDiv.querySelectorAll("th");

        let today = new Date().toDateString();

        let day = new Date(monday);
        for (let d = 0; d < 7; d++) {
            day.setTime(monday.getTime() + d * (24 * 3600 * 1000));
            let weekday = day.toLocaleString("default", { weekday: "short" });
            let header = `${weekday}<br>${day.getDate()}/${day.getMonth() + 1}`;
            headers[d + 1].innerHTML = header;
            if (day.toDateString() === today) {
                headers[d + 1].classList.add("today");
            } else {
                headers[d + 1].classList.remove("today");
            }
        }

    }

    changeWeek(direction) {
        this.currentMonday.setDate(this.currentMonday.getDate() + (direction * 7));
        this.initWeek(this.currentMonday);
        this.onChange && this.onChange(this.currentMonday);

    }

    setOnChange(fun) {
        this.onChange = fun;
    }

    refresh() {
        this.changeWeek(0);
    }


    fetchBons(monday) {
        this.myInstances = [];
        this.myRepo.getBonsForWeek(monday, (bonInstances) => {
            let tbody = this.myDiv.querySelector("tbody");
            tbody.innerHTML = "";
            bonInstances.forEach(i => {
                this.myInstances.push({ instance: i.instance, prefix: i.prefix });
                let tr = document.createElement("tr");
                tr.innerHTML = this.instanceRow;
                tr.id = i.prefix;
                tr.querySelector(".instance-name").innerHTML = i.instance;
                tbody.appendChild(tr);
                i.bons.forEach(b => {
                    this.addBon(b);
                })
            })


            this._filter();

            this.checkNewMails();

            this.myRepo.checkBonStock((status, instances) => {
                if (status) {
                    instances.forEach(i => {
                        i.bons.forEach(b => {
                            if (b.missingSummary) {
                                this._markAsMissing(b.id);
                            }

                        })
                    })
                }
            })

        });
    }

    addBon(bon) {
        let weekday = (7 + new Date(bon.delivery_date).getDay() - 1) % 7; //monday is 0
        let [prefix, id] = bon.id.split("-");
        let tbody = this.myDiv.querySelector("tbody");
        let row = tbody.querySelector("#" + prefix);
        let col = row.querySelector(".day-" + weekday);

        this._insertEntry(bon, col);

    }

    checkNewMails() {
        this.myRepo.getAllUnseenBonIdMails((bonIds) => {
            let entries = Array.from(this.myDiv.querySelectorAll(".entry"));
            bonIds.forEach(i => {
                let e = entries.find(elem => (elem.myData.id === i));
                if (e) {
                    e.querySelector(".mail").style.display = "";
                }
            })
        })
    }

    _markAsMissing(bonId) {
        let e = this.myDiv.querySelector("#" + bonId);
        e && e.classList.add("missing");
    }

    _insertEntry(bon, col) {
        let [prefix, id] = bon.id.split("-");
        let color = Globals.Statuses[bon.status]?.color;
        let time = new Date(bon.delivery_date).toLocaleTimeString("default", { hour: '2-digit', minute: '2-digit' });
        let pax = "P:" + (bon.nr_of_servings != "" ? bon.nr_of_servings : 0);
        if (bon.pax_units) {
            pax = "(" + bon.pax_units.trim() + ")";
        }
        let div = `<div id='${bon.id}' class="entry status-${bon.status}" style="background: ${color}; color: black;"><li class="fa fa-wrench" style="display:${bon.payment_type === "Produktion" ? "" : "none"}"></li>${time},#${id},${pax}<li class="fa fa-envelope mail" style="display:none"></li></div>`
        let entries = Array.from(col.childNodes);
        if (entries.length === 0) {
            col.insertAdjacentHTML("beforeend", div);
        } else {
            let bonDate = new Date(bon.delivery_date);
            let i = 0;
            let after = entries[i];
            while (i < entries.length && bonDate > new Date(entries[i].myData.delivery_date)) {
                after = entries[i];
                i++;
            }
            after.insertAdjacentHTML("afterend", div);
        }
        col.querySelector("#" + bon.id).myData = bon;
        col.querySelector("#" + bon.id).onclick = () => { this.onSelectBon(bon); }
    }

    onSelectBon(bon) {

        this.myBonStrip.initFromBon(bon, bon.orders);
        this.myPopUp.show(this.myBonStripDiv);




    }

    _getMonday(d) {
        d = new Date(d);
        var day = d.getDay(),
            diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
        return new Date(d.setDate(diff));
    }

    _calcWeekNr(datum) {
        let date = new Date(datum);
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