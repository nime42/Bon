class BonMails {
    background=Globals.background;
    foreground=Globals.foreground;
    shadowColor=Globals.shadowColor;

    style=`

    .mail-style table {
        border-collapse: collapse;
        background: #f1e6b2;
      }
      
    .mail-style td, .mail-style th {
        border: 1px solid ${this.foreground};
        padding: 8px;
        color: ${this.foreground};
        text-overflow: ellips;
        white-space: nowrap;
        overflow:hidden;
        
      }

      .mail-style td .unread-mails:hover {
        cursor:pointer;
      }
      
      .tableFixHead { 
          overflow: auto; 
          height: 300px; 
      }

      .tableFixHead thead th { 
          position: sticky; 
          top: 0; 
          z-index: 1; 
          color: ${this.background};
          background: ${this.shadowColor};
        }

        .unread {
            font-style: italic;
            font-weight: bold;
        }
    `;



    mails=`
    <div>
    <style>
        ${this.style}
    </style>
    <div class="mail-style">
    <div class="tableFixHead" style="width: 90%; margin-left:10px;">
    <table id="mail-table">
    </table>
    </div>
    <input type="button" id="refresh-mails" value="Opdater" style="margin: 10px;">
    </div>
    </div>
    `    



    constructor(div) {
        this.myRepo = new BonRepository();

        if(typeof div==="string") {
            div=document.querySelector(div);
        }
        this.myDiv=div;
        this.myDiv.innerHTML=this.mails;
        this.myMailTable=this.myDiv.querySelector("#mail-table");

        this.myPopUp=new ModalPopup();
        this.myBonStripDiv=document.createElement("div");
        this.myBonStrip=new BonStrip(this.myBonStripDiv,false);
        this.myBonStrip.showMails();

        let self=this;
        this.myBonStrip.setOnMailSeen((bonId)=>{
            self.markAsRead(bonId);
        })


        let refreshButton=this.myDiv.querySelector("#refresh-mails");
        refreshButton.onclick = function () {
            self.refreshMails(true);
            self.myRepo.checkIncomingMails();
        }


        this.myMails={};
        this.lastRefresh=undefined;




    }

    markAsRead(bonId) {

        if(Helper.isNumeric(bonId)) {
            bonId=Globals.bonPrefix+"-"+bonId;
        }

        if(this.myMails[bonId]) {
            this.myMails[bonId].mail.unread=false;
        }
        let envelope=this.myMailTable.querySelector(`#bon-id-${bonId}`);
        if(envelope) {
            envelope.style.display="none"
        }
    }

    refreshMails(withProgressMessage) {
        let p=undefined;
        if(withProgressMessage) {
            p=MessageBox.popup("henter mail...");
        }
        let mailsSince=this.lastRefresh;
        this.lastRefresh=new Date();
        this.myRepo.getAllBonWithMails(mailsSince,(mails)=>{
            p && p.hide();
            mails.forEach(m=>{
                this.myMails[m.bon.id]=m;
            })

            this.createMailTable(Object.values(this.myMails));
        })
    }

    createMailTable(mails) {
        let self=this;
        this.myMailTable.innerHTML="";
        
        let headers=`
        <tr>
        <th>Ulæst</th>
        <th>Dato</th>
        <th>Bon-ID</th>
        <th>Leveringsdato</th>
        <th>Kunde</th>
        <th>Firma</th>
        <th>Email</th>
        </tr>
        `;
        let headerRow=document.createElement("thead");
        headerRow.innerHTML=headers;
        this.myMailTable.append(headerRow);
        let tableRows=document.createElement("tbody");

        mails.forEach(m=>{
            let r=`
                <td><li id="bon-id-${m.bon.id}" class="fa fa-envelope mail unread-mails" style="display:${m.mail.unread?"":"none"}"></li></td>
                <td>${new Date(m.mail.date).toLocaleString()}</td>
                <td><a href="#">${m.bon.id}</a></td>
                <td>${new Date(m.bon.delivery_date).toLocaleString()}</td>
                <td>${m.bon.customer.forename + " " + m.bon.customer.surname}</td>
                <td>${m.bon.customer.company.name}</td>
                <td>${m.bon.customer.email}</td>
                `;
                let row=document.createElement("tr");
                row.innerHTML=r;
                row.querySelector("a").onclick=() =>{
                    self.onSelectBon(m.bon);
                    return false;
                }
                row.querySelector(`#bon-id-${m.bon.id}`).onclick=() =>{
                    self.onSelectBon(m.bon);
                    return false;
                }
                tableRows.append(row);
        })

        this.myMailTable.append(tableRows);
        TableEnhancer.sortable(this.myMailTable,{
            0:(td)=>(td.querySelector("li").style.display),
            1:(td)=>(new Date(td.innerText)),
            3:(td)=>(new Date(td.innerText)),
        });


    }

    onSelectBon(bon) {

        if(bon.id.startsWith(Globals.bonPrefix)) {

            Globals.myCalender.myBonForm.initFromBonId(bon.id.replace(Globals.bonPrefix+"-",""));

        } else {
            this.myBonStrip.initFromBon(bon,bon.orders);
            this.myPopUp.show(this.myBonStripDiv);    
        }
    }


}