const Imap = require("imap");
const { simpleParser } = require("mailparser");
const config = require("../resources/config.js");
const { stat } = require("fs");



process.env.NODE_TLS_REJECT_UNAUTHORIZED =
    config.mailManager.rejectUnauthorized !== undefined
        ? config.mailManager.rejectUnauthorized
        : 1;


let allCachedMails = [];
let imap = null;

function getAllMails(callback = console.log) {
    allCachedMails = [];

    try {
        imap.destroy();
        imap.end();
    } catch (error) {
    }

    imap = new Imap(config.mailManager);

    imap.once("ready", () => {
        imap.openBox("INBOX", false, (err, box) => {
            if (err) throw err;

            imap.search(["ALL"], (err, results) => {
                if (err) throw err;
                if (results.length === 0) {
                    imap.end();
                    callback(true, allCachedMails);
                    return;
                }
                const f = imap.fetch(results, { bodies: "" });
                f.on("message", (msg) => {
                    let messageInfo = {};
                    msg.on("body", (stream) => {
                        messageInfo.stream = stream;
                    });
                    msg.once("attributes", (attrs) => {
                        messageInfo.attrs = attrs;
                    });
                    msg.once("end", () => {
                        simpleParser(messageInfo.stream, (err, parsed) => {
                            if (err) throw err;
                            let mail = {
                                date: parsed.date,
                                from: parsed.from.text,
                                to: parsed.to.text,
                                subject: parsed.subject ?? "",
                                message: parsed.text,
                                messageId: parsed.messageId,
                                unread: !messageInfo.attrs.flags.includes("\\Seen")
                            };
                            allCachedMails.push(mail);
                            if (allCachedMails.length === results.length) {
                                callback(true, allCachedMails);
                            }
                        });
                    });
                });
                f.once("error", (err) => {
                    callback(false, err);
                    imap.end();
                });

            });
        });
    });

    imap.connect();

}

function initCheckNewMails(callback = console.log) {
    imap.on("mail", () => {
        imap.search(["UNSEEN"], (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                const f = imap.fetch(results, { bodies: "" });
                f.on("message", (msg) => {
                    let messageInfo = {};
                    msg.on("body", (stream) => {
                        messageInfo.stream = stream;
                    });
                    msg.once("attributes", (attrs) => {
                        messageInfo.attrs = attrs;
                    });
                    msg.once("end", () => {
                        simpleParser(messageInfo.stream, (err, parsed) => {
                            if (err) throw err;
                            let mail = {
                                date: parsed.date,
                                from: parsed.from.text,
                                to: parsed.to.text,
                                subject: parsed.subject ?? "",
                                message: parsed.text,
                                messageId: parsed.messageId,
                                unread: !messageInfo.attrs.flags.includes("\\Seen")
                            };
                            let mailExists = allCachedMails.find((m) => m.messageId == mail.messageId);
                            if (!mailExists) {
                                allCachedMails.push(mail);
                                callback(true, mail);
                            }
                        });
                    });
                    msg.once("error", (err) => {
                        callback(false, err);
                    });
                });
                f.once("error", (err) => {
                    callback(false, err);
                });
            }
        });
    });

    imap.once("error", (err) => {
        callback(false, err);
        imap.end();
    });
}


/**
 * Initializes the mail cache by downloading all mails from the server and setting up a check for new mails.
 * 
 * @param {function(boolean, Array): void} callback - The callback function to be called after all mails are downloaded. 
 *        It receives a boolean indicating success and an array of mails.
 * @param {function(Object, Object): void} onNewMail - The callback function to be called when a new mail is downloaded.
 *        It receives the new mail object and the imap object.
 */
function initMailCache(callback, onNewMail) {
    getAllMails((success, mails) => {
        if (success) {
            console.log(`Downloaded ${mails.length} mails from server`);
            initCheckNewMails((success, mail) => {
                if (success) {
                    console.log(`Downloaded new mail from: ${mail.from} with subject: ${mail.subject}`);
                    onNewMail && onNewMail(mail, imap);
                } else {
                    console.log("Failed to download new mail", mail);
                    initMailCache(callback);
                }
            });
        } else {
            console.log("Failed to download mails", mails);
            initMailCache(callback);
        }
        callback && callback(success, mails);
    });
}



/**
 * Marks emails as read based on the provided criteria.
 *
 * @param {string} [subject] - The subject of the email to mark as read. If provided, marks emails with matching subjects as read.
 * @param {Date} [since] - The date from which to mark emails as read. If provided, marks emails received after this date as read.
 * @param {string} [mailId] - The Message-ID of the email to mark as read. If provided, marks the email with this Message-ID as read.
 */
function markAsRead(subject, since, mailId) {
    let searchCriteria = ["UNSEEN"];

    if (mailId) {
        searchCriteria.push(["HEADER", "Message-ID", mailId]);
        allCachedMails.filter(mail => mail.messageId == mailId).forEach(mail => mail.unread = false);
    }

    if (subject) {
        searchCriteria.push(["SUBJECT", subject]);
        allCachedMails.filter(mail => mail.subject.match(new RegExp(".*" + subject + ".*"))).forEach(mail => mail.unread = false);
    }
    if (since) {
        searchCriteria.push(["SINCE", since]);
        allCachedMails.filter(mail => new Date(mail.date) > since).forEach(mail => mail.unread = false);
    }
    imap.search(searchCriteria, (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            const f = imap.fetch(results, { bodies: "" });
            f.on("message", (msg) => {
                msg.once("attributes", (attrs) => {
                    if (attrs.flags.includes("\\Seen")) return;
                    imap.setFlags(attrs.uid, "\\Seen", (err) => {
                        if (err) throw err;
                    });
                }
                );

            });

        }
    });


}

function getAllCachedMails() {
    return allCachedMails;
}

/*

initMailCache((status, mails) => {
    console.log("Mail cache initialized");
    markAsRead("SENT:#Bon")
}, (mail) => {
    if (mail.subject.startsWith("SENT:")) {
        markAsRead(null, null, mail.messageId);
    }
}
);
*/

module.exports = {
    initMailCache: initMailCache,
    markAsRead: markAsRead,
    getAllCachedMails: getAllCachedMails
};