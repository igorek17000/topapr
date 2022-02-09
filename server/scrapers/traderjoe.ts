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

  console.log("Go to Trader Joe page...");
  await page.goto("https://traderjoexyz.com/farm", {
    waitUntil: "networkidle2",
  });

  await page.waitForTimeout(2000);
  await page.waitForNetworkIdle({
    timeout: 10000,
  });

  const farmVal = await loopPagination(page, []);
  console.log(farmVal);

  const insertValRaw = farmVal.reduce((prev, farm) => {
    return `${prev}
      (${dbConn.escape(farm.visualName)}, 'TraderJoe', 'Avalanche', ${
      farm.apr
    }, ${farm.totalValue}, null, NOW(), NOW()),`;
  }, "");
  const insertVal = insertValRaw.slice(0, insertValRaw.length - 1);

  const query = `insert into topapr.farms values ${insertVal} as new
  on DUPLICATE KEY UPDATE apr = new.apr, totalValue = new.totalValue, multiplier = new.multiplier, updatedAt = NOW();
  `;

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

async function loopPagination(
  page: puppeteer.Page,
  res: {
    name: string;
    apr: number;
    totalValue: number;
  }[]
) {
  const [xpathHandle] = await page.$x(
    "/html/body/div/div/div[3]/div[3]/div[3]/div[2]/div"
  );

  const elHandles = await xpathHandle.$$("a");

  const data = (
    await Promise.all(
      elHandles.map((elhandle) =>
        elhandle.evaluate((el) => ({
          name: el.firstChild.firstChild.lastChild.textContent
            .toUpperCase()
            .replaceAll(".", "")
            .trim(),
          apr: parseFloat(
            el.children[1].children[4].textContent.replaceAll("%", "").trim()
          ),
          totalValue: parseInt(
            el.children[1].children[3].textContent
              .replaceAll(",", "")
              .replaceAll("$", "")
              .trim(),
            10
          ),
        }))
      )
    )
  )
    .filter((pair) => pair.name.includes("-"))
    .map((pair) => {
      const pairSplit = pair.name.split("-");
      const firstToken = pairSplit[0];
      const secondToken = pairSplit[1];

      if (firstToken === "AVAX") {
        return {
          ...pair,
          name: `${secondToken}-${firstToken}`,
          visualName: pair.name,
        };
      } else {
        return {
          ...pair,
          visualName: pair.name,
        };
      }
    });

  const nextPage = await page.$(
    'button[aria-label="Go to next page"]:not([class~="Mui-disabled"])'
  );
  if (nextPage) {
    nextPage.click();
    await page.waitForTimeout(1000);
    await page.waitForNetworkIdle({
      timeout: 10000,
    });
    console.log("sini");
    await page.waitForTimeout(1000);
    return await loopPagination(page, [...res, ...data]);
  } else {
    return [...res, ...data];
  }
}
