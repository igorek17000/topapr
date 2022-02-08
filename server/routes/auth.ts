import { Request, Response } from "express";
import { ethers } from "ethers";
import Moralis from "moralis/node";
import admin from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

import dbConn from "../db";

var express = require("express");
var router = express.Router();
const crypto = require("crypto");

var serviceAccount = require("../private.json");
initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://top-apr-default-rtdb.asia-southeast1.firebasedatabase.app/",
});

const serverUrl = "https://cfrj4efwe4ue.usemoralis.com:2053/server";
const appId = "COE2RmzQBrMy1CNJR0Qaw70r5np2YTKrFyYu14r8";
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
      INSERT INTO topapr.users VALUES(
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
      SELECT nonce from topapr.users where id = ${dbConn.escape(reqAddress)};
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
          `Sign In to TopAPR.com \n Sign ID: ${nonce}`,
          req.params.signature
        )
        .toLowerCase();

      if (reqAddress !== address) return res.status(401).send("Unauthorized");

      const nfts = await Moralis.Web3API.account.getNFTsForContract({
        chain: "bsc testnet",
        address,
        token_address: "0x5481307Ebc228f8B791b7b684cAaA6F9e781ddD9",
      });

      return getAuth()
        .createCustomToken(address, { isHavingNft: !!nfts.total })
        .then((customToken) => {
          console.log("token created", customToken);
          return res.status(200).send({
            customToken,
          });
        })
        .catch((error) => {
          console.log("Error creating custom token:", error);
          return res.status(500);
        });
    } catch {
      return res.status(401).send("Unauthorized");
    }
  }
);

export default router;
