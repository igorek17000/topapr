import { Request, Response } from "express";

import dbConn from "../db";

var express = require("express");
var router = express.Router();
const crypto = require("crypto");

router.get("/", async (req: Request, res: Response): Promise<Response> => {
  console.log(req.query);

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
  const pairFilter = pairAlphanum ? `where pair like '%${pairAlphanum}%'` : "";

  const query = `select * from topapr.farms ${pairFilter} group by pair order by ${sortBy} limit ${limit},${itemsPerPage}`;
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

export default router;
