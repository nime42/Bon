class MapGlobals {

    static homePosition = [${ config.geo.homePosition }]; //[\${config.geo.homePosition}]
    static homeName = "${config.geo.homeName}"; //"\${config.geo.homeName}"
    static byExpressenPickupMinutes = ${ config.geo.byExpressenPickupMinutes }; //\${config.geo.byExpressenPickupMinutes}
    static prePickupMinutes = ${ config.geo.prePickupMinutes }; //\${config.geo.prePickupMinutes}
    static postPickupMinutes = ${ config.geo.postPickupMinutes }; //\${config.geo.postPickupMinutes}
    static durationFactor = ${ config.geo.durationFactor }; //\${config.geo.durationFactor};

    static features;
    static sectionTemplate;
    static rowTemplate;
    static geoData = [];


        //see function getDeliveryType in helpers.js on how to extract the keys from a bon 
    static legends = {
    "byEkspressen": { color: '#4A90E2', text: "By-expressen", icon: 'fa fa-bicycle' }, // Clear blue
    "ristetRug": { color: '#E74C3C', text: "Ristet Rug", icon: 'fa fa-car' },         // Bright red
    "elTaxa": { color: '#2ECC71', text: "El-Taxa", icon: 'fa fa-taxi' },              // Emerald green
    "other": { color: '#95A5A6', text: "Andet", icon: '' },                            // Gray
};


}