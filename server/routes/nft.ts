// Bismillaahirrahmaanirrahiim

import Moralis from "moralis/node";
import cors from "cors";

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
        return res.status(200).send({
          nfts: nfts.result,
        });
      }
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
