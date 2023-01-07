//////////////////////////////////////////////////
// DB Layer for the Talkbox DHS app.


const repl = require('repl');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('temp2.sq', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');

});


// User table:
// Username, Name, credentials (pwd), last login, teamid, admin flag
//
// Translations table:
// TranslationID, username, source language, target language, audio filepath, source language text, target language translated text, ticketid
//
// Tickets table OLD:
// TicketID, TranslationID (list), list of comments
//
// Tickets table NEW:
// CorrectSrcLangText can be NULL
// CorrectTargetLangText can be NULL but one must be non NULL
// TicketID, TranslationID, CreationDate, LastUpdated, CorrectSrcLangText, CorrectTargetLangText, JSON-list of comments
//

function selfDbTest() {
    console.log("Self database test");
    db.serialize(() => {
        db.run("CREATE TABLE IF NOT EXISTS lorem (info TEXT)");

        const stmt = db.prepare("INSERT INTO lorem VALUES (?)");
        for (let i = 0; i < 10; i++) {
            stmt.run("Ipsum " + i);
        }
        stmt.finalize();

        db.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
            console.log(row.id + ": " + row.info);
        });
    });
}

function createTables() {
    // User table:
    db.serialize(() => {
        const user_table_sql =
            "CREATE TABLE Users (UserName varchar(255)," +
            "Name varchar(255), " +
            "Cred varchar(255)," +
            "LastLogin DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," +
            "TeamId SMALLINT(255)," +
            "Admin BIT(1))";

        db.run(user_table_sql);
    });

    // Translations table:
//    db.serialize(() => {
//        const trans_table_sql = 
//            "CREATE TABLE Translations (TranslationId INT(255)," +
//            "UserName varchar(255)," +
//            "SrcLang varchar(255)," +
//            "TargetLang varchar(255)," +
//            "AudioFilePath varchar(3000)," +
//            "SrcLangText varchar(3000)," +
//            "TargetLangText varchar(3000)," +
//            "TicketId INT(255))";
//
//        db.run(trans_table_sql);
//    });
//
//    // Tickets table:
//    db.serialize(() => {
//        const tickets_table_sql =
//            "CREATE TABLE Tickets (TicketId INT(255), " +
//            "TranslationId INT(255), " +
//            "CreationDate DATETIME DEFAULT CURRENT_TIMESTAMP, " + 
//            "LastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, " +
//            "CorrectSrcLangText varchar(3000), " +
//            "CorrectTargetLangText varchar(3000), " +
//            "Comments varchar(10000))";
//        db.run(tickets_table_sql);
//    });
}

function helloDb() {
    console.log("Hello from the DB Layer");
}


async function fetchTranslations(username) {
    let sql = "SELECT TranslationId tid, UserName username, SrcLang srclang, " +
        "TargetLang targetlang, AudioFilePath audiofilepath, SrcLangText srclangtext, " +
        "TargetLangText targetlangtext, DeviceName devicename, TicketId ticketid FROM " +
        " Translations ORDER BY TranslationId";

    await new Promise((resolve, reject) => {
        let output = "";
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error(err);
            }
            rows.forEach((row) => {
                console.log(row);
                output += JSON.stringify(row);
                output += "\n";
            });
        });
        resolve(output);
    });
}

function closeDbLayer() {
    db.close();
}

// Example of an IIFE
(() => {
    console.log("test IIFE");
})();

fetchTranslations("").then(() => console.log("Translations fetched"));

exports.helloDb = helloDb;
exports.createTables = createTables;
exports.fetchTranslations = fetchTranslations;
exports.closeDbLayer = closeDbLayer;

// db.close();
