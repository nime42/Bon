class BonCalendar {

    constructor(div) {

        this.myPopup = new ModalPopup();
        this.myCalendar = new CalendarClass("#calendar");
        this.myRepo = new BonRepository();
        this.myBonForm = new BonForm(this.myPopup, this.myCalendar, this.myRepo);
        //this.myBonForm.updateItems();
        let self=this;

        this.myCalendar.setOnDateClick((date, calObj) => {
            date.setHours(12);
            self.myBonForm.init({
                eventTime: date
            });
            self.myPopup.show(self.myBonForm.getForm());
        });
        this.myCalendar.setOnEventClick((eventElem, eventData) => {
            self.myBonForm.init(eventData, eventElem);
            self.myPopup.show(self.myBonForm.getForm());
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
}