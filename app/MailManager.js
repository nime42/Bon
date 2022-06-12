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
  let searchSubject="#Bon:"+prefix+"-";
  getMails("INBOX",['UNSEEN',['SUBJECT', searchSubject]],false,(status,data) => {
    callback(status,data);
  });
}

function getBonIds(mails,prefix) {
  let res={}
  mails.forEach(m=>{
    if(!m.subject.startsWith("SENT")) {
       let match=m.subject.match(/#Bon:(.*)-(\d+)/);
       if(match) {
         if(!prefix || prefix===match[1]) {
           res[match[2]]=1;
         }
       }
    }
  });
  return Object.keys(res);
}

module.exports = {
  getBonMails: getBonMails,
  getUnseenMails:getUnseenMails,
  getBonIds:getBonIds
};
