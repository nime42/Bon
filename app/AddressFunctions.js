const fetch = require("node-fetch");

module.exports = class AdressFunctions {
  constructor(config) {
    this.config = config;
    if (this.config.geo) {
      this.url = this.config.geo.geocodeUrl;
      this.apiKey = this.config.geo.apiKey;
      this.routeServiceUrl = this.config.geo.routeServiceUrl;
      this.routeServiceToken = this.config.geo.routeServiceToken;
      this.routeDirectionProfile = this.config.geo.routeDirectionProfile !== undefined ? this.config.geo.routeDirectionProfile : "driving-car";
      console.log(`AdressFunctions(${this.config.bonInstance}): using routing profile '${this.routeDirectionProfile}' when calculating routes`);
      this.homePosition = this.config.geo.homePosition;
    } else {
      console.log(`AdressFunctions(${this.config.bonInstance}): missing config.geo, Bon will not be able to find adresses or directions`);
    }
  }

  async findCoordinates(address) {
    if (this.url === undefined) {
      return [false, []];
    }
    //jotform could represent a street-nr "5B, 1 tr" like "1 tr/5B"
    //get rid of everything before /
    let fixedStreetNr = address.street_nr.replace(/.*\//, "");

    //Try to parse out a streetnumber, e.g a number eventually followed by one entrance char or two
    let regexp = fixedStreetNr.match(/([0-9]+ ?[A-Za-z]{0,2})/);
    if (regexp) {
      fixedStreetNr = regexp[0];
    }

    let query = `${address.street_name} ${fixedStreetNr} ${address.zip_code} ${address.city}`;
    let httpReq = `${this.url}/search?api_key=${this.apiKey}&q=${query}`;
    try {
      let response = await fetch(httpReq);
      let data = await response.json();
      if (data.length > 0) {
        return [true, { lat: data[0].lat, lon: data[0].lon }];
      } else {
        return [false, []];
      }
    } catch (err) {
      console.error(`failed to find coordinates for adress ${query}:${err}`);
      return [false, []];
    }
  }


  /**
   * Get route info from A to Z
   * 
   * @param {*} coordA start position [lat,lon]
   * @param {*} coordZ end position [lat,lon]
   * @param {*} callback function(data) see https://openrouteservice.org/dev/#/api-docs/v2/directions/{profile}/geojson/post
   * @param {*} routeDirectionProfile 
   */
  getRoute(coordA, coordZ, callback = console.log,routeDirectionProfile) {
    if (this.routeServiceUrl === undefined) {
      callback({});
    }
    let headers = {
      Authorization: this.routeServiceToken,
      "Content-Type": "application/json; charset=utf-8",
    };

    if(!routeDirectionProfile) {
      routeDirectionProfile=this.routeDirectionProfile
    }
    let directionsUrl = this.routeServiceUrl + "/v2/directions/" + routeDirectionProfile + "/geojson";
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
        console.log(err);
        console.log("Failed to get directions:", directionsBody);
        callback({});
      });




    /*
     */
  }

  /**
   * Get route,distance and duration from homepos to [lat,lon]
   * 
   * @param {*} lat 
   * @param {*} lon 
   * @param {*} callback(
   * {
   *    feature:GeoJson obj
    *   distance:meters,
    *   duration:seconds,
    *   routeDirectionProfile:"profile"
    *  }
   * })
   * @param {*} routeDirectionProfile see https://openrouteservice.org/dev/#/api-docs/v2/directions/{profile}/geojson/post
   */
  getRouteFromHome(lat,lon, callback = console.log,routeDirectionProfile) {
    let homeCoord = this.homePosition;
    let target=[lat,lon];
    this.getRoute(homeCoord,target,(data)=>{
      let res;
      if(data.features?.length>0) {
      res={
        feature:data.features[0],
        distance:data.features[0].properties.summary.distance,
        duration:data.features[0].properties.summary.duration,
        profile:data.metadata.query.profile
      }
    } else {
      res={}

    }
      callback(res);
    },routeDirectionProfile)
  }

  
  /**
   * Takes a list of positions and returns distances- and duration matrices between all positions
   * @param {*} places a list [{id:"id-name",position:[lon,lat]},...]
   * @param {*} callback see https://openrouteservice.org/dev/#/api-docs/matrix%20service
   */
  getTimeAndDistanceMatrix(places, callback = console.log) {
    if (this.routeServiceUrl === undefined) {
      callback({});
    }

    let locations = places.filter((p) => p.position !== undefined).map((p) => p.position);
    if (locations.length < 2) {
      throw "getTimeAndDistanceMatrix:must be more than one location";
    }

    let headers = {
      Authorization: this.routeServiceToken,
      "Content-Type": "application/json; charset=utf-8",
    };
    let matrixUrl = this.routeServiceUrl + "/v2/matrix/" + this.routeDirectionProfile;
    let matrixBody = {
      locations: locations,
      metrics: ["distance", "duration"],
    };
    fetch(matrixUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(matrixBody),
    })
      .then((response) => response.json())
      .then((data) => {
        data.destinations.forEach((d, i) => {
          d.id = places[i].id;
        });
        callback(data);
      })
      .catch((err) => {
        console.log("Failed to get distance and time matrix:", matrixBody, err);
        callback({});
      });
  }

 

};
