// Bismillaahirrahmaanirrahiim

import { Request, Response } from "express";
import { db, dbConn } from "../../db";

export default async (req: Request, res: Response): Promise<Response> => {
  const query = `
    SELECT apr,totalValue,date FROM ${db}.aprhistory
    where pair = ${dbConn.escape(req.query.pair)} 
    and date >= date(now() - interval 30 day);
  `;

  // console.log(query);
  const queryRes = await new Promise((res, rej) => {
    dbConn.query(query, function (err, result) {
      if (err) return rej(err);
      return res(result);
    });
  });

  return res.status(200).send({ queryRes });
};
