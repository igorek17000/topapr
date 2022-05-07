// Bismillahirrahmaanirraahiim

import { Request, Response } from "express";
import cors from "cors";

import { dbConn } from "../db";

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

router.get("/hedge", async (req: Request, res: Response): Promise<Response> => {
  const {
    itemsPerPage,
    limit,
    sortBy,
    pairTextFilter,
    checkedPools,
    checkedChains,
  } = await prepareReq(req);

  const query = `select farms.* from farms left join mexc on farms.pair like concat('%',mexc.token,'%') and mexc.token not in ('AVAX', 'USDC', 'BNB', 'SOL', 'RAY') ${checkedPools} ${checkedChains} ${pairTextFilter} and token is not null group by pair order by ${sortBy} limit ${limit},${itemsPerPage}`;

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

const prepareReq = async (req: Request) => {
  const itemsPerPage = 20;
  const page = parseInt((req.query.p as any) || "1", 10) || 1;
  const limit = (page - 1) * itemsPerPage;

  const sortBy = (() => {
    if (req.query.sort === "Name") return "pair";
    if (req.query.sort === "Total value") return "totalValue desc";
    return "apr desc";
  })();

  const pairAlphanum = req.query.q
    ? (req.query.q as string).replace(/[\W_]+/g, " ").trim()
    : "";
  const pairTextFilter = pairAlphanum
    ? `and pair like '%${pairAlphanum}%'`
    : "";

  const checkedPools = `where pool in ${(() => {
    if (!req.query.pools) return "('')";
    return `(${req.query.pools
      .toString()
      .split(",")
      .reduce((prev, pool) => {
        return `${prev}${prev ? "," : ""}'${pool}'`;
      }, "")})`;
  })()}`;
  // console.log("checkedPools", checkedPools);

  const checkedChains = `and network in ${(() => {
    if (!req.query.chains) return "('')";
    return `(${req.query.chains
      .toString()
      .split(",")
      .reduce((prev, chain) => {
        return `${prev}${prev ? "," : ""}'${chain}'`;
      }, "")})`;
  })()}`;
  // console.log("checkedChains", checkedChains);

  return {
    itemsPerPage,
    limit,
    sortBy,
    pairTextFilter,
    checkedPools,
    checkedChains,
  };
};

export default router;
