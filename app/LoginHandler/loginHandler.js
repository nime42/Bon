
const cookieParser = require('cookie-parser');

var sessionHandler = require('./sessionHandler.js');
var db = require('./dbFunctions.js');
const dbFunctions = require('./dbFunctions.js');

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

        if(!checkRoles(req,"${ADMIN}")) {
            res.sendStatus(401);
            return;        
        }

        var username = req.body.username;
        try {
            db.getDbInstance().transaction(() => {
                db.createUser(username, function (status, id, err) {
                    if (status) {
                        db.updateUserInfo(id, req.body, function (status, err) {
                            if (status) {
                                if(req.body.roles) {
                                    db.updateRoles(id,req.body.roles,function(status) {
                                        if(status) {
                                            res.sendStatus(200);
                                        } else {
                                            res.sendStatus(500);
                                            throw "rollback";
                                        }
                                    });
                                } else {
                                    res.sendStatus(200);
                                }
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
                        let bcc=undefined;
                        let subject=forgottenPasswordMailTemplate.subject;
                        let text=body;
                        let html=undefined;


                        mailSender(from,to,cc,bcc,subject,text,html, function(err) {
                            if(err!==null) {
                                console.log(err);
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


        if(req.body.userid) {
            if(req.body.userid!==userId) {
                if(!checkRoles(req,"${ADMIN}")) {
                    res.sendStatus(401);
                    return;        
                } else {
                    userId=req.body.userid;  
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




    app.get("/roles/:id", (req, res) => {
      if (!checkRoles(req, "${ADMIN}")) {
        res.sendStatus(401);
        return;
      }
      let roles = dbFunctions.getRoles(req.params.id);
      res.json(roles);
    });
    

    app.put('/updateRoles/:id', (req, res) => {
        if(!checkRoles(req,"${ADMIN}")) {
            res.sendStatus(401);
            return;        
        }
        let userId=req.params.id;
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



    app.get('/getUsers', (req, res) => {
        if(!checkRoles(req,"${ADMIN}")) {
            res.sendStatus(401);
            return;        
        }
        db.getUsers(function (status, rows) {
            if (status) {
                res.json(rows);
            } else {
                console.log('getusers');
                res.sendStatus(500);

            }
        });

    })    


    app.get('/getAllRoles', (req, res) => {
        if(!checkRoles(req,"${ADMIN}")) {
            res.sendStatus(401);
            return;        
        }
        db.getAllRoles(function (status, rows) {
            if (status) {
                res.json(rows);
            } else {
                console.log('getAllRoles');
                res.sendStatus(500);

            }
        });

    }) 

    app.delete("/user/:id",(req,res) => {

        
        if(!checkRoles(req,"${ADMIN}")) {
            res.sendStatus(401);
            return;        
        }

        db.deleteUser(req.params.id,function(status,err){
            if(status) { 
                res.sendStatus(200);  
     
            } else {
                console.log("deleteUser",err);
                res.sendStatus(500);  
    
            }
        })      
    


    })
}



function getSession(req, roles) {
    return sessionHandler.getSession(req);
}

function isLoggedIn(req) {
    let session=sessionHandler.getSession(req);
    if(session!==undefined) {
        return true;
    }
    return sessionHandler.getSession(req)!==undefined?true:false;
}


function parseBasicAuth(authHeader) {
    try {
        let base64Data=a.match(/Basic (.*)/i)[1];
        let plain=Buffer.from(base64Data, 'base64').toString('utf8');
        
    } catch(err) {
        return null;
    }
}

function checkRoles(req,roleExpr) {
    var session = sessionHandler.getSession(req);
    if (!session) {
        return false;
    }
    let userId = sessionHandler.getSession(req).userId;

    if(!sessionHandler.getSession(req).roles) {
        sessionHandler.getSession(req).roles=db.getRoles(userId);
    }
 
    let userRoles=sessionHandler.getSession(req).roles;

    let expr = roleExpr;
    userRoles && userRoles.forEach(r => {
        expr = expr.replace(new RegExp("\\$\\{ *" + r.roleid + " *\\}"), true);
    })
    expr = expr.replaceAll(new RegExp("\\$\\{[^\\}]*\\}", "g"), false);
    
    return !!(eval(expr == "" || expr));


}



function saveSessions() {
    sessionHandler.saveSessions(db.getDbInstance());
}

function resumeSessions() {
    sessionHandler.resumeSessions(db.getDbInstance());
}

module.exports = {
    init: init,
    getSession: getSession,
    checkRoles:checkRoles,
    isLoggedIn:isLoggedIn,
    saveSessions:saveSessions,
    resumeSessions:resumeSessions
}