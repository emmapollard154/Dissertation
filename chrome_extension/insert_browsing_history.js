// function insertBrowsingHistory(db, url, time) {
//     const stmt = db.prepare('INSERT INTO browsingHistory (url, time) VALUES (?, ?)');
//     stmt.run(url, time);
//     stmt.finalize(() => {
//         console.log('Additional data inserted from insert_browsing_history.js.');
//     });
// }

// module.exports = {
//     insertBrowsingHistory
// };