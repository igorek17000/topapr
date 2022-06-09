// Bismillaahirrahmaanirrahiim

import Moralis from "moralis/node";
import cors from "cors";
import jwt from "jsonwebtoken";
import "dotenv/config";

var express = require("express");
var router = express.Router();
router.use(cors());

const serverUrl = "https://lw8kzegmn3yu.usemoralis.com:2053/server";
const appId = "qX3uMKoeAqQHspXFNvk4DWvgtjWEtrbrsM8z8C4g";
Moralis.start({ serverUrl, appId });

router.get("/", async (req, res) => {
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
          return res.status(200).send({
            nfts: nfts.result,
          });
        }
      }
    } catch {
      return res.status(401).send("Unauthorized");
    }
  }

  return res.status(200).send({});
});

router.get("/price", async (req, res) => {
  const cakiaPrice = await Moralis.Web3API.token.getTokenPrice({
    chain: "bsc",
    address: "0x248b291290796c5743814bD18cAE46D37268E17d",
  });

  return res.status(200).send({
    cakiaPrice,
  });
});

export default router;
