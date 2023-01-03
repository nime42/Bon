class LoginHandler {


    constructor(div) {

    }

    setLoginForm(div) {


        if (typeof div === "string") {
            this.loginDiv = document.querySelector(div);
        } else {
            this.loginDiv = div;
        }

        let self = this;
        this.loginDiv.querySelector("input[type=submit]").onclick = () => {
            let errorElem = self.loginDiv.querySelector("#error-msg");
            if (errorElem) {
                errorElem.innerHTML = "";
            }
            let loginParams = this._collectInput(this.loginDiv);
            $.ajax({
                type: "POST",
                url: "login",
                cache: false,
                data: loginParams,
                success: function (data, status, jqxhr) {
                    self.onLoggedIn && self.onLoggedIn();

                },
                error: function (data, status, jqxhr) {
                    let errorMsg;
                    if (data.status === 401) {
                        errorMsg = "Ugyldigt anvender navn eller password!!!";

                    } else {
                        errorMsg = "Lige nu går det ikke at logge på, prøv senere!";

                    }
                    if (errorElem) {
                        errorElem.innerHTML = errorMsg;
                    } else {
                        alert(errorMsg);
                    }

                }

            });


            return false;

        };

    }



    setRegisterForm(div) {
        if (typeof div === "string") {
            this.registerDiv = document.querySelector(div);
        } else {
            this.registerDiv = div;
        }

        let self = this;
        this.registerDiv.querySelector("input[type=submit]").onclick = () => {
            let errorElem = self.registerDiv.querySelector("#error-msg");
            if (errorElem) {
                errorElem.innerHTML = "";
            }


            let registerParams = this._collectInput(this.registerDiv);

            $.ajax({
                type: "POST",
                url: "register",
                cache: false,
                data: registerParams,
                success: function (data, status, jqxhr) {
                    self.onRegistered && self.onRegistered();
                },
                error: function (data, status, jqxhr) {
                    let errorMsg;
                    if (data.status === 403) {
                        errorMsg = "Brugeren findes allerede";

                    } else {
                        errorMsg = "Det gik ikke at registrere brugeren, førsøg senere!";

                    }
                    if (errorElem) {
                        errorElem.innerHTML = errorMsg;
                    } else {
                        alert(errorMsg);
                    }
                }

            });


            return false;

        };

    }



    setForgotPasswordForm(div) {
        if (typeof div === "string") {
            this.forgotPasswordDiv = document.querySelector(div);
        } else {
            this.forgotPasswordDiv = div;
        }

        let self = this;
        this.forgotPasswordDiv.querySelector("input[type=submit]").onclick = () => {
            let errorElem = self.forgotPasswordDiv.querySelector("#error-msg");
            if (errorElem) {
                errorElem.innerHTML = "";
            }


            let forgotPasswordParams = this._collectInput(this.forgotPasswordDiv);
            $.ajax({
                type: "POST",
                url: "forgotPassword",
                cache: false,
                data: forgotPasswordParams,
                success: function (data, status, jqxhr) {
                    self.onForgotPassword && self.onForgotPassword();
                },
                error: function (data, status, jqxhr) {
                    let errorMsg;
                    if (data.status === 404) {
                        errorMsg = "mailadress saknas";

                    } else {
                        errorMsg = "Det gik ikke at nulstille password, fforsøg igen senere!";

                    }
                    if (errorElem) {
                        errorElem.innerHTML = errorMsg;
                    } else {
                        alert(errorMsg);
                    }
                }

            });

            return false;

        };

    }



    setResetPasswordForm(div) {
        if (typeof div === "string") {
            this.resetPasswordDiv = document.querySelector(div);
        } else {
            this.resetPasswordDiv = div;
        }

        let self = this;
        this.resetPasswordDiv.querySelector("input[type=submit]").onclick = () => {
            let errorElem = self.resetPasswordDiv.querySelector("#error-msg");
            if (errorElem) {
                errorElem.innerHTML = "";
            }


            let resetPasswordParams = this._collectInput(this.resetPasswordDiv);
            resetPasswordParams.resetToken = self.resetToken
            $.ajax({
                type: "POST",
                url: "resetPassword",
                cache: false,
                data: resetPasswordParams,
                success: function (data, status, jqxhr) {
                    self.onResetPassword && self.onResetPassword();
                },
                error: function (data, status, jqxhr) {
                    let errorMsg;
                    if (data.status === 404) {
                        errorMsg = "ukendt bruger";

                    } else {
                        errorMsg = "Det gik ikke at nulstille password, prøv igen senere!";

                    }
                    if (errorElem) {
                        errorElem.innerHTML = errorMsg;
                    } else {
                        alert(errorMsg);
                    }
                }

            });

            return false;

        };

    }



    setUpdateForm(div) {
        if (typeof div === "string") {
            this.updateDiv = document.querySelector(div);
        } else {
            this.updateDiv = div;
        }

        let self = this;
        this.updateDiv.querySelector("input[type=submit]").onclick = () => {
            let errorElem = self.updateDiv.querySelector("#error-msg");
            if (errorElem) {
                errorElem.innerHTML = "";
            }


            let updateParams = this._collectInput(this.updateDiv);

            $.ajax({
                type: "POST",
                url: "updateInfo",
                cache: false,
                data: updateParams,
                success: function (data, status, jqxhr) {
                    self.onUpdate && self.onUpdate();

                },
                error: function (data, status, jqxhr) {
                    let errorMsg = "Uppdateringen misslyckades";
                    if (errorElem) {
                        errorElem.innerHTML = errorMsg;
                    } else {
                        alert(errorMsg);
                    }
                }

            });


            return false;

        };

    }

    createUser(userParams,callback) {
        $.ajax({
            type: "POST",
            url: "register",
            cache: false,
            data: userParams,
            success: function (data, status, jqxhr) {
               callback(true,data);
            },
            error: function (data, status, jqxhr) {
                callback(false,data);
            }

        });
    }

    updateUser(userParams,callback) {
        $.ajax({
            type: "POST",
            url: "updateInfo",
            cache: false,
            data: userParams,
            success: function (data, status, jqxhr) {
               callback(true,data);
            },
            error: function (data, status, jqxhr) {
                callback(false,data);
            }

        });
    }

    deleteUser(userId,callback) {
        $.ajax({
            type: "DELETE",
            url: "user/"+userId,
            cache: false,
            success: function (data, status, jqxhr) {
               callback(true,data);
            },
            error: function (data, status, jqxhr) {
                callback(false,data);
            }

        });

    }

    getAllUsers(callback) {

        let url="getUsers/";
        $.get(url,callback);
    }

    getAllRoles(callback) {

        let url="getAllRoles/";
        $.get(url,callback);
    }


    isResetRequest() {
        let urlVars = this._getUrlVars();
        this.resetToken = urlVars["reset-token"];
        if (this.resetToken) {
            return true;
        } else {
            return false;
        }

    }

    removeResetTokenFromUrl() {
        let url = window.location.href.replace(/reset-token=[0-9]*/, "");
        return url;
    }

    isLoggedIn() {
        if (this._getCookie("LoginHandler-SessId")) {
            return true;
        } else {
            return false;
        }
    }

    whenLoggedIn(func) {
        this.onLoggedIn = func;
    }

    whenForgotPassword(func) {
        this.onForgotPassword = func;
    }
    whenResetPassword(func) {
        this.onResetPassword = func;
    }

    whenUpdate(func) {
        this.onUpdate = func;
    }


    logout(callback) {
        this._deleteCookie("LoginHandler-SessId");
        let url = "logout";
        $.get(url, callback);
    }

    getUserInfo(callback) {
        let url = "getUserInfo";
        $.get(url, callback);
    }

    getUserRoles(id,callback) {
        let url="roles/"+id;
        $.get(url, callback);
    }

    updateUserRoles(id,roles,callback) {
        let url="updateRoles/"+id;
        let body={roles:roles};

        $.ajax({
            type: "PUT",
            url: url,
            data: JSON.stringify(body),
            success: function (data, status, jqxhr) {
                callback(true,data);
             },
             error: function (data, status, jqxhr) {
                 callback(false,data);
             },
            contentType: "application/json"
          });
    }

    populateUserInfoForm(form) {
        let formElem
        if (typeof form === "string") {
            formElem = document.querySelector(form);
        } else {
            formElem= form;
        }

        formElem.querySelectorAll('input:not([type="submit"]):not([type="button"])').forEach(e=>{
            e.value="";
        })

        this.getUserInfo((info)=>{
            Object.keys(info).forEach(k=>{
                let elem=formElem.querySelector(`input[name=${k}]`);
                if(elem) {
                    elem.value=info[k];
                }

            })
        })
        

    }

    checkAccess(roles, elem) {
        let root = document;
        if (elem) {
            if (typeof elem === "string") {
                root = document.querySelector(elem);
            } else {
                root = elem;
            }
        }

        root.querySelectorAll('[data-check-access]').forEach(e => {
            if (!this.isLoggedIn()) {
                e.style.display = "none";
            } else {
                let neededRoles = e.getAttribute('data-check-access');
                let expr = neededRoles;
                roles && roles.forEach(r => {
                    expr = expr.replace(new RegExp("\\$\\{ *" + r + " *\\}"), true);
                })
                expr = expr.replaceAll(new RegExp("\\$\\{[^\\}]*\\}", "g"), false);
                if (eval(expr == "" || expr)) {
                    e.style.display = "";
                } else {
                    e.style.display = "none";
                }
            }

        })
    }

    _getUrlVars() {
        var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
            function (m, key, value) {
                vars[key] = value;
            });
        return vars;
    }

    _collectInput(div) {
        let res = {}
        div.querySelectorAll("input").forEach(e => {
            res[e.name] = e.value.trim();

        })
        return res;
    }

    _getCookie(name) {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; ++i) {
            var pair = cookies[i].trim().split('=');
            if (pair[0] == name)
                return pair[1];
        }
        return null;
    };
    _deleteCookie(name) {
        document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }


}
