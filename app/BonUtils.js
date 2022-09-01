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
     
}