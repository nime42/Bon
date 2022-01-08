module.exports = {

    app: {
        http:8080,
        https:8443
    },

    certs: {
        privateKey:"./resources/private.key",
        certificate:"./resources/certificate.crt",
        ca:"./resources/ca_bundle.crt"

    }

}