// Bismillaahirrahmaanirrahiim

import mysql from "mysql";
const dbConfig = require("./db.config");

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
