import { Request, Response } from "express";

import dbConn from "../db";

var express = require("express");
var router = express.Router();
const crypto = require("crypto");

router.get("/", async (req, res) => {
  return res.status(200).send({
    message: "Api Connected",
  });
});

router.get(
  "/:sortBy/:page",
  async (req: Request, res: Response): Promise<Response> => {
    const sortBy = req.params.sortBy;
    const page = parseInt(req.params.page, 10) || 1;

    const query = `select * from topapr.farms order by ${sortBy} desc limit ${
      (page - 1) * 10
    },10`;
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
);

export default router;
