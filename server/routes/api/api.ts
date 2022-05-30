// Bismillaahirrahmaanirrahiim

import { Request, Response } from "express";
import { dbConn } from "../../db";
import { prepareReq } from "../../tools/prepareReq";

export default async (req: Request, res: Response): Promise<Response> => {
  const {
    itemsPerPage,
    limit,
    sortBy,
    pairTextFilter,
    checkedPools,
    checkedChains,
  } = await prepareReq(req);

  const query = `
    select q.*, p.cnt from (
      select pair, max(apr) as apr, max(totalValue) as totalValue, COUNT(pair) as cnt from farms ${checkedPools} ${checkedChains} ${pairTextFilter} group by pair order by ${sortBy} limit ${limit},${itemsPerPage}
    ) p
    left join farms as q on p.pair = q.pair and p.apr = q.apr
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
