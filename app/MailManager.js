const Imap = require("imap");
const { simpleParser } = require("mailparser");
const { mail } = require("../resources/config.js");


var config = require("../resources/config.js");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = config.mailManager.rejectUnauthorized!==undefined?config.mailManager.rejectUnauthorized:1;

if(!config.mailManager.keepAlive) {
  config.mailManager.keepAlive=false;
}






function getMails(mailBox, searchCriterias,markAsRead, callback = console.log) {
  let res = [];
  try {
    const imap = new Imap(config.mailManager);
    imap.once("ready", () => {
      imap.openBox(mailBox, false, () => {
        imap.search(searchCriterias, (err, results) => {
          if(results.length===0) {
            imap.end();
            callback(true,res);
            return;

          }
          let f;
          try {
            f = imap.fetch(results, { bodies: "" });
          } catch(error) {
            if(error.message==="Nothing to fetch") {
              callback(true,res);
            } else {
              callback(false,error);
            }
            return;
          }
          let messagesToParse = results.length;
          f && f.on("message", (msg) => {
            msg.on("body", (stream) => {
              simpleParser(stream, async (err, parsed) => {
                let minfo = {
                  date: parsed.date,
                  from: parsed.from.text,
                  to: parsed.to.text,
                  subject: parsed.subject,
                  message: parsed.text,
                  attachments: parsed.attachments,
                };
                res.push(minfo);
                messagesToParse--;
                if (messagesToParse === 0) {
                  callback(true, res);
                  messagesToParse--;
                }
              });
            });

            if(markAsRead) {
              msg.once('attributes', attrs => {
                const {uid} = attrs;
                imap.addFlags(uid, ['\\Seen'], () => {
                });
              });
            }



          });
          f && f.once("error", (ex) => {
            console.log("f once",ex);
            return Promise.reject(ex);
          });
          f && f.once("end", () => {
            imap.end();
            if (messagesToParse === 0) {
              callback(true, res);
            }
          });
        });
      });
    });

    imap.once("error", (err) => {
      if(err.code!=='ECONNRESET') {
        console.log("imap once",err);
        callback(false, err);
      }
    });



    imap.connect();
  } catch (ex) {
    console.log("Catch", ex)
    //callback(false, ex);
  }
}


function removeQuotedText(message) {
  return message.replace(/(^.*<.*@.*>.*$)*\n{0,2}(^>.*$)/gm,"").trim();
}

function getBonMails(prefix,id,markAsRead,callback=console.log) {
  let searchSubject="#Bon:"+prefix+"-"+id+":";
  getMails("INBOX",['ALL',['SUBJECT', searchSubject]],markAsRead,(status,data) => {
    if(status) {
      let res=data.sort((a,b)=>(a.date-b.date));
      res.forEach(e => {
        e.message=removeQuotedText(e.message);
      });
      callback(status,res);
    } else {
      callback(status,data);

    }
  });
}

function getUnseenMails(prefix,callback=console.log) {
  let searchSubject;
  if(prefix==="*") {
    searchSubject="#Bon:";
  } else {
    searchSubject="#Bon:"+prefix+"-";
  }
  getMails("INBOX",['UNSEEN',['SUBJECT', searchSubject]],false,(status,data) => {
    callback(status,data);
  });
}

function getBonIds(mails,withPrefix) {
  let res={}
  mails.forEach(m=>{
    if(!m.subject.startsWith("SENT")) {
       let match=m.subject.match(/#Bon:(.*)-(\d+)/);
       if(match) {
          if(withPrefix) {
            res[match[1]+"-"+match[2]]=1
          } else {
            res[match[2]]=1; 
          }
       }
    }
  });
  return Object.keys(res);
}

let incomingMailHelper= {
  entries:[
    "(?<attr>.*):\\n?(?<value>.*)",
    "(?<attr>Email):\\n?(?<value>.*)"

  ],
  bonAttribMap:{
    forename:"Fornavn",
    surname:"Efternavn",
    email:"Email",
    phone_nr:"Telefon nummer",
    delivery_date:"Leveringsdato",
    delivery_time:"Tidspunkt for levering",
    delivery_address:"Leveringsadresse",
    delivery_zipcode:"Postnummer",
    nr_of_servings:"Antal Personer",
    kitchen_selects:"Ristet Rug vælger",
    company_name:"Firmanavn",
    ean_nr:"EAN/faktura info",
    customer_info:"Øvrig kommentarer"
  }
}


function getIncomingOrders(subjectContains,callback) {
    getMails("INBOX",['UNSEEN',['SUBJECT',subjectContains]],true, (status,data) => {
      if(status) {
        let regExps=incomingMailHelper.entries.map(e=>(new RegExp(e,'g')));
        let bons=data.map(m=>({orgMessage:m.message, bon:buildBon(parseIncomingMessage(m.message,regExps))}));
        callback(true,bons);
      } else {
        callback(false,data);
      }
    })
}

function getEmptyBon() {
  let bon={
    "id": "",
    "delivery_date": "",
    "status": "",
    "status2": "",
    "nr_of_servings": "",
    "kitchen_selects": 0,
    "customer_collects": 0,
    "price_category": "",
    "payment_type": "",
    "customer_info": "",
    "kitchen_info": "",
    "service_type": null,
    "customer": {
      "forename": "",
      "surname": "",
      "email": "",
      "phone_nr": "",
      "company": {
        "name": "",
        "ean_nr": "",
        "address": {
          "street_name": "",
          "street_name2": "",
          "street_nr": "",
          "city": "",
          "zip_code": ""
        }
      }
    },
    "delivery_address": {
      "street_name": "",
      "street_name2": "",
      "street_nr": "",
      "city": "",
      "zip_code": ""
    },
    "orders": []
  }
  return bon;
}

function buildBon(entries) {
  let bon=getEmptyBon();
  bon.status="new";
  bon.customer.forename=getFromEntry(entries,"forename");
  bon.customer.surname=getFromEntry(entries,"surname");
  bon.customer.email=getFromEntry(entries,"email");
  bon.customer.phone_nr=getFromEntry(entries,"phone_nr");
  bon.customer.company.name=getFromEntry(entries,"company_name");
  bon.customer.company.ean_nr=getFromEntry(entries,"ean_nr");
  bon.nr_of_servings=getFromEntry(entries,"nr_of_servings");
  bon.kitchen_selects=1;
  bon.price_category="Catering";
  bon.delivery_date=parseDeliveryDate(entries);
  bon.delivery_address.street_name2=getFromEntry(entries,"delivery_address");
  bon.delivery_address.zip_code=getFromEntry(entries,"delivery_zipcode");

  if(bon.delivery_date===undefined) {
    bon.customer_info="BEMÆRK, dato kunne ikke læses. Tjek email.";
  }
  return bon;
}







function parseDeliveryDate(entries) {
  let date=getFromEntry(entries,"delivery_date");
  let time=getFromEntry(entries,"delivery_time");
  let dateValue=undefined;
  if(date && date.match(/.* \d{1,2},\d{2,4}/)) {
    dateValue=new Date(date)+1; //need to add one day if date is on format "Month day, Year" 
  } else {
    try {
      dateValue=new Date(date);
    } catch(err) {}
  }
  if(dateValue===undefined) {
    return undefined;
  }
  if (time) {
    let groups = time.match(/(?<hour>\d{1,2}) *[.:] *(?<min>\d{1,2})/i)?.groups;
    if (groups) {
      dateValue.setHours(groups["hour"], groups["min"]);
    }
  }

  if(config.mailManager.incomingMails.fromTimeZone) {
    let tz=config.mailManager.incomingMails.fromTimeZone;
    dateValue.setTime(dateValue-getLocalTimeOffsetDiff(dateValue,tz));
  }

  return dateValue.toISOString();

}

function getFromEntry(entries,attr) {
  let val=entries[incomingMailHelper.bonAttribMap[attr]];
  return val!==undefined?val:"";
}

function parseIncomingMessage(mess, regExps) {
  let entries = {};
  regExps.forEach(r => {
    mess.match(r)?.forEach(m => {
      regExps.forEach(s => {
        let groups=m.match(new RegExp(s.source))?.groups;
        if(groups) {
          entries[groups.attr]=groups.value
        }
      })
    })
  })
  return entries;
}

  /**
   * Get the time difference between a local date and another timezone.
   * 
   * Could be usefull if you get date as a string without timezone but you know what timezone it come from
   * let d=new Date(dateString);
   * d.setTime(d-Helper.getLocalTimeOffsetDiff(d,"Europe/Copenhagen"));
   * @param {Date} date 
   * @param {String} timeZone - A TZ database name (see https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
   * @returns {Integer} difference in milliseconds
   */
   function getLocalTimeOffsetDiff(date,timeZone) {
    let dateWithoutSec=new Date(date);
    dateWithoutSec.setSeconds(0,0);
    let local=new Date(dateWithoutSec.toLocaleString("default",{timeZone:timeZone}));
    local.setSeconds(0,0);
    return local-dateWithoutSec;


  }



module.exports = {
  getBonMails: getBonMails,
  getUnseenMails:getUnseenMails,
  getBonIds:getBonIds,
  getIncomingOrders:getIncomingOrders
};
