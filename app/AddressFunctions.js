const fetch = require("node-fetch");

module.exports = class AdressFunctions {
    constructor(config) {
      this.config = config;
      if(this.config.geo) {
        this.url=this.config.geo.geocodeUrl;
        this.apiKey=this.config.geo.apiKey;
      } else {
        console.log("AdressFunctions: missing config.geo, Bon will not be able to find adresses");
      }

    }


    findCoordinates(address,callback) {
        if(this.url===undefined) {
            callback(false,[]);
        }
        let query=`${address.street_name} ${address.street_nr} ${address.zip_code} ${address.city}`;
        let httpReq=`${this.url}/search?api_key=${this.apiKey}&q=${query}`
        fetch(httpReq).then((res) => res.json())
        .then((data) => {
            if(data[0]!=undefined) {
                callback(true,{lat:data[0].lat,lon:data[0].lon})
            } else {
                console.log(`Failed to find coordinates for address ${query}`);
                callback(false,[]);
            }
            
        })

    }

}  