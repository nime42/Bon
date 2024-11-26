class MapGlobals {
    
    static homePosition=[${config.geo.homePosition}]; //[\${config.geo.homePosition}]
    static homeName="${config.geo.homeName}"; //"\${config.geo.homeName}"
    static byExpressenPickupMinutes=${config.geo.byExpressenPickupMinutes}; //\${config.geo.byExpressenPickupMinutes}
    static prePickupMinutes=${config.geo.prePickupMinutes}; //\${config.geo.prePickupMinutes}
    static postPickupMinutes=${config.geo.postPickupMinutes}; //\${config.geo.postPickupMinutes}
    static durationFactor=${config.geo.durationFactor}; //\${config.geo.durationFactor};

    static features;
    static sectionTemplate;
    static rowTemplate;
    static geoData=[];


}