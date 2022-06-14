


var sessions=[];

function addSession(req,res,userId) {
    var sessionID="S"+new Date().getTime() + "" + Math.floor(Math.random() * Math.floor(1000));
    res.cookie('LoginHandler-SessId',sessionID, { maxAge: maxAge*1000});
    sessions[sessionID]={
        userId:userId,
        timestamp:new Date()
    };
}

function getSession(req) {
    var sessionID = req.cookies?req.cookies['LoginHandler-SessId']:null;
    if(sessions[sessionID]) {
        sessions[sessionID].timestamp=new Date();
    }
    return sessions[sessionID];
}

function invalidateSession(req,res) {
    res.clearCookie('LoginHandler-SessId');
    var sessionID = ['LoginHandler-SessId'];
    delete sessions[sessionID];
}

function purge() {
    var now=new Date();
    sessions=sessions.filter(s=> (now-s.timestamp)<maxAge*1000);
}

var maxAge=5*60*60; //age in seconds
var intervalTimer=setInterval(purge,maxAge*1000);
function setPurgeIntervall(seconds) {
    clearInterval(intervalTimer);
    intervalTimer=setInterval(purge,seconds*1000);
}


var saveSql="insert into saved_sessions(key,timestamp,userid) values(@key,@timestamp,@userId)";

function saveSessions(db) {
    let stmt=db.prepare(saveSql);
    Object.keys(sessions).forEach(k=>{
        let o=sessions[k];
        o["key"]=k;
        o["timestamp"]=o["timestamp"].toISOString();
        stmt.run(o);
    });
}

var getSql="select key,timestamp,userId from saved_sessions";
function resumeSessions(db) {
    const rows=db.prepare(getSql).all();
    rows.forEach(r=>{
        sessions[r.key]={
            timestamp:new Date(r.timestamp),
            userId:r.userId
        }
    });
    db.prepare("delete from saved_sessions").run();

}

module.exports={
    addSession:addSession,
    getSession:getSession,
    invalidateSession:invalidateSession,
    setPurgeIntervall:setPurgeIntervall,
    saveSessions:saveSessions,
    resumeSessions:resumeSessions
}
