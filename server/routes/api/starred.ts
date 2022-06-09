// Bismillaahirrahmaanirrahiim

import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";

import { db, dbConn } from "../../db";

export default async (req: Request, res: Response): Promise<Response> => {
  // console.log(req.headers);
  // console.log("req.body", req.body);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      const decoded = jwt.verify(
        req.headers.authorization.replace("Bearer ", ""),
        process.env.SECRET_KEY
      );

      const uid = decoded.address;
      if (decoded && uid) {
        if (!req.body.method) {
          const query = `
            SELECT pair,pool,network FROM ${db}.starred
            where userid = ${dbConn.escape(uid)};
        `;

          // console.log(query);
          const queryRes = await new Promise((res, rej) => {
            dbConn.query(query, function (err, result) {
              if (err) return rej(err);
              return res(result);
            });
          });

          return res.status(200).send({ queryRes });
        }

        if (
          req.body.method &&
          req.body.pair &&
          req.body.network &&
          req.body.pool
        ) {
          const query =
            req.body.method === "insert"
              ? `
            replace into ${db}.starred
            values(
              ${dbConn.escape(uid)},
              ${dbConn.escape(req.body.pair)},
              ${dbConn.escape(req.body.pool)},
              ${dbConn.escape(req.body.network)}
            );
            `
              : `
            delete from ${db}.starred where
              userid = ${dbConn.escape(uid)} and
              pair = ${dbConn.escape(req.body.pair)} and
              pool = ${dbConn.escape(req.body.pool)} and
              network = ${dbConn.escape(req.body.network)};
            `;

          await new Promise((res, rej) => {
            dbConn.query(query, function (err, result) {
              if (err) return rej(err);
              return res(result);
            });
          });

          return res.status(200).send({});
        }

        return res.status(401).send("Unauthorized");
      } else {
        return res.status(401).send("Unauthorized");
      }
    } catch {
      return res.status(401).send("Unauthorized");
    }
  }
};
