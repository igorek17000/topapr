// Bismillaahirrahmaanirrahiim

import { Request, Response } from "express";
import { db, dbConn } from "../../db";
import { prepareReq } from "../../tools/prepareReq";
import jwt from "jsonwebtoken";
import "dotenv/config";

export default async (req: Request, res: Response): Promise<Response> => {
  const {
    itemsPerPage,
    limit,
    sortBy,
    pairTextFilter,
    checkedPools,
    checkedChains,
  } = await prepareReq(req.body);

  const query = (() => {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ") &&
      req.body.starred
    ) {
      const decoded = jwt.verify(
        req.headers.authorization.replace("Bearer ", ""),
        process.env.SECRET_KEY
      );

      const uid = decoded.address;
      if (decoded && uid) {
        return `
          SELECT m.* FROM ${db}.starred as n left join ${db}.farms as m
          on n.pair = m.pair
          and n.pool = m.pool
          and n.network = m.network
          ${checkedPools} ${checkedChains} ${pairTextFilter}
          and userid = ${dbConn.escape(uid)}
          order by ${sortBy} limit ${limit},${itemsPerPage}        
        `;
      }
    }

    if (req.body.starred) return undefined;

    return `
      select m.* from ${db}.farms as m ${checkedPools} ${checkedChains} ${pairTextFilter} order by ${sortBy} limit ${limit},${itemsPerPage}
    `;
  })();

  // console.log(query);
  if (query) {
    const queryRes = await new Promise((res, rej) => {
      dbConn.query(query, function (err, result) {
        if (err) return rej(err);
        return res(result);
      });
    });

    return res.status(200).send({
      queryRes,
    });
  } else {
    return res.status(200).send({});
  }
};
