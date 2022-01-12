module.exports = {

    app: {
        http:8080,
        https_do_not_use_for_the_moment:8443
    },

    certs: {
        privateKey:"./resources/private.key",
        certificate:"./resources/certificate.crt",
        ca:"./resources/ca_bundle.crt"

    }

}