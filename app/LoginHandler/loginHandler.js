
const cookieParser = require('cookie-parser');

var sessionHandler = require('./sessionHandler.js');
var db = require('./dbFunctions.js');

var mailSender=undefined;
var forgottenPasswordMailTemplate=undefined;

function init(app,dbFile,mailfunc,mailTemplate) {
    db.init(dbFile);
    mailSender=mailfunc;
    forgottenPasswordMailTemplate=mailTemplate;

    app.use(cookieParser());

    app.post('/login', (req, res) => {
        var username = req.body.username;
        var password = req.body.password;
        console.log(req.body);
        db.authenticateUser(username, password, function (status, userId) {
            if (status) {
                sessionHandler.addSession(req, res, userId);
                res.sendStatus(200);
            } else {
                res.sendStatus(401);
            }
        });
    })

    app.get('/logout', (req, res) => {
        sessionHandler.invalidateSession(req, res);
        res.sendStatus(200);
    })

    app.post('/register', (req, res) => {
        var username = req.body.username;
        try {
            db.getDbInstance().transaction(() => {
                db.createUser(username, function (status, id, err) {
                    if (status) {
                        db.updateUserInfo(id, req.body, function (status, err) {
                            if (status) {
                                sessionHandler.addSession(req, res, id);
                                res.sendStatus(200);
                            } else {
                                res.sendStatus(500);
                                throw "rollback";
                            }
                        })
                    } else {
                        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                            res.sendStatus(403);
                        } else {
                            res.sendStatus(500);
                        }
                    }
                });


            })();
        } catch (err) {
            if (err !== "rollback") {
                console.log("register", err);
            }
        }

    })

    app.post('/forgotPassword',(req,res)=> {  
    
        db.getUserInfoByUserNameOrEmailOrPhone(req.body.identity,function(status,row) {
            if(status) {
                if(row.length===0 || row.email==="") {
                    res.sendStatus(404);
                    return;
                } else {
                    let userId=row.userid;
                    let mailAdr=row.email;
                    let userName=row.username;
                    db.createPassWordResetToken(userId,function(status,token) {
                        let url=req.protocol + '://' + req.get('host') +"/index.html?reset-token="+token
                        let body=forgottenPasswordMailTemplate.body.replace("$URL$",url).replace("$USER$",userName);
                        let from=forgottenPasswordMailTemplate.from;
                        let to=mailAdr;
                        let cc=undefined;
                        let subject=forgottenPasswordMailTemplate.subject;
                        let text=body;
                        let html=undefined;


                        mailSender(from,to,cc,subject,text,html, function(err) {
                            if(err!==null) {
                                res.sendStatus(500);
                            } else {
                                res.sendStatus(200);          
                            }
                        })
                        
                        
                    })
                    
                }
            } else {
                res.sendStatus(500);
            }
        })
    
    });
    



    app.post('/resetPassword', (req, res) => {
        var token = req.body.resetToken;
        var password = req.body.password;
        db.resetPassword(token, password, function (status, userIdOrErr) {
            if (status) {
                sessionHandler.addSession(req, res, userIdOrErr);
                res.sendStatus(200);
            } else {
                if (userIdOrErr) {
                    console.log("Failed to resetPassword", userIdOrErr);
                    res.sendStatus(500);
                } else {
                    res.sendStatus(404);
                }
            }
        });

    })


    app.get('/getUserInfo', (req, res) => {
        let session=sessionHandler.getSession(req);
        var userId = session?session.userId:undefined;
        if (userId==undefined) {
            res.sendStatus(401);
            return;
        }
        var userId = sessionHandler.getSession(req).userId;

        db.getUserInfo(userId, function (status, userInfo) {
            if (status) {
                res.json(userInfo);
            } else {
                console.log('getUserInfo', userInfo);
                res.sendStatus(404);

            }
        })

    })


    app.post('/updateInfo', (req, res) => {
        let session=sessionHandler.getSession(req);
        var userId = session?session.userId:undefined;
        if (userId==undefined) {
            res.sendStatus(401);
            return;
        }


        if(req.body.userId) {
            if(req.body.userId!==userId) {
                if (!haveRoles(req, ["ADMIN"], "ALL")) {
                    res.sendStatus(401);
                    return;
                } else {
                    userId=req.body.userId;  
                }

            }
        }

        db.updateUserInfo(userId, req.body, function (status, err) {
            if (status) {
                res.sendStatus(200);
            } else {
                console.log('updateInfo', err);
                res.sendStatus(500);
            }
        })
    })





    

    app.put('/updateRoles', (req, res) => {
        if (!haveRoles(req, ["ADMIN"], "ALL")) {
            res.sendStatus(401);
            return;
        }
        let userId=req.body.userId;
        let roles=req.body.roles;
        db.updateRoles(userId,roles,function (status, error) {
            if (status) {
                res.sendStatus(200);
            } else {
                console.log('updateRoles', error);
                res.sendStatus(500);

            }
        });

    })





}



function getSession(req, roles) {
    return sessionHandler.getSession(req);
}


function haveRoles(req, roles, anyOrAll) {

    var session = sessionHandler.getSession(req);
    if (!session) {
        return false;
    }
    let userId = sessionHandler.getSession(req).userId;

    if(!sessionHandler.getSession(req).roles) {
        sessionHandler.getSession(req).roles=db.getRoles(userId);
    }
 
    let userRoles=sessionHandler.getSession(req).roles;
    let match = {};

    userRoles.forEach(r => {
        match[r.roleid.toUpperCase()] = 1;
    });

    for (i in roles) {
        let role = roles[i].toUpperCase();
        if (anyOrAll.toUpperCase() === "ALL") {
            if (match[role] === undefined) {
                return false;
            }
        } else {
            if (match[role] !== undefined) {
                return true;
            }
        }
    }
    if (anyOrAll.toUpperCase() === "ALL") {
        return true;
    } else {
        return false;
    }
 
}





module.exports = {
    init: init,
    getSession: getSession,
    haveRoles: haveRoles
}