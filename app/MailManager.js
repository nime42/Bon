const Imap = require("imap");
const { simpleParser } = require("mailparser");
const bonUtils = require("./BonUtils.js");

var config = require("../resources/config.js");

var DBClass=require('./DBClass.js');
var DB=new DBClass('./resources/bon.db');

process.env.NODE_TLS_REJECT_UNAUTHORIZED =
  config.mailManager.rejectUnauthorized !== undefined
    ? config.mailManager.rejectUnauthorized
    : 1;

if (!config.mailManager.keepAlive) {
  config.mailManager.keepAlive = false;
}

function getMails(mailbox, searchCriteria, markAsRead, callback = console.log) {
  try {
    let allMessages = [];
    const imap = new Imap(config.mailManager);
    imap.once("ready", () => {
      imap.openBox(mailbox, false, () => {
        imap.search(searchCriteria, (err, results) => {
          let numberOfMessagesLeft = results.length;
          if (results.length > 0) {
            const f = imap.fetch(results, { bodies: "" });
            f.on("message", (msg) => {
              let messageInfo = {};
              msg.on("body", (stream) => {
                messageInfo.stream = stream;
              });
              msg.once("attributes", (attrs) => {
                messageInfo.attrs = attrs;
                if (markAsRead) {
                  const { uid } = attrs;
                  imap.addFlags(uid, ["\\Seen"], () => {});
                }
              });
              msg.once("end", () => {
                simpleParser(messageInfo.stream, async (err, parsed) => {
                  let minfo = {
                    date: parsed.date,
                    from: parsed.from.text,
                    to: parsed.to.text,
                    subject: parsed.subject,
                    message: parsed.text,
                    //attachments: parsed.attachments,
                    messageId: parsed.messageId,
                    unread: true,
                  };
                  if (parsed.subject?.startsWith("SENT:")) {
                    imap.addFlags(messageInfo?.attrs.uid, ["\\Seen"], () => {});
                  } else {
                    if (
                      messageInfo?.attrs?.flags?.find((e) => e === "\\Seen")
                    ) {
                      minfo.unread = false;
                    }
                  }
                  allMessages.push(minfo);
                  numberOfMessagesLeft--;
                  if (numberOfMessagesLeft === 0) {
                    //console.log("nr of messages:" + allMessages.length);
                    callback(true, allMessages);
                  }
                });
              });
            });
            f.once("error", (ex) => {
              callback(false, ex);
              return Promise.reject(ex);
            });
            f.once("end", () => {
              imap.end();
            });
          } else {
            imap.end();
            //console.log("nr of messages:" + allMessages.length);
            callback(true, allMessages);
          }
        });
      });
    });

    imap.once("error", (err) => {
      console.log(err);
      imap.end();
    });

    imap.connect();
  } catch (ex) {
    callback(false, ex);
    console.log("getMails", ex);
  }
}

function removeQuotedText(message) {
  return message.replace(/(^.*<.*@.*>.*$)*\n{0,2}(^>.*$)/gm, "").trim();
}

/**
 * If the original message is included in the mail, following the text "-----Original Message-----" or in local language
 * "-----Oprindelig meddelelse-----" the return the mail without this
 * @param {*} message 
 * @returns 
 */
function removeOriginalMessage(message) {
  //I assuming that there allways is 5 "-" before and after "Original message" and that "Original Message" allways translates to
  //two words in local language.
  return message.split(/-----\w+ \w+-----/)[0];
}

function getBonMails(prefix, id, markAsRead, callback = console.log) {
  let searchSubject = "#Bon:" + prefix + "-" + id + ":";
  getMails(
    "INBOX",
    ["ALL", ["SUBJECT", searchSubject]],
    markAsRead,
    (status, data) => {
      if (status) {
        let res = data.sort((a, b) => a.date - b.date);
        res.forEach((e) => {
          e.message = removeQuotedText(e.message);
          e.message = removeOriginalMessage(e.message);
        });
        callback(status, res);
      } else {
        callback(status, data);
      }
    }
  );
}

function getUnseenMails(prefix, callback = console.log) {
  let searchSubject;
  if (prefix === "*") {
    searchSubject = "#Bon:";
  } else {
    searchSubject = "#Bon:" + prefix + "-";
  }
  getMails(
    "INBOX",
    ["UNSEEN", ["SUBJECT", searchSubject]],
    false,
    (status, data) => {
      callback(status, data);
    }
  );
}

function getBonWithMails(prefix, mailsSince, callBack = console.log) {
  let searchSubject;
  if (prefix === "*") {
    searchSubject = "#Bon:";
  } else {
    searchSubject = "#Bon:" + prefix + "-";
  }

  let searchCriteria = ["ALL", ["SUBJECT", searchSubject]];
  if (mailsSince) {
    searchCriteria.push(["OR", ["SINCE", mailsSince], "UNSEEN"]);
  }

  getMails("INBOX", searchCriteria, false, (status, data) => {
    incomingMails = data.filter((m) => !m.subject.startsWith("SENT"));
    let mails = {};
    incomingMails.forEach((m) => {
      const b = getBonId(m.subject);
      const key = b.prefix + "-" + b.bonId;
      if (!mails[key]) {
        mails[key] = {
          prefix: b.prefix,
          bonId: b.bonId,
          mail: m,
        };
      } else {
        if (mails[key].mail.date < m.date) {
          mails[key].mail = m;
        }
      }
    });

    let res = Object.values(mails).sort(
      (a, b) => b.mail.date.getTime() - a.mail.date.getTime()
    );
    callBack(status, res);
  });
}

function getBonId(subject) {
  let res = {};
  let match = subject.match(/#Bon:(.*)-(\d+)/);
  if (match) {
    res.prefix = match[1];
    res.bonId = match[2];
  }
  return res;
}

function getBonIds(mails, withPrefix) {
  let res = {};
  mails.forEach((m) => {
    if (!m.subject.startsWith("SENT")) {
      const bon = getBonId(m.subject);
      if (bon.bonId != undefined) {
        if (withPrefix) {
          res[bon.prefix + "-" + bon.bonId] = 1;
        } else {
          res[bon.bonId] = 1;
        }
      }
    }
  });
  return Object.keys(res);
}

let incomingMailHelper = {
  bonAttribMap: {
    forename: "Fornavn",
    surname: "Efternavn",
    email: "Email",
    phone_nr: "Telefon nummer",
    delivery_date: "Leveringsdato",
    delivery_time: "Tidspunkt for levering",
    delivery_address: "Leveringsadresse",
    delivery_zipcode: "Postnummer",
    nr_of_servings: "Antal",
    kitchen_selects: "Ristet Rug vælger",
    company_name: "Firmanavn",
    invoice_info: "EAN/faktura info",
    customer_info: "Dine ønsker",
  },
};

function getIncomingOrders(subjectContains, callback) {

  const nestedSubjectsConstainsOr = (fromOr) => {
    let nestedOr;
  
    fromOr.forEach((value, index) => {
      nestedOr = index
        ? ['OR', ['SUBJECT', value], nestedOr]
        : ['SUBJECT', value];
    });
  
    return nestedOr;
  };

  let searchCriteria=nestedSubjectsConstainsOr(subjectContains);

  getMails(
    "INBOX",
    ["UNSEEN", searchCriteria],
    true,
    (status, data) => {
      if (status) {
        let bons = data.map((m) => ({
          orgMessage: m.message,
          bon: buildBon(
            parseIncomingMessage(m.message, incomingMailHelper.bonAttribMap)
          ),
        }));
        callback(true, bons);
      } else {
        callback(false, data);
      }
    }
  );
}

function buildBon(entries) {
  let bon = bonUtils.getEmptyBon();
  bon.status = "new";
  bon.customer.forename = entries["forename"];
  bon.customer.surname = entries["surname"];
  bon.customer.email = entries["email"];
  bon.customer.phone_nr = entries["phone_nr"];
  bon.customer.company.name = entries["company_name"];
  bon.nr_of_servings = entries["nr_of_servings"];
  bon.kitchen_selects = entries["kitchen_selects"] ;
  bon.price_category = "Store";
  bon.delivery_date = entries["delivery_time"];
  bon.delivery_address.street_name = entries["delivery_street_name"];
  bon.delivery_address.street_nr = entries["delivery_street_nr"];
  bon.delivery_address.zip_code = entries["delivery_zipcode"];
  bon.delivery_address.city = entries["delivery_city"];
  bon.customer_info = entries["customer_info"];
  bon.invoice_info = entries["invoice_info"];
  bon.delivery_info=entries["delivery_info"];
  bon.customer.company.ean_nr=entries["ean_nr"]

  let lastOrder=DB.getLastOrderByCustomer(bon.customer.email);
  //if it's a new user set price-category to Store else use pricecategory from last order
  if(lastOrder!==undefined) {
    bon.price_category=lastOrder.price_category;
  }


  if (bon.delivery_date === undefined) {
    bon.kitchen_info = "BEMÆRK, dato kunne ikke læses. Tjek email.";
  }
  return bon;
}

function parseDeliveryDate(entries) {
  let date = entries["delivery_date"];
  let time = entries["delivery_time"];
  let dateValue = undefined;
  
  if(!date) {
    return undefined;
  }

  if (date.match(/.* \d{1,2},\d{2,4}/)) {
    dateValue = new Date(date) + 1; //need to add one day if date is on format "Month day, Year"
  } else if(date.match(/\d+-\d+-\d/)) {
    let [day,month,year]=date.split("-");
    dateValue=new Date(`${year}-${month}-${day}`);

  } else {
    try {
      dateValue = new Date(date);
    } catch (err) {}
  }
  if (dateValue === undefined) {
    return undefined;
  }
  if (time) {
    let groups = time.match(/(?<hour>\d{1,2})[.:]?(?<min>\d{1,2})/i)?.groups;
    if (groups) {
      dateValue.setHours(groups["hour"], groups["min"]);
    }
  }

  if (config.mailManager.incomingMails.fromTimeZone) {
    let tz = config.mailManager.incomingMails.fromTimeZone;
    dateValue.setTime(dateValue - bonUtils.getLocalTimeOffsetDiff(dateValue, tz));
  }

  return dateValue.toISOString();
}

function getFromEntry(entries, attr) {
  let val = entries[incomingMailHelper.bonAttribMap[attr]];
  return val !== undefined ? val : "";
}


function parseIncomingMessage(message) {
  let attributeMap = {
    //forename: "Fornavn",
    //surname: "Efternavn",
    email: "Email",
    name: "Navn",
    phone_nr: "Telefonnummer",
    company_name: "Firma",
    deliveryDateTime: "DatoOgTid",
    delivery_address: "Adresse",
    street: "Gade",
    street_nr: "Nr \\(skriv etagen nedenunder\\)",
    delivery_city: "By",
    delivery_zipcode: "Post nummer",
    delivery_info: "leveringsinfo",
    nr_of_servings: "Pax",
    kitchen_selects: "RRbestemmer",
    contactDay: "kontaktPersonPåDagen",
    phoneDay: "TlfPåDagen",
    customer_info: "Ønsker",
    invoice_info: "EAN_Faktura info",



  };

  Object.keys(attributeMap).forEach((k) => {
    let regex = new RegExp(`${attributeMap[k]}:?`, "g");
    message = message.replaceAll(regex, `:::${k}:::`);
  });

  let tmp = {};

  let cols = message.split(":::");
  for (let i = 1; i < cols.length; i += 2) {
    let col = cols[i];
    let val = cols[i + 1];
    val = val.trim();
    tmp[col] = val;
  }

  let res = {};

  if (tmp["name"]) {
    let [forename, surname, rest] = tmp["name"].split(" ");
    res["forename"] = forename;
    res["surname"] = surname;
    if (rest) {
      res["surename"] += " " + rest;
    }
  } 

  res["phone_nr"] = tmp["phone_nr"] ;
  res["email"] = tmp["email"];

  res["company_name"] = tmp["company_name"];

  res["delivery_street_name"] = tmp["street"];
  res["delivery_street_nr"] = tmp["street_nr"];

  res["delivery_zipcode"] = tmp["delivery_zipcode"];
  res["delivery_city"] = tmp["delivery_city"];

  let [date, time] = tmp["deliveryDateTime"].split(" ");
  res["delivery_time"] = parseDeliveryDate({ delivery_date: date, delivery_time: time });
  

  res["delivery_info"] = tmp["delivery_info"];
  if (tmp["contactDay"]) {
    res["delivery_info"] += `\nKontakt: ${tmp["contactDay"]}`;
  }
  if (tmp["phoneDay"]) {
    res["delivery_info"] += `\ntelefon:  ${tmp["phoneDay"]}`;
  }

  res["nr_of_servings"] = tmp["nr_of_servings"];

  res["invoice_info"] = tmp["invoice_info"];

  res["customer_info"] = tmp["customer_info"];

  if (tmp["kitchen_selects"] !=="") {
    res["kitchen_selects"] = 1;
  } else {
    res["kitchen_selects"] = 0;
  }

  try {
    let ean_nr = res["invoice_info"].match(/\d{13}/);
    if (ean_nr) {
      res["ean_nr"] = ean_nr[0];
    }
  } catch (err) {}

  return res;
}







/**
 * returns date in the format DD-month-YYYY
 * @param {*} date
 * @returns
 */
function formatSearchDate(date) {
  if (!date) {
    return date;
  } else {
    //locale en-GB adds space between components
    return date
      .toLocaleDateString("en-GB", {
        timeZone: "UTC",
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
      .replaceAll(" ", "-");
  }
}

module.exports = {
  getBonMails: getBonMails,
  getUnseenMails: getUnseenMails,
  getBonIds: getBonIds,
  getIncomingOrders: getIncomingOrders,
  getBonWithMails: getBonWithMails,
};
