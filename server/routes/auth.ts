import { Request, Response } from "express";
import dbConn from "../db";

var express = require("express");
var router = express.Router();
const crypto = require("crypto");

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

export default router;
