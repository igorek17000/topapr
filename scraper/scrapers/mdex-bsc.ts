// Bismillaahirrahmaanirrahiim

import puppeteer = require("puppeteer");
import dappeteer = require("@chainsafe/dappeteer");
import { dbConn, db } from "../db";
import { dbConnLocal, dbLocal } from "../db";
import { aprToApy } from "../tools/aprToApy";

const device = puppeteer.devices["iPad Pro landscape"];

async function main() {
  const browser = await dappeteer.launch(puppeteer, {
    metamaskVersion: "v10.8.1",
  });
  const metamask = await dappeteer.setupMetamask(browser);

  await metamask.addNetwork({
    networkName: "bsc",
    rpc: "https://bsc-dataseed1.ninicoin.io/",
    chainId: 0x38,
  });
  await metamask.switchNetwork("bsc");

  const page = await browser.newPage();
  await page.emulate(device);
  console.log("Go to mdex page...");
  await page.goto("https://mdex.co/#/liquidity?lang=en", {});

  console.log("Wait for 5 seconds...");
  await page.waitForTimeout(5000);

  // const content = await page.content();
  // console.log(content);

  const tablePairName = await page.$$(
    "table > tbody > tr > td:nth-child(1) > div > div > div > span"
  );
  const pairName = await Promise.all(
    tablePairName.map((tab) =>
      tab.evaluate((el) => el.textContent.trim().replace("/", "-"))
    )
  );
  console.log(pairName);

  const tablePairValue = await page.$$(
    "table > tbody > tr > td:nth-child(4) > div > span"
  );
  const pairValue = await Promise.all(
    tablePairValue.map((tab) =>
      tab.evaluate((el) => {
        const txtVal = el.textContent.trim().replace("$ ", "");
        if (txtVal.endsWith("M")) {
          return parseFloat(txtVal.replace(" M", "")) * 1000000;
        }

        if (txtVal.endsWith("B")) {
          return parseFloat(txtVal.replace(" B", "")) * 1000000000;
        }

        return parseFloat(txtVal.replace(",", ""));
      })
    )
  );
  console.log(pairValue);

  const tablePairApr = await page.$$(
    "table > tbody > tr > td:nth-child(5) > div > div > span"
  );
  const pairApr = await Promise.all(
    tablePairApr.map((tab) =>
      tab.evaluate((el) => parseFloat(el.textContent.replace(",", "").trim()))
    )
  );
  console.log(pairApr);

  const farmVal = pairName
    .map((name, idx) => ({
      name,
      apr: pairApr[idx],
      apy: aprToApy(pairApr[idx]),
      totalValue: pairValue[idx],
    }))
    .filter((farm) => farm.apr > 0);
  console.log(farmVal);

  const insertValRaw = farmVal.reduce((prev, farm) => {
    return `${prev}
      (${dbConn.escape(farm.name)}, 'Mdex', 'BSC', ${farm.apr}, ${farm.apy}, ${
      farm.totalValue
    }, null, NOW(), NOW()),`;
  }, "");
  const insertVal = insertValRaw.slice(0, insertValRaw.length - 1);

  const query = `insert into ${db}.farms values ${insertVal} on DUPLICATE KEY UPDATE apr = VALUES(apr), apy = VALUES(apy), totalValue = VALUES(totalValue), multiplier = VALUES(multiplier), updatedAt = NOW();`;

  // console.log(query);
  await new Promise((res, rej) => {
    dbConn.query(query, function (err, result) {
      if (err) return rej(err);
      return res(result);
    });
  });

  const insertHistoryValRaw = farmVal.reduce((prev, farm) => {
    return `${prev}
      (null, ${dbConn.escape(farm.name)}, 'Mdex', 'BSC', ${farm.apr}, ${
      farm.totalValue
    }, NOW()),`;
  }, "");
  const insertHistoryVal = insertHistoryValRaw.slice(
    0,
    insertHistoryValRaw.length - 1
  );

  const queryHistory = `insert into ${db}.aprhistory values ${insertHistoryVal};`;

  // console.log(queryHistory);
  await new Promise((res, rej) => {
    dbConn.query(queryHistory, function (err, result) {
      if (err) return rej(err);
      return res(result);
    });
  });

  const queryHistoryLocal = `insert into ${dbLocal}.aprhistory values ${insertHistoryVal};`;

  // console.log(queryHistory);
  await new Promise((res, rej) => {
    dbConnLocal.query(queryHistoryLocal, function (err, result) {
      if (err) return rej(err);
      return res(result);
    });
  });

  await browser.close();
  process.exit();
}

main();
