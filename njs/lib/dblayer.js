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
}

function helloDb() {
    console.log("Hello from the DB Layer");
}


/**
 * Returns a Promise which resolves to a list of Translations dict objects.
 */
function fetchTranslations(username) {
    let sql = "SELECT TranslationId tid, UserName username, SrcLang srclang, " +
        "TargetLang targetlang, AudioFilePath audiofilepath, SrcLangText srclangtext, " +
        "TargetLangText targetlangtext, DeviceName devicename, TicketId ticketid FROM " +
        " Translations ORDER BY TranslationId";

    return new Promise((resolve, reject) => {
        let output = "ERROR"; // TODO: Fix this

        // db.all() gets all ROWS.
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error(err);
                resolve(output);
                return;
            }
            output = rows;

            // Resolves the promise and sets the return value.
            console.log("OUTPUT = " + JSON.stringify(rows));
            resolve(output);
        });
    });
}

/**
 * Returns a Promise which resolves to a list of User dict objects.
 */
function fetchUsers() {
    let sql = "SELECT UserName username, Name name, LastLogin lastlogin, " +
        "TeamId teamid, Admin admin FROM Users ORDER BY UserName";

    return new Promise((resolve, reject) => {
        let output = "ERROR"; // TODO: Fix this

        // db.all() gets all ROWS.
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error(err);
                resolve(output);
                return;
            }
            output = rows;
            // Resolves the promise and sets the return value.
            console.log("OUTPUT = " + JSON.stringify(rows));
            resolve(output);
        });

    });
}

function fetchTeams() {
    // We first fetch the list of all users and then compute the many to one relationship to a team.
    let sql = "SELECT UserName username, Name name, LastLogin lastlogin, " +
        "TeamId teamid, Admin admin FROM Users ORDER BY UserName";

    return new Promise((resolve, reject) => {
        let output = "ERROR"; // TODO: Fix this
        let teams = {};

        // db.all() gets all ROWS.
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error(err);
                resolve(output);
                return;
            }
            output = rows;
            rows.forEach((row) => {
                let userid = row['username'];
                let teamid = row['teamid'];
                if (teamid in teams) {
                    teams[teamid] = teams[teamid] + ", " + userid;
                } else {
                    teams[teamid] = userid;
                }
            });
            // Resolves the promise and sets the return value.
            console.log("OUTPUT = " + JSON.stringify(teams));
            resolve(teams);
        });

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
exports.fetchUsers = fetchUsers;
exports.fetchTeams = fetchTeams;
exports.closeDbLayer = closeDbLayer;

// db.close();
