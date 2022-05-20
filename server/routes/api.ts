// Bismillaahirrahmaanirrahiim

import { Request, Response } from "express";
import cors from "cors";

import { dbConn } from "../db";
import { prepareReq } from "../tools/prepareReq";

var express = require("express");
var router = express.Router();

router.use(cors());

router.get("/", async (req: Request, res: Response): Promise<Response> => {
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
});

router.get(
  "/pairdetails",
  async (req: Request, res: Response): Promise<Response> => {
    const tokens = req.query.pair
      .toString()
      .split("-")
      .map((token) => dbConn.escape(token))
      .join(",");
    const network = req.query.network.toString();

    const query = `select * from tokens where network = ${dbConn.escape(
      network
    )} and name in (${tokens})`;

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
  }
);

export default router;
