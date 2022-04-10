var nodemailer = require('nodemailer');





var transporter
  

function init(mailconfig) {
    transporter = nodemailer.createTransport({
        service: mailconfig.service,//smtp.gmail.com  //in place of service use host...
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


function sendMail(from,to,cc,subject,text,html, callback) {
    var mailOptions = {
        from: from,
        to: to,
        cc:cc,
        subject: subject,
        text: text,
        html:html
      };
      console.log("Sending mail with subject '"+mailOptions.subject+"' to "+mailOptions.to);
      transporter.sendMail(mailOptions, callback);      
}

module.exports = {
    init:init,
    sendMail:sendMail
}