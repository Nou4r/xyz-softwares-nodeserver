const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const utils = require('./utils');
var md5 = require('md5');

const pool = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "webpanel",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const GetMember = username => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM `users` WHERE `username` = "' + username + '"', (err, results, fields) => {
            if (err) return reject(err);
            if (results.length >= 1) {
                var member = {
                    username: false,
                    password: false,
                    hwid: false,
                    banned: false
                }
                member.username = results[0].username;
                member.password = results[0].password;
                member.hwid = results[0].hwid;
                member.banned = results[0].banned;
                resolve(member);
            } else {
                reject("Unknown user!");
            }
        });
    });
};

const AuthenticateMember = (username, password, hwid) => {
    return new Promise((resolve, reject) => {
        GetMember(username).then(member => {
            if (member.password === md5(password)) {
                if (member.banned !== 1) {
                    if (member.hwid == null || member.hwid.length === 0) {
                        SetHWID(username, hwid);
                    } else if (member.hwid != hwid) {
                        reject("Invalid HWID");
                    }
                    resolve();
                } else {
                    reject("banned")
                }
            }
        }).catch(err => {
            console.log("Invalid creds");
            reject("Invalid credentials");
        });
    });
};

const SetHWID = (username, hwid) => {
    pool.query('UPDATE `users` SET `hwid`="' + hwid + '" WHERE `username`="' + username + '"', (err, results, fields) => {
        if (err) throw err;
    });
}

const CheckProducts = (username) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM subscriptions WHERE `usernameID`="' + username + '"', (err, results, fields) => {
            var i;
            var obj = [];
            for (i = 0; i < results.length; i++) {
                if (results[i].cheatID == "Rust Cheat") {
                    obj.push(results[i].cheatID + ";" + results[i].days + ",")
                }
            }
            if (obj.length > 0) {
                resolve(obj);
            } else {
                reject("Go to store and buy!");
            }
        });
    });
}

const CheatStatus = () => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM cheats', (err, results, fields) => {
            var i;
            for (i = 0; i < results.length; i++) {
                if (results[i].name === "Rust Cheat") {
                    resolve(results[i].secure)
                }
            }
        });
    });
}

const ExpireStatus = (username) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM subscriptions WHERE `usernameID`="' + username + '"', (err, results, fields) => {
            var i;
            for (i = 0; i < results.length; i++) {
                if (results[i].cheatID === "Rust Cheat") {
                    let calcExpire = results[i].days / 24;
                    resolve(calcExpire)
                }
            }
        });
    });
}

module.exports = {
    GetMember: GetMember,
    AuthenticateMember: AuthenticateMember,
    CheckProducts: CheckProducts,
    CheatStatus: CheatStatus,
    ExpireStatus: ExpireStatus,
}