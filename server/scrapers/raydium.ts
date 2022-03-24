import puppeteer = require("puppeteer");
import dbConn from "../db";

const device = puppeteer.devices["iPad Pro landscape"];

(async () => {
  const browser = await puppeteer.launch({
    // headless: false,
    defaultViewport: null,
    args: ["--start-maximized"],
  });
  const page = await browser.newPage();
  await page.emulate(device);

  console.log("Go to raydium page...");
  await page.goto("https://v1.raydium.io/farms/", {
    waitUntil: "networkidle2",
    timeout: 180000,
  });

  await page.waitForXPath(
    "/html/body/div[1]/div/section/main/div/div[3]/div/div/div[2]",
    { timeout: 90000 }
  );

  const elHandles = await page.$$(
    'div[class="ant-collapse-item"][role="tablist"]'
  );
  const farmVal = (
    await Promise.all(
      elHandles.map((elHandle) =>
        elHandle.evaluate((el) => ({
          isVisible: !el.getAttribute("style"),
          name: el.firstChild.lastChild.firstChild.textContent
            .replaceAll("\n", "")
            .replaceAll("DUAL YIELD", "")
            .replaceAll("LP", "")
            .replaceAll("$", "")
            .toUpperCase()
            .trim(),
          apr: parseFloat(
            el.firstChild.lastChild.childNodes[4].textContent
              .replaceAll("Total Apr  \n", "")
              .replaceAll("%", "")
              .trim()
          ),
          totalValue: parseInt(
            el.firstChild.lastChild.childNodes[6].textContent
              .replace("TVL \n", "")
              .replaceAll(",", "")
              .replaceAll("$", "")
              .trim(),
            10
          ),
        }))
      )
    )
  ).filter((val) => val.isVisible && val.apr);

  console.log(farmVal);
  const insertValRaw = farmVal.reduce((prev, farm) => {
    return `${prev}
      (${dbConn.escape(farm.name)}, 'Raydium', 'Solana', ${farm.apr}, ${
      farm.totalValue
    }, null, NOW(), NOW()),`;
  }, "");
  const insertVal = insertValRaw.slice(0, insertValRaw.length - 1);

  const query = `insert into sql3476271.farms values ${insertVal} on DUPLICATE KEY UPDATE apr = apr, totalValue = totalValue, multiplier = multiplier, updatedAt = NOW();`;

  // console.log(query);
  await new Promise((res, rej) => {
    dbConn.query(query, function (err, result) {
      if (err) return rej(err);
      return res(result);
    });
  });

  await browser.close();
  console.log("finish");
  process.exit();
})();
