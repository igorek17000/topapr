import puppeteer = require("puppeteer");
import { dbConn, db } from "../db";

const device = puppeteer.devices["iPad Pro landscape"];

(async () => {
  const browser = await puppeteer.launch({
    // headless: false,
  });
  const page = await browser.newPage();
  await page.emulate(device);

  console.log("Go to mdex page...");
  await page.goto("https://mdex.co/#/liquidity?lang=en", {
    waitUntil: "networkidle2",
  });

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
  // console.log(pairName);

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
  // console.log(pairValue);

  const tablePairApr = await page.$$(
    "table > tbody > tr > td:nth-child(5) > div > div > span"
  );
  const pairApr = await Promise.all(
    tablePairApr.map((tab) =>
      tab.evaluate((el) => parseFloat(el.textContent.trim()))
    )
  );
  // console.log(pairApr);

  const farmVal = pairName.map((name, idx) => ({
    name,
    apr: pairApr[idx],
    totalValue: pairValue[idx],
  }));
  console.log(farmVal);

  const insertValRaw = farmVal.reduce((prev, farm) => {
    return `${prev}
      (${dbConn.escape(farm.name)}, 'Mdex-Heco', 'Heco', ${farm.apr}, ${
      farm.totalValue
    }, null, NOW(), NOW()),`;
  }, "");
  const insertVal = insertValRaw.slice(0, insertValRaw.length - 1);

  const query = `insert into ${db}.farms values ${insertVal} on DUPLICATE KEY UPDATE apr = VALUES(apr), totalValue = VALUES(totalValue), multiplier = VALUES(multiplier), updatedAt = NOW();`;

  // console.log(query);
  await new Promise((res, rej) => {
    dbConn.query(query, function (err, result) {
      if (err) return rej(err);
      return res(result);
    });
  });

  await browser.close();
  process.exit();
})();
