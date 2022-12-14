/**
 * Use this to create, populate or otherwise inspect an sqlite3 database.
 *
 * node dblayer.js should bring up a repl with some exported methods.
 *
 */
const sqlite3 = require('sqlite3').verbose();
const repl = require('node:repl');
const fs = require('fs');

// Ref: https://www.digitalocean.com/community/tutorials/how-to-read-and-write-csv-files-in-node-js-using-node-csv
const { parse } = require('csv-parse');

const DB_NAME = "temp1.sq";

// Have to use sqlite3.OPEN_READWRITE in tandem with sqlite3.OPEN_CREATE, otherwise we get an 
// API error.
function openDb(dbName) {
    const db = new sqlite3.Database(DB_NAME, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the database.');
    });
    return db;
}

let db = openDb(DB_NAME);
db.on('error', err => {
    console.log(err);
    process.exit(-1);
});

db.on('trace', sql => {
    console.log(sql);
});


/**
 * Returns a Promise.
 */
function dropTableIfExists(tablename) {
    console.log(`Dropping table if exists ${tablename}`);
    return new Promise((resolve, reject) => {
        db.run(`DROP TABLE IF EXISTS ${tablename}`,
            [ ],
            err => {
                if (err) reject(err);
                else resolve();
            })
    });
}

function createUserTable() {
    console.log("Creating user table");
    const user_table_sql =
        "CREATE TABLE IF NOT EXISTS Users (UserName VARCHAR(255)," +
        "Name VARCHAR(255), " +
        "Cred VARCHAR(255), " +
        "LastLogin TEXT DEFAULT CURRENT_TIMESTAMP," +
        "TeamId SMALLINT(255)," +
        "Admin BIT(1))";

    return new Promise((resolve, reject) => {
        db.run(user_table_sql,
            [ ],
            err => {
                console.log(err);
                if (err) reject(err);
                else resolve();
            })
    });
}

async function loadUserTable(filename) {
    const user_table_sql =
        "CREATE TABLE Users (UserName varchar(255)," +
        "Name VARCHAR(255), " +
        "Cred VARCHAR(255)," +
        "LastLogin DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," +
        "TeamId VARCHAR(255)," +
        "Admin BIT(1))";

    await dropTableIfExists("Users");

    await createUserTable();

    //var stmt = db.prepare("INSERT INTO Users VALUES (?,?,?,?,?,?)");

    const parser = fs.createReadStream(filename)
        .pipe(parse({ delimiter: ",", from_line: 2 }));

    for await (const row of parser) {
        console.log(row);
        await new Promise((resolve, reject) => {
            let isAdmin = row[5].toLowerCase() === 'true';
            db.run('INSERT INTO Users (UserName, Name, Cred, TeamId, Admin) VALUES (?, ?, ?, ?, ?)',
                row[0], row[1], row[2], row[4], isAdmin, err => {
                    if (err) {
                        console.error(err);
                    }
                    resolve();
                });
        });
    }

}

function createTicketsTable() {
    console.log("Creating Tickets table");
    const tickets_table_sql = 
            "CREATE TABLE Tickets (TicketId VARCHAR(255)," +
            "TranslationIdVARCHAR(255)," +
            "CreationDate DATETIME DEFAULT CURRENT_TIMESTAMP," +
            "LastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP," +
            "CorrectSrcLangText VARCHAR(3000)," +
            "CorrectTargetLangText VARCHAR(3000)," +
            "CommentsJson VARCHAR(5000))";

    return new Promise((resolve, reject) => {
        db.run(tickets_table_sql,
            [ ],
            err => {
                console.log(err);
                if (err) reject(err);
                else resolve();
            })
    });
}

function createTranslationsTable() {
    console.log("Creating translations table");
    const trans_table_sql = 
            "CREATE TABLE Translations (TranslationId VARCHAR(255)," +
            "UserName VARCHAR(255)," +
            "SrcLang VARCHAR(255)," +
            "TargetLang VARCHAR(255)," +
            "AudioFilePath VARCHAR(3000)," +
            "SrcLangText VARCHAR(3000)," +
            "TargetLangText VARCHAR(3000)," +
            "DeviceName VARCHAR(255)," +
            "TicketId INT(255))";

    return new Promise((resolve, reject) => {
        db.run(trans_table_sql,
            [ ],
            err => {
                console.log(err);
                if (err) reject(err);
                else resolve();
            })
    });
}

async function loadTranslationsTable(filename) {
    await dropTableIfExists("Translations");

    await createTranslationsTable();

    const parser = fs.createReadStream(filename)
        .pipe(parse({ delimiter: ",", from_line: 2 }));

    for await (const row of parser) {
        console.log(row);
        await new Promise((resolve, reject) => {
            db.run('INSERT INTO Translations (TranslationId, UserName, SrcLang, TargetLang, AudioFilePath, SrcLangText, TargetLangText, DeviceName, TicketId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                row, err => {
                    if (err) {
                        console.error(err);
                    }
                    resolve();
                });
        });
    }

}

function dumpUsersTable() {
    db.all('SELECT UserName username, Name name, Cred cred, TeamId teamid, Admin admin FROM Users', [], (err, rows) => {
        if (err) {
            console.log(err);
        } else {
            rows.forEach( (row) => console.log(row.name));
        }
    });
}

function dumpDb() {
    db.all("SELECT name FROM sqlite_schema WHERE type ='table' AND name NOT LIKE 'sqlite_%';", function(err, rows) {
        rows.forEach(function (row) {
            console.log(row.first_name, row.last_name);
        })
	});
}


async function loadAllTables() {
    await loadUserTable("lib/users.csv");
    await loadTranslationsTable("lib/translations.csv");
}

console.log("Creating Users db");

loadAllTables().finally(() => db.close());


console.log("Closing DB");
// db.close();

/*

const local = repl.start({
    prompt: ">> ",
    useGlobal: true
});

// Expose variables
local.context.openDb = openDb;
local.context.dumpDb = dumpDb;
local.context.dumpUsersTable = dumpUsersTable;
local.context.sqlite3 = sqlite3;
local.context.loadFromFile = loadUserTable;

local.on('exit', () => {
    console.log("Exiting dblayer repl.");
    db.close();
    process.exit();
});

*/

/** Random code
 *
    db.serialize( () => {
        db.run(`DROP TABLE IF EXISTS ${tablename}`)
            .run(user_table_sql);
    }

    .on("data", function (row) {
            console.log(row);
        })
        .on("end", function () {
            console.log("finished");
        })
        .on("error", function (error) {
            console.log(error.message);
        });

 */
