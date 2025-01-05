var crypto = require('crypto');
var sqlite3 = require('better-sqlite3');

//var db = new sqlite3(__dirname+'/loginHandler.db');
//db.pragma("foreign_keys = ON");


var db;

function init(dbFile) {
    db = new sqlite3(dbFile);
    db.pragma("foreign_keys = ON");
}

var salt = "nimeproject";


function hashPassword(password) {
    var hash = crypto.createHash('sha256');
    hash.update(password);
    hash.update(salt);
    return hash.digest('hex');
}

function authenticateUser(username, password, callback = console.log) {
    var hashed = hashPassword(password);
    const row = db.prepare("select * from v_userinfo where (lower(username)=lower(?) or lower(email)=lower(?)) and password=?").get(username, username, hashed);
    if (!row) {
        callback(false);
    } else {
        callback(true, row.userid);
    }
}


function createUser(username, callback = console.log) {
    try {
        const res = db.prepare("insert into users(username) values(?)").run(username);
        callback(true, res.lastInsertRowid, null);
    } catch (err) {
        callback(false, -1, err);
    }

}



function createPassWordResetToken(userId, callback = console.log) {
    var token = new Date().getTime() + "" + Math.floor(Math.random() * Math.floor(1000));
    var sql = "INSERT INTO password_reset_tokens(userid,token) VALUES(?,?)\
    ON CONFLICT(userid) DO UPDATE SET token=excluded.token,created=CURRENT_TIMESTAMP";
    try {
        db.prepare(sql).run(userId, token);
        callback(true, token);
    } catch (err) {
        callback(false, err);
    }
}




function updateUserInfo(userid, userprops, callback = console.log) {
    userprops.userid = userid;
    if (userprops.password) {
        userprops.password = hashPassword(userprops.password);
    } else {
        userprops.password = null;
    }

    let sql = "INSERT INTO userinfo(userid,password,email,phonenr,name) VALUES(@userid,@password,@email,@phonenr,@name)\
        ON CONFLICT(userid) DO UPDATE SET password=coalesce(excluded.password,password),email=excluded.email,phonenr=excluded.phonenr,name=excluded.name";

    try {
        const res = db.prepare(sql).run(userprops);
        callback(true, null);
    } catch (err) {
        callback(false, err);
    }
}



function getUserInfo(userId, callback = console.log) {
    const row = db.prepare('SELECT * FROM v_userinfo WHERE userid = ?').get(userId);


    if (row !== undefined) {
        delete row.password;
        row.roles = getRoles(userId).map(r => (r.roleid));
        callback(true, row);
    } else {
        callback(false);
    }
}


function deleteUser(userId, callback = console.log) {
    let sql = "delete from users where id = ?";
    try {
        const res = db.prepare(sql).run(userId);
        callback(true, null);
    } catch (err) {
        callback(false, err);
    }

}

function getUsers(callback = console.log) {
    const rows = db.prepare('SELECT * FROM v_userinfo order by username').all();


    if (rows !== undefined) {
        rows.forEach(r => {
            delete r.password;
        })
        callback(true, rows);
    } else {
        callback(false);
    }
}


function getAllRoles(callback = console.log) {
    const rows = db.prepare('SELECT * FROM roles').all();
    callback(true, rows);

}




function updateRoles(userId, roles, callback = console.log) {
    let sql = `delete from user_roles where userid=?`;

    try {
        db.transaction(() => {
            let sql = `delete from user_roles where userid=?`;
            db.prepare(sql).run(userId);
            sql = "insert into user_roles(userid,roleid) values(?,?)"
            let ps = db.prepare(sql);
            roles.forEach(r => {
                ps.run(userId, r);
            });
            callback(true);
        })();

    } catch (err) {
        callback(false, err);

    }
}





function getRoles(userId) {
    return db.prepare('SELECT * FROM user_roles WHERE userid = ?').all(userId);

}


function getUserInfoByUserNameOrEmailOrPhone(identity, callback = console.log) {

    const row = db.prepare('SELECT distinct * FROM v_userinfo WHERE lower(username)=lower(?) or lower(email) = lower(?) or phonenr=?').get(identity, identity, identity);
    if (row !== undefined) {
        delete row.password;
        callback(true, row);
    } else {
        callback(false);
    }

}


function resetPassword(token, password, callback = console.log) {
    try {
        db.transaction(() => {
            var sql = "select userid from password_reset_tokens where token=?";
            var row = db.prepare(sql).get(token);
            if (row !== undefined) {
                var userid = row.userid;
                password = hashPassword(password);
                sql = "update userinfo set password=? where userid=?";
                db.prepare(sql).run(password, userid);
                sql = "delete from password_reset_tokens where token=?";
                db.prepare(sql).run(token);
                callback(true, userid);
            } else {
                callback(false);
            }

        })();
    } catch (err) {
        callback(false, err);
    }
}


function getDbInstance() {
    return db;
}

module.exports = {
    init: init,
    createUser: createUser,
    deleteUser: deleteUser,
    authenticateUser: authenticateUser,
    updateUserInfo: updateUserInfo,
    getUserInfo: getUserInfo,
    resetPassword: resetPassword,
    getDbInstance: getDbInstance,
    updateRoles: updateRoles,
    getRoles: getRoles,
    createPassWordResetToken: createPassWordResetToken,
    getUserInfoByUserNameOrEmailOrPhone: getUserInfoByUserNameOrEmailOrPhone,
    getUsers: getUsers,
    getAllRoles: getAllRoles
}