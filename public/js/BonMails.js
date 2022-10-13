class BonMails {
    background=Globals.background;
    foreground=Globals.foreground;
    shadowColor=Globals.shadowColor;

    style=`

    .mail-style table {
        border-collapse: collapse;
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

    }

    refreshMails() {

        this.createMailTable();


    }

    createMailTable() {
        this.myMailTable.innerHTML="";
        
        let headers=`
        <tr>
        <th>Datum</th>
        <th>Bon-ID</th>
        </tr>
        `;
        let headerRow=document.createElement("thead");
        headerRow.innerHTML=headers;
        this.myMailTable.append(headerRow);
        let tableRows=document.createElement("tbody");
        this.myMailTable.append(tableRows);


    }


}