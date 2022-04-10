module.exports = {

    app: {
        http:8080,
        https_do_not_use_for_the_moment:8443
    },

    certs: {
        privateKey:"./resources/private.key",
        certificate:"./resources/certificate.crt",
        ca:"./resources/ca_bundle.crt"
    },

    grocy:{
        url:"https://grocytest.ristetrug.dk",
        apiKey:"??"
      },

    userDB:"./resources/users.db",


    mail: {
        service: "gmail",
        user: "tipsy.nu@gmail.com",
        passwd: "??",        
        port:25
    },

    forgotPasswordMailTemplate:{
        from:"tipsy@gmail.com",
        subject:"Återställ lösenord",
        body:`
        Hej
        Använd nedanstående länk för att återställa lösenord för användare $USER$:
        $URL$
        Mvh
        Bon
        `
    }

}