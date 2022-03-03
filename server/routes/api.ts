import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import cors from "cors";

import dbConn from "../db";

var express = require("express");
var router = express.Router();
const crypto = require("crypto");

router.use(cors());

router.get("/", async (req: Request, res: Response): Promise<Response> => {
  // console.log(req.query);

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

  const decodeToken = await (async () => {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      const authData = req.headers.authorization
        .replace("Bearer ", "")
        .split(":");
      const uid = authData[0];
      const token = authData[1];

      if (uid && token) {
        const getNonceQuery = `
        SELECT nonce from users where id = ${dbConn.escape(uid)};
      `;
        const nonceQueryRes: any = await new Promise((res, rej) => {
          dbConn.query(getNonceQuery, function (err, result) {
            if (err) return rej(err);
            return res(result);
          });
        });

        if (nonceQueryRes.length < 1) return undefined;

        const nonce = nonceQueryRes[0].nonce;
        const decode = jwt.verify(token, nonce);
        // console.log(decode);
        return decode;
      }

      return undefined;
    } else {
      return undefined;
    }
  })();

  const query = (() => {
    if (decodeToken && decodeToken.isHavingNft && req.query.ih === "true") {
      return `select farms.* from farms left join mexc on farms.pair like concat('%',mexc.token,'%') and mexc.token not in ('AVAX', 'USDC', 'BNB', 'SOL', 'RAY') ${checkedPools} ${checkedChains} ${pairTextFilter} and token is not null group by pair order by ${sortBy} limit ${limit},${itemsPerPage}`;
    }

    return `select * from farms ${checkedPools} ${checkedChains} ${pairTextFilter} group by pair order by ${sortBy} limit ${limit},${itemsPerPage}`;
  })();

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

export default router;
