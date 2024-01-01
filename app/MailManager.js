const Imap = require("imap");
const { simpleParser } = require("mailparser");
const { mail } = require("../resources/config.js");
const bonUtils = require("./BonUtils.js");

var config = require("../resources/config.js");

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
  getMails(
    "INBOX",
    ["UNSEEN", ["SUBJECT", subjectContains]],
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
  bon.customer.forename = entries["forename"]?.trim();
  bon.customer.surname = entries["surname"]?.trim();
  bon.customer.email = entries["email"]?.trim();
  bon.customer.phone_nr = entries["phone_nr"]?.trim();
  bon.customer.company.name = entries["company_name"]?.trim();
  bon.nr_of_servings = entries["nr_of_servings"]?.trim();
  bon.kitchen_selects = entries["kitchen_selects"] !== undefined ? 1 : 0;
  bon.price_category = "Catering";
  bon.delivery_date = parseDeliveryDate(entries);
  bon.delivery_address.street_name = entries["delivery_address"]?.trim();
  bon.delivery_address.zip_code = entries["delivery_zipcode"]?.trim();
  bon.customer_info = entries["customer_info"]?.trim();
  bon.invoice_info = entries["invoice_info"]?.trim();
  try {
    //streetname and streetnumber is in the same field, try to parse them apart
    //Just split the adress by the first numerical value
    let parsedAdr=bon.delivery_address.street_name.match(/^([^0-9]*) ?(.*)(\n|$)/);
    if(parsedAdr) {
      bon.delivery_address.street_name = parsedAdr[1].trim();
      bon.delivery_address.street_nr = parsedAdr[2].trim();
    }
  } catch (err) {}
  try {
    let ean_nr = bon.invoice_info.match(/\d{13}/);
    if (ean_nr) {
      bon.customer.company.ean_nr = ean_nr[0];
    }
  } catch (err) {}

  if (bon.delivery_date === undefined) {
    bon.kitchen_info = "BEMÆRK, dato kunne ikke læses. Tjek email.";
  }
  return bon;
}

function parseDeliveryDate(entries) {
  let date = entries["delivery_date"];
  let time = entries["delivery_time"];
  let dateValue = undefined;
  if (date && date.match(/.* \d{1,2},\d{2,4}/)) {
    dateValue = new Date(date) + 1; //need to add one day if date is on format "Month day, Year"
  } else {
    try {
      dateValue = new Date(date);
    } catch (err) {}
  }
  if (dateValue === undefined) {
    return undefined;
  }
  if (time) {
    let groups = time.match(/(?<hour>\d{1,2}) *[.:] *(?<min>\d{1,2})/i)?.groups;
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

function parseIncomingMessage(mess, entries) {
  let res = {};
  mess = mess.replace(/CONTACT\n.*/, ""); //Not sure about this.
  Object.keys(entries).forEach((k) => {
    let regExp = new RegExp(
      `(?<attr>${entries[k]}):\\n(?<value>[\\s\\S]*?)(?<end>(.*?:\\n|$))`
    );
    let m = mess.match(regExp);
    if (m) {
      res[k] = m.groups["value"];
      res[k] = res[k].replaceAll("<br/>", "");
    } else {
      res[k] = undefined;
    }
  });
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
