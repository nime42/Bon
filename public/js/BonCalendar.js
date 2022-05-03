class BonCalendar {

    constructor(div) {

        this.myPopup = new OverLay();
        this.myCalendar = new CalendarClass("#calendar");
        this.myRepo = new BonRepository();
        this.myBonForm = new BonForm(this.myPopup, this.myRepo);
        //this.myBonForm.updateItems();
        let self=this;

        this.myCalendar.setOnDateClick((date, calObj) => {
            date.setHours(12);
            self.myBonForm.initFromDate(date,(event,arg1,arg2,arg3) => {
                if(event==="saved") {
                    let bon=arg1;
                    let [label,statusColor]=self.myBonForm.createBonLabelAndcolor(bon);
                    self.myCalendar.addEvent(bon.delivery_date,label,statusColor,bon);
                }


            
            });
        });

        this.myCalendar.setOnEventClick((eventElem, eventData) => {
            self.myBonForm.initFromBonId(eventData.misc.id,(event,arg1,arg2,arg3) => {
                let bon,label,statusColor;
                switch(event) {
                    case "saved":
                        bon=arg1;
                        [label,statusColor]=self.myBonForm.createBonLabelAndcolor(bon);
                        self.myCalendar.updateEvent(eventElem,bon.delivery_date,label,statusColor,bon);
                        break;
                    case "copied":
                        bon=arg1;
                        [label,statusColor]=self.myBonForm.createBonLabelAndcolor(bon);
                        self.myCalendar.addEvent(bon.delivery_date,label,statusColor,bon);
                        break;
                    case "deleted":
                        self.myCalendar.deleteEvent(eventElem);



                }
                console.log(event);
            })
            //self.myBonForm.init(eventData, eventElem);
            //self.myPopup.show(self.myBonForm.getForm());
        });



        this.myCalendar.setOnMonthChange((year, month) => {
            self.myRepo.getBons(year, month + 1, (bons) => {
                bons.forEach(b => {
                    b.delivery_date = new Date(b.delivery_date);
                    let [label, statusColor] = self.myBonForm.createBonLabelAndcolor(b);
                    self.myCalendar.addEvent(b.delivery_date, label, statusColor, b);

                });
            });

        }, true);
        



    }
    refresh() {
        this.myCalendar.changeMonth(0);
    }
}