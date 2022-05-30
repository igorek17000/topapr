// Bismillaahirrahmaanirrahiim

import { Request, Response } from "express";
import Moralis from "moralis/node";
import { dbConn, db } from "../../db";

const serverUrl = "https://lw8kzegmn3yu.usemoralis.com:2053/server";
const appId = "qX3uMKoeAqQHspXFNvk4DWvgtjWEtrbrsM8z8C4g";
Moralis.start({ serverUrl, appId });

export default async (req: Request, res: Response): Promise<Response> => {
  const tokenName = req.query.token.toString();
  const network = req.query.network.toString();

  const query = `select tokens.*, tp.price as tpxprice, tp.openprice as tpxopenprice, tp.openpricedate as tpxopenpricedate,
    (DATE_ADD(tp.updatedAt, INTERVAL 5 MINUTE) < NOW()) as tpxneedupdate,
    tp.updatedAt as tpxupdatedAt, CURDATE() as tpxnow 
    from tokens left join tokenprice as tp on tokens.address = tp.address and tokens.network = tp.network 
    where tokens.name = ${dbConn.escape(
      tokenName
    )} and tokens.network = ${dbConn.escape(network)};`;

  // console.log(query);
  const queryRes: any = await new Promise((res, rej) => {
    dbConn.query(query, function (err, result) {
      if (err) return rej(err);
      return res(result);
    });
  });

  if (queryRes.length > 0) {
    const tokenRes = [];
    for (const token of queryRes) {
      // console.log(token);
      var tokenBase = Object.keys(token)
        .filter((key) => !key.includes("tpx"))
        .reduce((obj, key) => {
          obj[key] = token[key];
          return obj;
        }, {});

      if (
        token.network === "BSC" &&
        (token.tpxneedupdate === 1 || token.tpxneedupdate === null)
      ) {
        const price = await Moralis.Web3API.token.getTokenPrice({
          chain: "bsc",
          address: token.address,
        });

        tokenBase = {
          ...tokenBase,
          price: price.usdPrice,
        };

        const insertHistoryQuery = `insert ignore into ${db}.tokenhistory values (${dbConn.escape(
          token.address
        )}, 'BSC', NOW(), ${price.usdPrice});`;

        // console.log(insertHistoryQuery);
        await new Promise((res, rej) => {
          dbConn.query(insertHistoryQuery, function (err, result) {
            if (err) return rej(err);
            return res(result);
          });
        });

        const insertQuery = `insert into ${db}.tokenprice values (${dbConn.escape(
          token.address
        )}, 'BSC', ${
          price.usdPrice
        }, null, NOW(), null) on DUPLICATE KEY UPDATE price = ${
          price.usdPrice
        }, updatedAt = NOW();`;

        // console.log(insertQuery);
        await new Promise((res, rej) => {
          dbConn.query(insertQuery, function (err, result) {
            if (err) return rej(err);
            return res(result);
          });
        });

        const dateNow = token.tpxnow;
        const openpriceNeedUpdate = (() => {
          if (token.tpxopenpricedate === null) return true;

          const openpriceStr = token.tpxopenpricedate.split(" ")[0];
          if (openpriceStr === dateNow) return false;

          return true;
        })();

        if (openpriceNeedUpdate) {
          const block = await Moralis.Web3API.native.getDateToBlock({
            chain: "bsc",
            date: dateNow,
          });
          // console.log("block", block);
          const todayPrice = await Moralis.Web3API.token.getTokenPrice({
            chain: "bsc",
            address: token.address,
            to_block: block.block,
          });
          // console.log("todayPrice", todayPrice);

          if (todayPrice.usdPrice) {
            const priceChangePct =
              ((price.usdPrice - todayPrice.usdPrice) / todayPrice.usdPrice) *
              100;

            tokenBase = {
              ...tokenBase,
              pricechange: priceChangePct,
            };

            const insertOpenHistoryQuery = `insert ignore into ${db}.tokenhistory values (${dbConn.escape(
              token.address
            )}, 'BSC', '${dateNow}', ${todayPrice.usdPrice});`;

            // console.log(insertOpenHistoryQuery);
            await new Promise((res, rej) => {
              dbConn.query(insertOpenHistoryQuery, function (err, result) {
                if (err) return rej(err);
                return res(result);
              });
            });

            const updateQuery = `update ${db}.tokenprice
              set openprice = ${todayPrice.usdPrice}, openpricedate = '${dateNow}'
              where address = '${token.address}' and network = 'BSC';`;

            // console.log(updateQuery);
            await new Promise((res, rej) => {
              dbConn.query(updateQuery, function (err, result) {
                if (err) return rej(err);
                return res(result);
              });
            });
          }
        } else {
          const priceChangePct =
            ((price.usdPrice - token.tpxopenprice) / token.tpxopenprice) * 100;

          tokenBase = {
            ...tokenBase,
            pricechange: priceChangePct,
          };
        }
      } else if (token.network === "BSC") {
        tokenBase = {
          ...tokenBase,
          price: token.tpxprice,
          pricechange:
            ((token.tpxprice - token.tpxopenprice) / token.tpxopenprice) * 100,
        };
      }

      // console.log("tokenBase", tokenBase);
      tokenRes.push(tokenBase);
    }
    return res.status(200).send({
      queryRes: tokenRes,
    });
  } else {
    return res.status(200).send({
      queryRes,
    });
  }
};
