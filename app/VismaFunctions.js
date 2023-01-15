const fetch = require('node-fetch');

module.exports = class VismaFunctions {
    constructor(config,db) {
        this.config=config;
        this.db=db;
    }

    getCustomer(email,companyName,callback=console.log) {

        let headers = {
            "Content-Type":"application/json",
            "X-AppSecretToken":this.config.appSecretToken,
            "X-AgreementGrantToken":this.config.agreementGrantToken 
        }
        

        let filter=`email$eq:${email}$or:name$eq:${companyName}`
        let httpReq = this.config.vismaUrl + "/customers?filter="+filter;

        fetch(httpReq, { headers })
        .then(res => res.json())
        .then(
            json => {
                if(json.collection[0]) {
                    callback(true, json.collection[0]);
                } else {
                    callback(false, json.collection[0]);
                }
            },
            err => callback(false, err)
        );


    }

    populateInvoiceObject(bon) {
        let invoiceObject  = JSON.parse(JSON.stringify(this.createInvoiceObject));
        invoiceObject.currency=this.currency;
        invoiceObject.paymentTerms.paymentTermsNumber=this.paymentTermsNumber;
        invoiceObject.layout.layoutNumber=this.layoutNumber;

    }

    createInvoiceDraft(bonId, callback=console.log) {
        
        let [bon]=this.db.getBonSummary(bonId);
        let orders=this.db.getOrders(bonId);
        console.log(bon);
        this.getCustomer(bon.email,bon.company,(status,customerInfo)=>{
            let customerNr=this.config.unknownCustomerId;
            let currency=this.config.currency;
            let paymentTermsNr=this.config.paymentTermsNumber;
            let layoutNumber=this.config.layoutNumber;
            let vatZoneNumber=this.config.vatZoneNumber;
            let recipient={
                name:"UKENT: "+ bon.company,
                ean:bon.ean_nr,
                vatZone:{
                    vatZoneNumber:vatZoneNumber
                }
            }

            if(status) {
                customerNr=customerInfo.customerNumber;
                if(customerInfo.currency) {
                    currency=customerInfo.currency;
                }
                if(customerInfo.paymentTerms?.paymentTermsNumber) {
                    paymentTermsNr=customerInfo.paymentTerms.paymentTermsNumber;
                } 
                recipient.name=customerInfo.name;
                recipient.address=customerInfo.address;
                recipient.zip=customerInfo.zip;
                recipient.city=customerInfo.city;
                recipient.ean=customerInfo.ean;
                recipient.vatZone.vatZoneNumber=customerInfo.vatZone?.vatZoneNumber;              
            }

            let payload={};
            payload.currency=currency;
            payload.customer={customerNumber:customerNr};
            payload.date=new Date().toISOString().split('T')[0];
            payload.layout={layoutNumber:layoutNumber};
            payload.paymentTerms={paymentTermsNumber:paymentTermsNr};
            payload.delivery={
                name:bon.name,
                address:`${bon.street_name2?(bon.street_name2+" "):""}${bon.street_name} ${bon.street_nr}`,
                zip:bon.zip_code+"",
                city:bon.city,
                deliveryDate:(bon.delivery_date?new Date(bon.delivery_date):new Date()).toISOString().split('T')[0]
            }
            payload.recipient=recipient;
            console.log(payload);
            callback(status,customerInfo);
        });


 
        return;
        this.getCustomer(bon.email,bon.companyName,(status,customerInfo)=>{
            if(status) {
                let invoiceObject=this.populateInvoiceObject(bon);
                invoiceObject.customer.customerNumber=customerInfo.customerNumber;
                invoiceObject.currency=customerInfo.currency?customerInfo.currency:invoiceObject.currency;

            }
        })
    }
}