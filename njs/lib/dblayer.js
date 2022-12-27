//////////////////////////////////////////////////
// DB Layer for the Talkbox DHS app.


const repl = require('repl');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:', sqlite3.OPEN_CREATE);


// User table:
// Username, Name, credentials (pwd), last login, teamid, admin flag
//
// Translations table:
// TranslationID, username, source language, target language, audio filepath, original text, translated text, ticketid
//
// Tickets table:
// TicketID, TranslationID (list), list of comments
//
db.serialize(() => {
    db.run("CREATE TABLE lorem (info TEXT)");

    const stmt = db.prepare("INSERT INTO lorem VALUES (?)");
    for (let i = 0; i < 10; i++) {
        stmt.run("Ipsum " + i);
    }
    stmt.finalize();

    db.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
        console.log(row.id + ": " + row.info);
    });
});

function helloDb() {
    console.log("Hello from the DB Layer");
}

const local = repl.start(">>");

// Example of an IIFE
(() => {
    console.log("test IIFE");
})();

local.on('exit', () => {
    console.log("Exiting dblayer repl.");
    db.close();
    process.exit();
});

exports.helloDb = helloDb;

// db.close();
