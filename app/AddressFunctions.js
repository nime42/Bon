const fetch = require("node-fetch");

module.exports = class AdressFunctions {
  constructor(config) {
    this.config = config;
    if (this.config.geo) {
      this.url = this.config.geo.geocodeUrl;
      this.apiKey = this.config.geo.apiKey;
      this.routeServiceUrl = this.config.geo.routeServiceUrl;
      this.routeServiceToken = this.config.geo.routeServiceToken;
    } else {
      console.log("AdressFunctions: missing config.geo, Bon will not be able to find adresses or directions");
    }
  }

  findCoordinates(address, callback) {
    if (this.url === undefined) {
      callback(false, []);
    }
    let query = `${address.street_name} ${address.street_nr} ${address.zip_code} ${address.city}`;
    let httpReq = `${this.url}/search?api_key=${this.apiKey}&q=${query}`;
    fetch(httpReq)
      .then((res) => res.json())
      .then((data) => {
        if (data[0] != undefined) {
          callback(true, { lat: data[0].lat, lon: data[0].lon });
        } else {
          console.log(`Failed to find coordinates for address ${query}`);
          callback(false, []);
        }
      });
  }

  getRoute(coordA, coordZ, callback = console.log) {
    let headers = {
      Authorization: this.routeServiceToken,
      "Content-Type": "application/json; charset=utf-8",
    };

    let directionsUrl = this.routeServiceUrl + "/v2/directions/driving-car/geojson";
    let directionsBody = {
      coordinates: [
        [coordA[1], coordA[0]],
        [coordZ[1], coordZ[0]],
      ],
    };

    fetch(directionsUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(directionsBody),
    })
      .then((response) => response.json())
      .then((data) => {
        callback(data);
      })
      .catch((err) => {
        console.log("Failed to get directions:", directionsBody);
        callback({})
      });

      /*
        */


  }
  getTimeAndDistanceMatrix(places,callback = console.log) {


    let locations=places.filter(p=>(p.position!==undefined)).map(p=>(p.position));

    let headers = {
      Authorization: this.routeServiceToken,
      "Content-Type": "application/json; charset=utf-8",
    };
    let matrixUrl = this.routeServiceUrl + "/v2/matrix/driving-car";
    let matrixBody = {
      locations:locations,
      metrics: ["distance", "duration"]
    };
    fetch(matrixUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(matrixBody),
    })
      .then((response) => response.json())
      .then((data) => {
        data.destinations.forEach((d,i) => {
          d.id=places[i].id;
        });
        callback(data);
      })
      .catch((err) => {
        console.log("Failed to get distance and time matrix:", matrixBodyBody,err);
        callback({})
      });



  }
};  