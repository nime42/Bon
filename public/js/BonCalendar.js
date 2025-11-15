class BonCalendar {




    constructor(calendarDiv) {
        let self = this;

        this.myPopup = new OverLay();
        this.myCalendar = new CalendarClass(calendarDiv);


        this.myStatusFilter = new BonStatusFilter(this.myCalendar.getHeaderDiv());
        this.myStatusFilter.setOnStatusChange(() => {
            self.refresh();
        })


        this.myRepo = new BonRepository();
        this.myBonForm = new BonForm(this.myPopup, this.myRepo);


        this.myCalendar.setOnDateClick((date, calObj) => {
            date.setHours(12);
            self.myBonForm.initFromDate(date, (event, arg1, arg2, arg3) => {
                if (event === "saved") {
                    let bon = arg1;
                    let [label, statusColor, icons] = self.myBonForm.createBonLabelAndcolor(bon);
                    self.myCalendar.addEvent(bon.delivery_date, label, statusColor, bon, icons);
                }



            });
        });

        this.myCalendar.setOnEventClick((eventElem, eventData) => {
            self.myBonForm.initFromBonId(eventData.misc.id, (event, arg1, arg2, arg3) => {
                let label, statusColor, icons;
                let bon = arg1 ? arg1 : eventData.misc;
                switch (event) {
                    case "saved":
                    case "canceled":
                        [label, statusColor, icons] = self.myBonForm.createBonLabelAndcolor(bon, self.haveUnSeenMail(bon.id));
                        self.myCalendar.updateEvent(eventElem, bon.delivery_date, label, statusColor, bon, icons);
                        break;
                    case "copied":
                        [label, statusColor] = self.myBonForm.createBonLabelAndcolor(bon);
                        self.myCalendar.addEvent(bon.delivery_date, label, statusColor, bon);
                        break;
                    case "deleted":
                        self.myCalendar.deleteEvent(eventElem);
                        break
                }
                self.updateDayInfo(bon.delivery_date);
                self.updateDayInfo(eventData.eventTime);
            })
            //self.myBonForm.init(eventData, eventElem);
            //self.myPopup.show(self.myBonForm.getForm());
        });



        this.myCalendar.setOnMonthChange((year, month) => {
            let p = MessageBox.popup("Henter Bons...");
            let statuses = self.myStatusFilter.getStatuses();
            self.myRepo.getBons(year, month + 1, (bons) => {
                bons.forEach(b => {
                    if (statuses[b.status]) {
                        b.delivery_date = new Date(b.delivery_date);
                        let [label, statusColor, icons] = self.myBonForm.createBonLabelAndcolor(b);
                        self.myCalendar.addEvent(b.delivery_date, label, statusColor, b, icons);
                    }
                });
                p.hide();
                self.UpdateUnseenIds();
                self.updateDayInfo();
            });

        });




    }
    refresh() {
        this.myCalendar.changeMonth(0);
    }

    haveUnSeenMail(bonId) {
        let unseen = Globals?.unSeenMailIds?.find(e => (e == bonId));
        return unseen ? true : false;
    }

    mailSeen(bonId) {
        Globals.unSeenMailIds = Globals?.unSeenMailIds?.filter(function (item) {
            return item != bonId
        })
    }

    UpdateUnseenIds() {
        this.myRepo.getUnseenBonIdMails((ids) => {
            Globals.unSeenMailIds = ids;
            ids.forEach(i => {
                let event = this.getAllEvents().find(e => (e.data.misc.id == i))
                if (event) {
                    let icons = [["fa", "fa-envelope"]];
                    if (event.data.misc.payment_type === "Produktion") {
                        icons.push(["fa", "fa-wrench"]);
                    }
                    this.myCalendar.updateEvent(event.elem, event.data.eventTime, event.data.header, event.data.color, event.data.misc, icons);
                }
            });
        })


    }

    getAllEvents() {
        return this.myCalendar.getAllEvents();
    }

    updateDayInfo(date = undefined) {
        let events;
        if (date) {
            events = this.getAllEvents().filter(e => (e.data.eventTime.toDateString() === date.toDateString()));
        } else {
            events = this.getAllEvents();
        }

        const daysWithInfo = {};
        events.forEach(e => {
            const dateStr = e.data.eventTime.toISOString().split('T')[0];

            if (!daysWithInfo[dateStr]) {
                daysWithInfo[dateStr] = [];
            }
            daysWithInfo[dateStr].push(e.data.misc);
        });
        for (const [dateStr, bons] of Object.entries(daysWithInfo)) {
            const date = new Date(dateStr);
            const nrofPax = bons.map(b => {
                if (b.status === "closed") return 0;

                if (Number(b.pax_units) > 0) {
                    return Number(b.pax_units)
                } else if (Number(b.nr_of_servings) > 0) {
                    return Number(b.nr_of_servings)
                } else {
                    return 0;
                }
            })

            const totalPax = nrofPax.reduce((a, b) => a + b, 0);
            this.myCalendar.updateDayInfo(date, `Total: ${totalPax}`);

        }
    }

}