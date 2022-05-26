// Bismillaahirrahmaanirrahiim

import puppeteer = require("puppeteer");
import { dbConn, db } from "../db";
import { chainExplorer } from "./chainExplorer";
import { solanaExplorer } from "./solanaExplorer";

const device = puppeteer.devices["iPad Pro landscape"];

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--start-maximized"],
  });
  const page = await browser.newPage();
  await page.emulate(device);

  const chains = ["BSC", "Avalanche", "Heco", "Solana"];

  for (const chain of chains) {
    const chainPriceQuery = `SELECT name, address FROM ${db}.tokens where price != 0 and network = '${chain}' and DATE_ADD(updatedAt, INTERVAL 12 HOUR) < NOW();`;
    const chainPriceTokens: any = await new Promise((res, rej) => {
      dbConn.query(chainPriceQuery, function (err, result) {
        if (err) return rej(err);
        return res(result);
      });
    });
    console.log(chainPriceQuery);

    if (chainPriceTokens.length > 0) {
      if (chain === "Solana") {
        await solanaExplorer(page, chainPriceTokens);
      } else {
        await chainExplorer(page, chainPriceTokens, chain);
      }
    }

    const chainNoPriceQuery = `SELECT name, address FROM ${db}.tokens where price = 0 and network = '${chain}' and DATE_ADD(updatedAt, INTERVAL 72 HOUR) < NOW();`;
    const chainNoPriceTokens: any = await new Promise((res, rej) => {
      dbConn.query(chainNoPriceQuery, function (err, result) {
        if (err) return rej(err);
        return res(result);
      });
    });

    if (chainNoPriceTokens.length > 0) {
      if (chain === "Solana") {
        await solanaExplorer(page, chainNoPriceTokens);
      } else {
        await chainExplorer(page, chainNoPriceTokens, chain);
      }
    }
  }

  await browser.close();
  process.exit();
})();
