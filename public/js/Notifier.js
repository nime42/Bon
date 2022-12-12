class Notifier {
    innerHTML=`
    <div class="blink">
    <i class="fa fa-paper-plane" style="font-size: 25px;"></i>&nbsp;
    <a href="javascript:void(0);"></a>
    <div>
    `;

    constructor(div) {
        if(typeof div==="string") {
            div=document.querySelector(div);
        }
        this.myDiv=div;
        this.myDiv.innerHTML=this.innerHTML;
        this.myDiv.style.display="none";
        this.myRepo = new BonRepository();
    }

    notify(bonId) {
        this.myRepo.notifyBon(bonId);
    }

    checkNotifiedBons() {
        let self=this;
        this.myRepo.getNotifiedBon((status,res)=>{
            if(status) {
                let bonId=res.bon_id;
                self.myDiv.style.display="";
                let aElem=this.myDiv.querySelector("a");
                aElem.innerHTML="#"+bonId;
                aElem.onclick=()=>{
                    Globals.myConfig.showBonForm(bonId);
                    self.myRepo.seeBon(bonId);
                    self.myDiv.style.display="none";
                }
        



            } else {
                this.myDiv.style.display="none";
            }
        })
    }

    setCheckInterval(minutes) {
        this.checkNotifiedBons();
        setInterval(()=>{this.checkNotifiedBons()}, minutes*60*1000);

    }
}