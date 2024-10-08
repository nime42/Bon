const fetch = require("node-fetch");

module.exports = class AdressFunctions {
  constructor(config) {
    this.config = config;
    if (this.config.geo) {
      this.url = this.config.geo.geocodeUrl;
      this.apiKey = this.config.geo.apiKey;
      this.routeServiceUrl = this.config.geo.routeServiceUrl;
      this.routeServiceToken = this.config.geo.routeServiceToken;
      this.routeDirectionProfile=this.config.geo.routeDirectionProfile!==undefined?this.config.geo.routeDirectionProfile:"driving-car"
      console.log(`AdressFunctions(${this.config.bonInstance}): using routing profile '${this.routeDirectionProfile}' when calculating routes`);
    } else {
      console.log(`AdressFunctions(${this.config.bonInstance}): missing config.geo, Bon will not be able to find adresses or directions`);
    }
  }

  findCoordinates(address, callback) {
    if (this.url === undefined) {
      callback(false, []);
    }
    //jotform could represent a street-nr "5B, 1 tr" like "1 tr/5B"
    //get rid of everything before /
    let fixedStreetNr=address.street_nr.replace(/.*\//,"");
    
    //Try to parse out a streetnumber, e.g a number eventually followed by one entrance char or two
    let regexp=fixedStreetNr.match(/([0-9]+ ?[A-Za-z]{0,2})/);
    if(regexp) {
      fixedStreetNr=regexp[0];
    }

    let query = `${address.street_name} ${fixedStreetNr} ${address.zip_code} ${address.city}`;
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

    let directionsUrl = this.routeServiceUrl + "/v2/directions/"+this.routeDirectionProfile+"/geojson";
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
    if(locations.length<2) {
      throw "getTimeAndDistanceMatrix:must be more than one location";
    }

    let headers = {
      Authorization: this.routeServiceToken,
      "Content-Type": "application/json; charset=utf-8",
    };
    let matrixUrl = this.routeServiceUrl + "/v2/matrix/"+this.routeDirectionProfile;
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
        console.log("Failed to get distance and time matrix:", matrixBody,err);
        callback({})
      });



  }
};  