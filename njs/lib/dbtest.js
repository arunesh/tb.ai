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
    return new Promise((resolve, reject) => {
        db.run(`DROP TABLE IF EXISTS ${tablename}`,
            [ ],
            err => {
                if (err) reject(err);
                else resolve();
            })
    });
}

function loadFromFile(filename, tablename) {

    var stmt = db.prepare("INSERT INTO users VALUES (?,?)");

    fs.createReadStream(filename)
        .pipe(parse({ delimiter: ",", from_line: 2 }))
        .on("data", function (row) {
            console.log(row);
        })
        .on("end", function () {
            console.log("finished");
        })
        .on("error", function (error) {
            console.log(error.message);
        });
}

function dumpDb() {
    db.all("SELECT name FROM sqlite_schema WHERE type ='table' AND name NOT LIKE 'sqlite_%';", function(err, rows) {
        rows.forEach(function (row) {
            console.log(row.first_name, row.last_name);
        })
	});
}

const local = repl.start({
    prompt: ">> ",
    useGlobal: true
});

// Expose variables
local.context.openDb = openDb;
local.context.dumpDb = dumpDb;
local.context.sqlite3 = sqlite3;
local.context.loadFromFile = loadFromFile;

local.on('exit', () => {
    console.log("Exiting dblayer repl.");
    db.close();
    process.exit();
});

