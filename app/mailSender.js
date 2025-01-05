var nodemailer = require('nodemailer');





var transporter


function init(mailconfig) {
  transporter = nodemailer.createTransport({
    service: mailconfig.service,//smtp.gmail.com  //in place of service use host...
    host: mailconfig.host,
    secure: false,//true
    port: mailconfig.port,//465
    tls: {
      rejectUnauthorized: false
    },
    auth: {
      user: mailconfig.user,
      pass: mailconfig.passwd
    }

  });

}


function sendMail(from, to, cc, bcc, subject, text, html, callback) {
  var mailOptions = {
    from: from,
    to: to,
    cc: cc,
    bcc: bcc,
    subject: subject,
    text: text,
    html: html
  };
  console.log("Sending mail with subject '" + mailOptions.subject + "' to " + mailOptions.to);
  transporter.sendMail(mailOptions, callback);
}

function sendMailWithReceipt(from, to, cc, bcc, subject, text, html, callback) {
  sendMail(from, to, cc, bcc, subject, text, html, (err) => {
    if (err) {
      callback(err);
    } else {
      let receipt = "SENT:" + subject;
      sendMail(from, from, cc, bcc, receipt, text, html, (err) => {
        if (err) {
          console.err("failed to send receipt:" + receipt, err);
          callback(err);
        } else {
          callback(null);
        }
      });
    }
  })
}

module.exports = {
  init: init,
  sendMail: sendMail,
  sendMailWithReceipt: sendMailWithReceipt
}