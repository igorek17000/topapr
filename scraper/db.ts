// Bismillaahirrahmaanirrahiim

import mysql from "mysql";
const dbConfig = require("./db.config.local");

// Create a connection to the database
const connection = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  dateStrings: true,
});

export const dbConn = connection;
export const db = dbConfig.DB;

const dbConfigLocal = require("./db.config.local");

const localConnection = mysql.createPool({
  host: dbConfigLocal.HOST,
  user: dbConfigLocal.USER,
  password: dbConfigLocal.PASSWORD,
  database: dbConfigLocal.DB,
  dateStrings: true,
});

export const dbConnLocal = localConnection;
export const dbLocal = dbConfigLocal.DB;
