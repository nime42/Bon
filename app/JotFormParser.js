const BonUtils = require('./BonUtils.js');

function parseJotFormWebHook(rawRequest) {
    let res = {};
    res.forename = rawRequest.q8_navn.first;
    res.surname = rawRequest.q8_navn.last;
    res.email = rawRequest.q1_email;
    res.phone = rawRequest.q2_telefonnummer.full;

    let d = rawRequest.q11_date;
    res.delivery_date = new Date(`${d.year}-${d.month}-${d.day}T${d.timeInput}`);
    res.delivery_date.setTime(dateValue - BonUtils.getLocalTimeOffsetDiff(delivery_date));

    res.company = rawRequest.q10_firmaNavn;

    res.nr_of_servings = rawRequest.q12_antalGaester;

    res.kitchen_selects = rawRequest.q13_typeA ? 1 : 0;
    res.customer_collects = rawRequest.q49_typeA49 ? 1 : 0;

    let adress = rawRequest.q25_typeA25;
    let m = adress.match(/Gade: (?<streetName>.*)\r\n.*Nr.*: (?<streetNr>.*)\r\n.*By: (?<city>.*)\r\n.*Post nummer: (?<zipcode>.*)/i)
    if (m) {
        res.street_name = m.groups.streetName;
        res.street_nr = m.groups.streetNr;
        res.zip_code = m.groups.zipcode;
        res.city = m.groups.city;
    }

    res.customer_info = rawRequest.q17_dinOnsker;

    res.invoice_info = rawRequest.q21_eanfakturaInfo21;
    let ean_nr = res.invoice_info.match(/\d{13}/);
    if (ean_nr) {
        res.ean_nr = ean_nr[0];
    } else {
        res.ean_nr = "";
    }

    res.delivery_info = rawRequest.q35_typeA35;
    res.contact = rawRequest.q15_kontaktPerson;
    res.contact_phone = rawRequest.q16_telefonnummer16.full;

    return res;
}

function getBon(rawRequest, dbInstance) {
    const webhookData = parseJotFormWebHook(rawRequest);
    let bon = BonUtils.getEmptyBon();

    bon.status = "new";
    bon.price_category = "Store";
    bon.payment_type = "Faktura";

    bon.customer.forename = webhookData.forename;
    bon.customer.surname = webhookData.surname;
    bon.customer.email = webhookData.email;
    bon.customer.phone_nr = webhookData.phone;
    bon.customer.company.name = webhookData.company;
    bon.customer.company.ean_nr = webhookData.ean_nr;

    bon.customer_info = webhookData.customer_info;
    bon.invoice_info = webhookData.invoice_info;


    bon.delivery_date = webhookData.delivery_date?.toISOString();

    bon.delivery_address.street_name = webhookData.street_name;
    bon.delivery_address.street_nr = webhookData.street_nr;
    bon.delivery_address.zip_code = webhookData.zip_code;
    bon.delivery_address.city = webhookData.city;

    bon.delivery_info = webhookData.delivery_info;
    if (webhookData.contact) {
        bon.delivery_info += "\nKontakt: " + webhookData.contact;
    }
    if (webhookData.contact_phone) {
        bon.delivery_info += "\nTelefon: " + webhookData.contact_phone;
    }

    bon.nr_of_servings = webhookData.nr_of_servings;
    bon.kitchen_selects = webhookData.kitchen_selects;
    bon.customer_collects = webhookData.customer_collects;

    let lastOrder = dbInstance.getLastOrderByCustomer(bon.customer.email);
    //if it's a new user set price-category to Store else use pricecategory from last order
    //and also payment_type
    if (lastOrder !== undefined) {
        if (lastOrder.price_category != "") {
            bon.price_category = lastOrder.price_category;
        }
        if (lastOrder.payment_type != "") {
            bon.payment_type = lastOrder.payment_type;
        }
    }
    if (bon.delivery_date === undefined) {
        throw "No delivery date";
    }
    return bon;
}

function sendConfirmationMail(bon, config, mailSender, dbInstance) {
    let dateFormat = config.jotForm.dateFormat;
    let subjectMessage = config.jotForm.confirmSubject;
    let confirmMessage = dbInstance.getMessage(config.jotForm.confirmTemplate)?.message?.trim();


    let subject = "#Bon:" + config.bonPrefix + "-" + bon.id + ":" + (subjectMessage ? subjectMessage : "");
    let message = BonUtils.expandMessageFromBon(confirmMessage, bon, dateFormat);
    let mailTo = bon.customer.email;
    if (config.jotForm.fakeMailRecepient) {
        mailTo = config.jotForm.fakeMailRecepient;
        message = "This is actually a mail to: " + bon.customer.email + "\n\n" + message;
    }

    console.log("mailSender");
    console.log(config.mail.user, mailTo, "", "", subject, message, "");
    return;
    mailSender.sendMail(config.mail.user, mailTo, "", "", subject, message, "", (err) => {
        if (err) {
            console.error("Failed to send confirmation mail", err);
        } else {
            console.log("Confirmation mail sent");
        }
    });

}

function sendOnErrorMail(bonId, submissionId, err, config, mailSender) {
    let subject = `Error in JotFormParser(bonid: ${bonId})`;
    let message = "Error in JotFormParser: " + err;
    message += `\n\nSubmissionId: ${submissionId} (${config.jotForm?.submissionInfoUrl}/${submissionId})`;

    mailSender.sendMail(config.mail.user, config.jotForm?.mailOnError, "", "", subject, message, "", (err) => {
        if (err) {
            console.error("Failed to send error mail", err);
        } else {
            console.log("Error mail sent");
        }
    });

}

module.exports = {
    getBon: getBon,
    sendConfirmationMail: sendConfirmationMail,
    sendOnErrorMail: sendOnErrorMail
}
