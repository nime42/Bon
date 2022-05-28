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
        apiKey:"9WEtOxgR93OYZAWf0lXS0LTwiYUjFweVA6d6gRuwtaQEitDIdE"
      },

    userDB:"./resources/users.db",

    bonPrefix:"test",

    mail: {
        service: "gmail",
        user: "tipsy.nu@gmail.com",
        passwd: "s01r0s20!",        
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