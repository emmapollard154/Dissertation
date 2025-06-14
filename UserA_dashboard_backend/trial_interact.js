const sqlite3 = require('sqlite3').verbose();

function insertExtraData(db, url, time) {
    const stmt = db.prepare('INSERT INTO browsingHistory (url, time) VALUES (?, ?)');
    stmt.run(url, time);
    stmt.finalize(() => {
        console.log('Additional data inserted from trial_interact.js.');
    });
}

module.exports = {
    insertExtraData
};