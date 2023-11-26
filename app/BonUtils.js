var config=require('../resources/config.js');

module.exports = class BonUtils {
 static getEmptyBon() {
    let bon={
      "id": "",
      "delivery_date": "",
      "status": "",
      "status2": "",
      "nr_of_servings": "",
      "kitchen_selects": 0,
      "customer_collects": 0,
      "price_category": "",
      "payment_type": "",
      "customer_info": "",
      "kitchen_info": "",
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

  static expandMessageFromBon(message,bon,dateFormat) {
    let deliveryAdress=`
    ${bon.delivery_address.street_name2}
    ${bon.delivery_address.street_name} ${bon.delivery_address.street_nr}
    ${bon.delivery_address.zip_Code} ${bon.delivery_address.city}
    `;

    let deliveryDate=new Date(bon.delivery_date);

    let values={
      bonId:bon.id,
      bonPrefix:config.bonPrefix,
      deliveryAdr:deliveryAdress,
      deliveryDate:deliveryDate.toLocaleDateString(dateFormat),
      deliveryTime:deliveryDate.toLocaleTimeString(dateFormat,{hour: '2-digit', minute:'2-digit'}),
      orderWithPrices:bon.orders.map(o=>(`${o.quantity} X ${o.name} (${o.price*o.quantity} kr)${o.special_request!==""?"  \n\t"+o.special_request:""}`)).join("\n"),
      orders:bon.orders.map(o=>(`${o.quantity} X ${o.name}${o.special_request!==""?"  \n\t"+o.special_request:""}`)).join("\n"),
      totSum:bon.orders.reduce((s,e)=>(s+e.quantity*e.price),0),
      foreName:bon.customer.forename,
      surName:bon.customer.surname,
      pax:bon.nr_of_servings
    }

    let expandedMessage=message;
    Object.keys(values).forEach(k => {
      expandedMessage = expandedMessage.replaceAll("${" + k + "}", values[k]);
    });
    return expandedMessage;

  }
     
}

