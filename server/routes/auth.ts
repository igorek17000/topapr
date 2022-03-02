import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ethers } from "ethers";
import Moralis from "moralis/node";
import cors from "cors";

import dbConn from "../db";

var express = require("express");
var router = express.Router();
const crypto = require("crypto");
router.use(cors());

const serverUrl = "https://lw8kzegmn3yu.usemoralis.com:2053/server";
const appId = "qX3uMKoeAqQHspXFNvk4DWvgtjWEtrbrsM8z8C4g";
Moralis.start({ serverUrl, appId });

router.get("/", async (req, res) => {
  return res.status(200).send({
    message: "Auth Connected",
  });
});

router.get(
  "/sign/:address",
  async (req: Request, res: Response): Promise<Response> => {
    const reqAddress = req.params.address.toLowerCase();
    const nonce = crypto.randomBytes(16).toString("base64");

    const query = `
      INSERT INTO users VALUES(
        ${dbConn.escape(reqAddress)}, ${dbConn.escape(nonce)}, now(), now()
      ) ON DUPLICATE KEY UPDATE nonce = ${dbConn.escape(
        nonce
      )}, updatedAt = now();
    `;
    const queryRes = await new Promise((res, rej) => {
      dbConn.query(query, function (err, result) {
        if (err) return rej(err);
        return res(result);
      });
    });

    return res.status(200).send({
      address: reqAddress,
      nonce,
      queryRes,
    });
  }
);

router.get(
  "/verify/:address/:signature",
  async (req: Request, res: Response): Promise<Response> => {
    const reqAddress = req.params.address.toLowerCase();

    const getNonceQuery = `
      SELECT nonce from users where id = ${dbConn.escape(reqAddress)};
    `;
    const nonceQueryRes: any = await new Promise((res, rej) => {
      dbConn.query(getNonceQuery, function (err, result) {
        if (err) return rej(err);
        return res(result);
      });
    });

    if (nonceQueryRes.length < 1) return res.status(401).send("Unauthorized");

    const nonce = nonceQueryRes[0].nonce;
    try {
      const address = await ethers.utils
        .verifyMessage(
          `Sign In to TopAPR.com\nSign ID: ${nonce}`,
          req.params.signature
        )
        .toLowerCase();

      if (reqAddress !== address) return res.status(401).send("Unauthorized");

      const nfts = await Moralis.Web3API.account.getNFTsForContract({
        chain: "bsc",
        address,
        token_address: "0xdA3d65F55338974dDa06B8EF4CAcaCc5D1AfFEd7",
      });

      jwt.sign(
        { isHavingNft: !!nfts.total },
        nonce,
        function (err, customToken) {
          if (customToken) {
            return res.status(200).send({
              customToken,
            });
          }

          return res.status(401).send("Unauthorized");
        }
      );
    } catch {
      return res.status(401).send("Unauthorized");
    }
  }
);

export default router;
