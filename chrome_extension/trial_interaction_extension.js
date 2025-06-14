function insertExtraDataExtension(db, url, time) {
    const stmt = db.prepare('INSERT INTO browsingHistory (url, time) VALUES (?, ?)');
    stmt.run(url, time);
    stmt.finalize(() => {
        console.log('Additional data inserted from trial_interact_extension.js.');
    });
}

module.exports = {
    insertExtraDataExtension
};