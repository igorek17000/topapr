// Bismillaahirrahmaanirrahiim

import { Request, Response } from "express";
import { dbConn } from "../../db";
import { prepareReq } from "../../tools/prepareReq";

export default async (req: Request, res: Response): Promise<Response> => {
  const {
    fromTable,
    itemsPerPage,
    limit,
    sortBy,
    pairTextFilter,
    checkedPools,
    checkedChains,
  } = await prepareReq(req.body);

  const query = `
    select m.* ${fromTable} ${checkedPools} ${checkedChains} ${pairTextFilter} order by ${sortBy} limit ${limit},${itemsPerPage}
  `;

  // console.log(query);
  const queryRes = await new Promise((res, rej) => {
    dbConn.query(query, function (err, result) {
      if (err) return rej(err);
      return res(result);
    });
  });

  return res.status(200).send({
    queryRes,
  });
};
