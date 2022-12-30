
const sqlite3 = require('sqlite3').verbose();

const repl = require('node:repl');

const DB_NAME = "temp1.sq";

// Have to use sqlite3.OPEN_READWRITE in tandem with sqlite3.OPEN_CREATE, otherwise we get an 
// API error.
function createDb(dbName) {
    const db = new sqlite3.Database(DB_NAME, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the database.');
    });
}

function dumpDb(dbName) {
    const db = new sqlite3.Database(DB_NAME, sqlite3.OPEN_READ);
}

const local = repl.start({
    prompt: ">> ",
    useGlobal: true
});

// Expose variables
const localVar = 42
local.context.createDb = createDb;
local.context.dumpDb = dumpDb;
local.context.sqlite3 = sqlite3;

local.on('exit', () => {
    console.log("Exiting dblayer repl.");
    db.close();
    process.exit();
});

