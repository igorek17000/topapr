import { Request } from "express";
import jwt from "jsonwebtoken";
import dbConn from "../db";

export const decodeToken = async (req: Request) => {
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
};
