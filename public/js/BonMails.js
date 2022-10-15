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
    <div class="tableFixHead" style="width: 90%;">
    <table id="mail-table">
    </table>
    </div>
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
        this.myBonStrip.setOnMailSeen((bonId)=>{
            let envelope=this.myMailTable.querySelector("#bon-id-"+bonId);
            if(envelope) {
                envelope.style.display="none"
            }
        })





    }

    refreshMails() {
        this.myRepo.getAllBonWithMails((mails)=>{
            this.createMailTable(mails);
        })



    }

    createMailTable(mails) {
        let self=this;
        this.myMailTable.innerHTML="";
        
        let headers=`
        <tr>
        <th></th>
        <th>Datum</th>
        <th>Bon-ID</th>
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
                <td><li id="bon-id-${m.bon.id}" class="fa fa-envelope mail" style="display:${m.mail.unread?"":"none"}"></li></td>
                <td>${new Date(m.mail.date).toLocaleString()}</td>
                <td><a id="bon-id-${m.bon.id}" href="#">${m.bon.id}</a></td>
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
                tableRows.append(row);
        })

        this.myMailTable.append(tableRows);
        TableEnhancer.sortable(this.myMailTable);


    }

    onSelectBon(bon) {
        this.myBonStrip.initFromBon(bon,bon.orders);
        this.myPopUp.show(this.myBonStripDiv);
    }


}