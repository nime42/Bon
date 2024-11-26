module.exports = {

    app: {
        http:8080,
        https_do_not_use:8443
    },

    certs: {
        privateKey:"./resources/private.key",
        certificate:"./resources/certificate.crt",
        ca:"./resources/ca_bundle.crt"

    },

    grocy:{
	    url:"https://grocytest.ristetrug.dk",
	    apiKey:"???"
	  },


    bonPrefix:"test",
    bonInstance:"Test",


    userDB:"./resources/users.db",

    geo:{
        geocodeUrl:"https://geocode.maps.co",
        apiKey:"???",
        routeServiceUrl:"https://api.openrouteservice.org",
        routeServiceToken:"???",
        routeDirectionProfile:"driving-hgv",

        homePosition:[55.693459, 12.552345],
        homeName:"Ristet Rug Cafe",
        byExpressenPickupMinutes:45,
        prePickupMinutes:5,
        postPickupMinutes:5,
        durationFactor:1.2
    },

    mailManager: {
        user: 'bon@ristetrug.dk',
        password: '???',
        host: 'imap.simply.com',
        port: 993,
        tls: true,
        rejectUnauthorized: 0,
        XincomingMails:{
              subjectContains:['Bestillings Form'],
              fromTimeZone:"Europe/Copenhagen",
              checkPeriodic:5,
              dateFormat:"da-DK",
              confirmSubject:"Tak for din bestilling!",
              confirmTemplate:"AutoReply:incoming"
        }
},





    mail: {
	host: "smtp.simply.com",
	user: "bon@ristetrug.dk",
	passwd: "???",
	port:587
    },

    forgotPasswordMailTemplate:{
        from:"bon@ristetrug.dk",
        subject:"Återställ lösenord",
        body:`
        Hej
        Använd nedanstående länk för att återställa lösenord för användare $USER$:
        $URL$
        Mvh
        Bon
        `
    },


    iZettle:{
        grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",
        client_id:"???
        api_key:"???",
        orgUuid: "???",
        api_url:"https://purchase.izettle.com",
        products_api_url:"https://products.izettle.com",
        auth_server:"https://oauth.zettle.com/token",
        filter:".*Trelleborg.*",
        _disabled___check_frequence:15,
        lookDaysBack:3


    },


    XotherBons: [
                //"/home/bon/nordhavnServer/resources/config.js",
                //"/home/bon/strandlystServer/resources/config.js",
                "C:/Users/nilsm/projects/otherBons/trailerServer/resources/config.js"
   ]

}
