const Imap = require("imap");
const { simpleParser } = require("mailparser");
const bonUtils = require("./BonUtils.js");

var config = require("../resources/config.js");

var DBClass = require('./DBClass.js');
var DB = new DBClass('./resources/bon.db');


var MailCache = require('./MailCache.js');

MailCache.initMailCache((status, mails) => {
  console.log("Mail cache initialized");
  MailCache.markAsRead("SENT:#Bon")
}, (mail) => {
  if (mail.subject.includes("SENT:")) {
    MailCache.markAsRead(null, null, mail.messageId);
  }
}
);


/**
 * Removes quoted text from an email message.
 *
 * This function takes an email message as input and removes any lines that
 * contain quoted text, such as those starting with '>' or containing email
 * addresses within angle brackets. It also trims any leading or trailing
 * whitespace from the resulting string.
 *
 * @param {string} message - The email message from which to remove quoted text.
 * @returns {string} - The email message with quoted text removed.
 */
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
  const allCachedMails = MailCache.getAllCachedMails();
  if (markAsRead) {
    MailCache.markAsRead(searchSubject);
  }
  let mails = allCachedMails.filter((m) => m.subject.includes(searchSubject));
  mails.sort((a, b) => a.date - b.date);
  mails.forEach((e) => {
    e.message = removeQuotedText(e.message);
    e.message = removeOriginalMessage(e.message);
  });
  callback(true, mails);
}


function getUnseenMails(prefix, callback = console.log) {
  let searchSubject;
  if (prefix === "*") {
    searchSubject = "#Bon:";
  } else {
    searchSubject = "#Bon:" + prefix + "-";
  }
  const allCachedMails = MailCache.getAllCachedMails();
  let mails = allCachedMails.filter((m) => m.subject.includes(searchSubject));
  mails = mails.filter((m) => m.unread);
  callback(true, mails);
}

function getBonWithMails(prefix, callBack = console.log) {
  let searchSubject;
  if (prefix === "*") {
    searchSubject = "#Bon:";
  } else {
    searchSubject = "#Bon:" + prefix + "-";
  }
  const allCachedMails = MailCache.getAllCachedMails();
  let mails = allCachedMails.filter((m) => m.subject.includes(searchSubject));

  mails = mails.filter((m) => !m.subject.includes("SENT"));
  let groupedMails = {};
  mails.forEach((m) => {
    const bon = getBonId(m.subject);
    const key = bon.prefix + "-" + bon.bonId;
    if (!groupedMails[key] || groupedMails[key].mail.date < m.date) {
      groupedMails[key] = {
        prefix: bon.prefix,
        bonId: bon.bonId,
        mail: m
      };
    }
  });
  mails = Object.values(groupedMails).sort((a, b) => b.mail.date - a.mail.date);
  callBack(true, mails);
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
    if (!m.subject.includes("SENT")) {
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





module.exports = {
  getBonMails: getBonMails,
  getUnseenMails: getUnseenMails,
  getBonIds: getBonIds,
  getBonWithMails: getBonWithMails,
};
