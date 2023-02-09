const Imap = require("imap");
const { simpleParser } = require("mailparser");
const { mail } = require("../resources/config.js");
const bonUtils =require("./BonUtils.js");


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
            let messageInfo={};
            msg.on("body", (stream) => {
              messageInfo.stream=stream;
            });

            msg.once('attributes', attrs => {
              messageInfo.attrs=attrs;
              if (markAsRead) {
                const { uid } = attrs;
                imap.addFlags(uid, ['\\Seen'], () => {
                });
              }
            });

            msg.once('end', function() {
              simpleParser(messageInfo.stream, async (err, parsed) => {
                let minfo = {
                  date: parsed.date,
                  from: parsed.from.text,
                  to: parsed.to.text,
                  subject: parsed.subject,
                  message: parsed.text,
                  attachments: parsed.attachments,
                  unread:true
                };              
                if(messageInfo?.attrs?.flags?.find(e=>(e==='\\Seen'))) {
                  minfo.unread=false;
                }
                res.push(minfo);
                messagesToParse--;
                if (messagesToParse === 0) {
                  callback(true, res);
                  messagesToParse--;
                }
              });
            });


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

function getBonWithMails(prefix,callBack=console.log) {
  let searchSubject;
  if(prefix==="*") {
    searchSubject="#Bon:";
  } else {
    searchSubject="#Bon:"+prefix+"-";
  }
  getMails("INBOX",['ALL',['SUBJECT', searchSubject]],false,(status,data) => {
    incomingMails=data.filter((m)=>(!m.subject.startsWith("SENT")));
    let mails={};
    incomingMails.forEach(m=>{
      const b=getBonId(m.subject);
      const key=b.prefix+"-"+b.bonId;
      if(!mails[key]) {
        mails[key]={
          prefix:b.prefix,
          bonId:b.bonId,
          mail:m
        }
      } else {
        if( mails[key].mail.date<m.date) {
          mails[key].mail=m;
        }
      }
    });

    let res=Object.values(mails).sort((a,b)=>(b.mail.date.getTime()-a.mail.date.getTime()));
    callBack(status,res);
  });


}


function getBonId(subject) {
  let res={};
  let match=subject.match(/#Bon:(.*)-(\d+)/);
  if(match) {
    res.prefix=match[1];
    res.bonId=match[2];
  }
  return res; 
}

function getBonIds(mails,withPrefix) {
  let res={}
  mails.forEach(m=>{
    if(!m.subject.startsWith("SENT")) {
      const bon=getBonId(m.subject);
      if(bon.bonId!=undefined) {
        if(withPrefix) {
          res[bon.prefix+"-"+bon.bonId]=1;
        } else {
          res[bon.bonId]=1; 
        }
      }
    }
  });
  return Object.keys(res);
}

let incomingMailHelper= {
  bonAttribMap:{
    forename:"Fornavn",
    surname:"Efternavn",
    email:"Email",
    phone_nr:"Telefon nummer",
    delivery_date:"Leveringsdato",
    delivery_time:"Tidspunkt for levering",
    delivery_address:"Leveringsadresse",
    delivery_zipcode:"Postnummer",
    nr_of_servings:"Antal",
    kitchen_selects:"Ristet Rug vælger",
    company_name:"Firmanavn",
    ean_nr:"EAN/faktura info",
    customer_info:"Dine ønsker"
  }
}


function getIncomingOrders(subjectContains,callback) {
    getMails("INBOX",['UNSEEN',['SUBJECT',subjectContains]],true, (status,data) => {
      if(status) {
        let bons=data.map(m=>({orgMessage:m.message, bon:buildBon(parseIncomingMessage(m.message,incomingMailHelper.bonAttribMap))}));
        callback(true,bons);
      } else {
        callback(false,data);
      }
    })
}


function buildBon(entries) {
  let bon=bonUtils.getEmptyBon();
  bon.status="new";
  bon.customer.forename=entries["forename"];
  bon.customer.surname=entries["surname"];
  bon.customer.email=entries["email"];
  bon.customer.phone_nr=entries["phone_nr"];
  bon.customer.company.name=entries["company_name"];
  bon.customer.company.ean_nr=entries["ean_nr"];
  bon.nr_of_servings=entries["nr_of_servings"];
  bon.kitchen_selects=1;
  bon.price_category="Catering";
  bon.delivery_date=parseDeliveryDate(entries);
  bon.delivery_address.street_name=entries["delivery_address"];
  bon.delivery_address.zip_code=entries["delivery_zipcode"];
  bon.customer_info=entries["customer_info"];

  try {
    //streetname and streetnumber is in the same field, try to parse them apart
    let street_nr = bon.delivery_address.street_name.match(/\d+/);
    if (street_nr) {
      bon.delivery_address.street_nr = street_nr[0];
      bon.delivery_address.street_name = bon.delivery_address.street_name.replace(bon.delivery_address.street_nr, "").trim();
    }
  } catch(err) {}
  

  if(bon.delivery_date===undefined) {
    bon.kitchen_info="BEMÆRK, dato kunne ikke læses. Tjek email.";
  }
  return bon;
}







function parseDeliveryDate(entries) {
  let date=entries["delivery_date"];
  let time=entries["delivery_time"];
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



function parseIncomingMessage(mess,entries) {
  let res={}
  mess=mess.replace(/CONTACT\n.*/,""); //Not sure about this.
  Object.keys(entries).forEach(k=>{
    let regExp=new RegExp(`(?<attr>${entries[k]}):\\n(?<value>[\\s\\S]*?)(?<end>(.*?:\\n|$))`);
    let m=mess.match(regExp);
    if(m) {
      res[k]=m.groups["value"];
      res[k]=res[k].replaceAll("<br/>","");
    } else {
      res[k]=undefined;
    }

  })
  return res;
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
  getIncomingOrders:getIncomingOrders,
  getBonWithMails:getBonWithMails
};
