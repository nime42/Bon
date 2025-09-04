var config = require('../resources/config.js');

module.exports = class BonUtils {
  //Don't forget to update helpers.getEmptyBon in frontend when you update this.
  static getEmptyBon() {
    let bon = {
      "id": "",
      "delivery_date": "",
      "pickup_time": null,
      "status": "",
      "status2": "",
      "nr_of_servings": "",
      "pax_units": "",
      "kitchen_selects": 0,
      "customer_collects": 0,
      "price_category": "",
      "payment_type": "",
      "customer_info": "",
      "kitchen_info": "",
      "kitchen_ingredients_exists": 0,
      "kitchen_supplies_exists": 0,
      "delivery_info": "",
      "invoice_info": "",
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

  static expandMessageFromBon(message, bon, dateFormat) {
    let deliveryAdress = `
    ${bon.delivery_address.street_name2}
    ${bon.delivery_address.street_name} ${bon.delivery_address.street_nr}
    ${bon.delivery_address.zip_code} ${bon.delivery_address.city}
    `;

    let deliveryDate = new Date(bon.delivery_date);
    deliveryDate = this.adjustForTimeZone(deliveryDate);



    let values = {
      bonId: bon.id,
      bonPrefix: config.bonPrefix,

      foreName: bon.customer.forename,
      surName: bon.customer.surname,

      deliveryAdr: deliveryAdress,
      deliveryStreet: bon.delivery_address.street_name,
      deliveryStreetNr: bon.delivery_address.street_nr,
      deliveryZipCode: bon.delivery_address.zip_code,
      deliveryCity: bon.delivery_address.city,


      deliveryDate: deliveryDate.toLocaleDateString(dateFormat),
      deliveryTime: deliveryDate.toLocaleTimeString(dateFormat, { hour: '2-digit', minute: '2-digit' }),

      orders: bon.orders.map(o => (`${o.quantity} X ${o.name}${o.special_request !== "" ? "  \n\t" + o.special_request : ""}`)).join("\n"),
      orderWithPrices: bon.orders.map(o => (`${o.quantity} X ${o.name} (${o.price * o.quantity} kr)${o.special_request !== "" ? "  \n\t" + o.special_request : ""}`)).join("\n"),
      orderWithCo2e: bon.orders.map(o => (`${o.quantity} X ${o.name} (${o.co2e * o.quantity} CO2e)${o.special_request !== "" ? "  \n\t" + o.special_request : ""}`)).join("\n"),
      orderWithPricesAndCo2e: bon.orders.map(o => (`${o.quantity} X ${o.name} (${o.price * o.quantity} kr) (${o.co2e * o.quantity} CO2e)${o.special_request !== "" ? "  \n\t" + o.special_request : ""}`)).join("\n"),

      totSum: bon.orders.reduce((s, e) => (s + e.quantity * e.price), 0),
      totCo2e: bon.orders.reduce((s, e) => (s + e.quantity * e.co2e), 0),

      pax: bon.nr_of_servings,
      paxUnits: bon.pax_units,
    }

    let expandedMessage = message;
    Object.keys(values).forEach(k => {
      expandedMessage = expandedMessage.replaceAll("${" + k + "}", values[k]);
    });
    return expandedMessage;

  }


  /**
   * Get the time difference between a local date and another timezone.
   *
   * Could be usefull if you get date as a string without timezone but you know what timezone it come from
   * let d=new Date(dateString);
   * d.setTime(d-getLocalTimeOffsetDiff(d,"Europe/Copenhagen"));
   * @param {Date} date
   * @param {String} timeZone - A TZ database name (see https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
   * @returns {Integer} difference in milliseconds
   */
  static getLocalTimeOffsetDiff(date, timeZone = config.localTimeZone) {
    if (!timeZone) {
      return 0;
    }
    let dateWithoutSec = new Date(date);
    dateWithoutSec.setSeconds(0, 0);
    let local = new Date(
      dateWithoutSec.toLocaleString("default", { timeZone: timeZone })
    );
    local.setSeconds(0, 0);
    return local - dateWithoutSec;
  }

  static adjustForTimeZone(date) {
    let d = new Date(date);
    d.setTime(d.getTime() + this.getLocalTimeOffsetDiff(d));
    return d;
  }


}

