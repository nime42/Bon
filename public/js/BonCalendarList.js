class BonCalendarList {
    content = `
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <div id="status-filter" style="margin-top:10px"></div>
            <span style="margin-top:8px;">
                <i id="prevMonth" class="fa fa-caret-left" aria-hidden="true" style="font-weight: bold;font-size: 25px;cursor: pointer;"></i>
                <span id="currentMonth" style="text-align: center;padding-left: 10px;padding-right: 10px;font-weight: bold;">2025 November</span>
                <i id="nextMonth" class="fa fa-caret-right" aria-hidden="true" style="font-weight: bold;font-size: 25px;cursor: pointer;"></i>
            </span>
        </div>
        <style>
            #table-calendar-list {
                font-family: Arial, sans-serif;
                border-collapse: collapse; 
                margin-top:15px; 
                box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
            }
            #table-calendar-list th, #table-calendar-list td {
                padding: 5px 2px 2px 5px;
                text-align: left;
                border-bottom: 1px solid #ddd;
                font-size: 0.9em;
                line-height: 1.6;
                font-weight: 400;
                font-family: "Raleway", "HelveticaNeue", "Helvetica Neue", Helvetica, Arial, sans-serif;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 150px;
                }


            #table-calendar-list tr:hover {
                background-color: #f1f1f1;
            }
        </style>
        
        <div class="tableFixHead" style="width:100%;height: 55vh; overflow-x:auto; margin-top:10px; overflow-y:auto;">
            <table id="table-calendar-list" style="margin:auto; width:95%;" border="1">
                <thead style="background-color: #f5f5f5; font-weight: bold;">
                    <tr>
                        <th>Id</th>
                        <th>Dato</th>
                        <th>Status</th>
                        <th>Pax</th>
                        <th>Paxenhedder</th>
                        <th>Køkkenet vælger</th>
                        <th>Navn</th>
                        <th>Tlf</th>
                        <th>Firma</th>
                        <th>Betaling</th>
                        <th>Kort</th>
                    </tr>
                </thead>
                <tbody id="bons-table-body" style="background-color: white;">
                    <!-- rows will be injected here -->
                </tbody>
            </table>
        </div>
        <i id="add-bon" class="fa fa-plus-circle" aria-hidden="true" style="margin-left: 50%;font-size:25px;cursor: pointer;" title="Ny Bon"></i>

    `



    constructor(div) {
        let self = this;

        if (typeof div === "string") {
            this.myDiv = document.querySelector(div);
        } else {
            this.myDiv = div;
        }
        this.myDiv.innerHTML = this.content;

        this.myStatusFilter = new BonStatusFilter(this.myDiv.querySelector("#status-filter"));



        this.myDiv.querySelector("#prevMonth").onclick = function () { self.changeMonth(-1); };
        this.myDiv.querySelector("#nextMonth").onclick = function () { self.changeMonth(1); };

        this.myDiv.querySelector("#add-bon").onclick = () => {
            Globals.myCalender.myBonForm.initFromDate(new Date(), (event) => {
                if (event !== "canceled") {
                    this.init();
                }
            });
        }


        this.myRepo = new BonRepository();

        this.currentDate = new Date();
        this.currentDate.setDate(1);
        this.currentDate.setHours(0);
        this.currentDate.setHours(0, 0, 0, 0);

        this.myBonTable = this.myDiv.querySelector("#table-calendar-list");

        TableEnhancer.sortable(this.myBonTable, { 0: (td) => (parseInt(td.textContent.replace("#", ""))) });

        const statusLabel2status = {};
        Object.values(Globals.Statuses).forEach(s => {
            statusLabel2status[s.label] = s.name;
        })

        const statusFilterFunction = (value, filter) => {
            const activeStatuses = this.myStatusFilter.getStatuses();
            const statusName = statusLabel2status[value];
            return activeStatuses[statusName];
        }

        this.myStatusFilter.setOnStatusChange((id, statuses) => {
            TableEnhancer.filter(this.myBonTable);
        })

        TableEnhancer.filterable(this.myBonTable, { 2: statusFilterFunction }, [2, 10]);

        this.init();


    }


    init() {
        this.myDiv.querySelector("#currentMonth").innerHTML = `${this.currentDate.getFullYear()} ${this.currentDate.toLocaleString('default', { month: 'short' })}`;
        let firstDay = new Date(this.currentDate);
        firstDay = firstDay.toISOString().split('T')[0];

        this.myRepo.getUnseenBonIdMails((ids) => {
            Globals.unSeenMailIds = ids;
            this.myRepo.searchBons({ afterDate: firstDay }, (bons) => {
                this.loadBons(bons);
            })
        });
    }

    refresh() {
        this.changeMonth(0);
    }

    changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.init();
    }


    haveUnSeenMail(bonId) {
        let unseen = Globals?.unSeenMailIds?.find(e => (e == bonId));
        return unseen ? true : false;
    }

    loadBons(bons) {
        let tableBody = this.myDiv.querySelector("#bons-table-body");
        tableBody.innerHTML = "";

        const reloadTable = (event) => {
            this.init();
        }

        bons.forEach(b => {
            let row = document.createElement("tr");
            row.style.borderBottom = "1px solid #ddd";
            const addr = `${b.delivery_address.street_name ?? ""} ${b.delivery_address.street_nr ?? ""} , ${b.delivery_address.zip_code ?? ""} ${b.delivery_address.city ?? ""}`
            let rowTemplate = `
                <td><a class="goto-bon-form" href="javascript:void(0);");">#${b.id}</a>${this.haveUnSeenMail(b.id) ? '<i class="fa fa-envelope" aria-hidden="true" title="Ulæst mail" style="margin-left: 15px"></i>' : ''}</td>
                <td>${Helper.formatDate(b.delivery_date)}</td>
                <td style="background-color:${Globals.Statuses[b.status].color};color:${Helper.contrastColor(Globals.Statuses[b.status].color)}">${Globals.Statuses[b.status].label}</td>
                <td>${b.nr_of_servings}</td>
                <td>${b.pax_units}</td>      
                <td>${b.kitchen_selects ? "Ja" : "Nej"}</td>
                <td title="${b.customer.forename + " " + b.customer.surname}">${b.customer.forename + " " + b.customer.surname}</td>
                <td>${b.customer.phone_nr}</td>
                <td title="${b.customer.company.name}">${b.customer.company.name}</td>
                <td>${b.payment_type}</td>
                <td title="${addr}"><a href="map/index.html?selectedBon=${b.id}" disabled target="_blank">${b.delivery_address.lat ? "Se kort" : "findes ej"}</a></td >
                `;
            row.innerHTML = rowTemplate;
            row.querySelector(".goto-bon-form").onclick = () => {
                Globals.myCalender.myBonForm.initFromBonId(b.id, reloadTable);
            }
            tableBody.append(row);
        })
        TableEnhancer.refresh(this.myBonTable);


    }




}