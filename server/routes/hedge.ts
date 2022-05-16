// Bismillaahirrahmaanirrahiim

import { Request, Response } from "express";
import cors from "cors";
import Moralis from "moralis/node";

import { dbConn } from "../db";
import { prepareReq } from "../tools/prepareReq";

var express = require("express");
var router = express.Router();

router.use(cors());

const serverUrl = "https://lw8kzegmn3yu.usemoralis.com:2053/server";
const appId = "qX3uMKoeAqQHspXFNvk4DWvgtjWEtrbrsM8z8C4g";
Moralis.start({ serverUrl, appId });

router.get("/", async (req: Request, res: Response): Promise<Response> => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    const authData = req.headers.authorization
      .replace("Bearer ", "")
      .split(":");
    const uid = authData[0];
    if (uid) {
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
        } = await prepareReq(req);

        const query = `
    select q.*, p.cnt from (
      select pair, max(apr) as apr, max(totalValue) as totalValue, COUNT(pair) as cnt from farms inner join mexc on pair like concat(mexc.token, '-%') or pair like concat('%-', mexc.token) ${checkedPools} ${checkedChains} ${pairTextFilter} group by pair order by ${sortBy} limit ${limit},${itemsPerPage}
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
      }
    }
  }

  return res.status(200).send({});
});

export default router;
