// Bismillaahirrahmaanirrahiim

import { Request, Response } from "express";
import cors from "cors";
import Moralis from "moralis/node";
import jwt from "jsonwebtoken";
import "dotenv/config";

import { dbConn } from "../db";
import { prepareReq } from "../tools/prepareReq";

var express = require("express");
var router = express.Router();

router.use(cors());

const serverUrl = "https://lw8kzegmn3yu.usemoralis.com:2053/server";
const appId = "qX3uMKoeAqQHspXFNvk4DWvgtjWEtrbrsM8z8C4g";
Moralis.start({ serverUrl, appId });

router.post("/", async (req: Request, res: Response): Promise<Response> => {
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
        const nfts = await Moralis.Web3API.account.getNFTsForContract({
          chain: "bsc",
          address: uid,
          token_address: "0xdA3d65F55338974dDa06B8EF4CAcaCc5D1AfFEd7",
        });

        if (nfts.total > 0) {
          const {
            itemsPerPage,
            limit,
            sortBy,
            pairTextFilter,
            checkedPools,
            checkedChains,
          } = await prepareReq(req.body);

          const query = !req.body.starred
            ? `
              select m.* from farms as m
              ${checkedPools} ${checkedChains} ${pairTextFilter}
              and substring_index(m.pair, '-', 1) in (select token from mexclite)
              and substring_index(m.pair, '-', -1) in (select token from mexclite)
              order by ${sortBy} limit ${limit},${itemsPerPage}
            `
            : `
            select m.* FROM starred as n
              left join farms as m
                on n.pair = m.pair
                and n.pool = m.pool
                and n.network = m.network
            ${checkedPools} ${checkedChains} ${pairTextFilter}
            and substring_index(m.pair, '-', 1) in (select token from mexclite)
            and substring_index(m.pair, '-', -1) in (select token from mexclite)
            and n.userid = ${dbConn.escape(uid)}
            order by ${sortBy} limit ${limit},${itemsPerPage}      
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
        }
      }
    } catch {
      return res.status(401).send("Unauthorized");
    }
  }

  return res.status(401).send("Unauthorized");
});

export default router;
