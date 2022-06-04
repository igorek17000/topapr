// Bismillaahirrahmaanirrahiim

import puppeteer = require("puppeteer");
import { dbConn, db } from "../db";
import { chainExplorer } from "./chainExplorer";

const device = puppeteer.devices["iPad Pro landscape"];

(async () => {
  const query = `select pair from ${db}.farms where pool='PancakeSwap'`;

  // console.log(query);
  const pairs: any = await new Promise((res, rej) => {
    dbConn.query(query, function (err, result) {
      if (err) return rej(err);
      return res(result);
    });
  });

  const tokens = [
    ...new Set(
      pairs.reduce((res, pair) => {
        const tokenPair = pair.pair.split("-");
        console.log(tokenPair);

        return [...res, ...tokenPair];
      }, [])
    ),
  ]
    .filter((token) => token !== "BNB")
    .map((token) => `"${token}"`);

  const newTokensQuery = `
    SELECT *
    FROM
      JSON_TABLE(
        '[${tokens}]',
        "$[*]"
        COLUMNS(
          name VARCHAR(45) PATH "$"
        )
      ) data
    where not exists (
      select 1 from ${db}.tokens where data.name = tokens.name and tokens.network = 'BSC'
    )
  `;

  const newTokens: any = await new Promise((res, rej) => {
    dbConn.query(newTokensQuery, function (err, result) {
      if (err) return rej(err);
      return res(result);
    });
  });

  console.log(newTokens);

  if (newTokens.length > 0) {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ["--start-maximized"],
    });
    const page = await browser.newPage();
    await page.emulate(device);
    console.log("Go to pancake swap page...");
    await page.goto("https://pancakeswap.finance/farms", {
      waitUntil: "networkidle2",
      timeout: 90000,
    });

    console.log("Wait for ten seconds...");
    // await page.waitForTimeout(10000);

    var tokenAddresses = [];

    for (const token of newTokens) {
      const input = await page.$("input[placeholder='Search Farms']");
      input.click({ clickCount: 3 });
      await page.waitForTimeout(1000);
      await page.keyboard.type(
        token.name === "BNB" ? "-BNB" : `${token.name}-`
      );
      await page.waitForTimeout(1000);

      // Remove background image
      await page.waitForXPath(
        "/html/body/div[1]/div[1]/div[3]/div/div[2]/div[2]/div/div[1]/table/tbody/tr[1]/td[1]/div/div/div/div/div[1]/div/div[2]"
      );
      const [backImg] = await page.$x(
        "/html/body/div[1]/div[1]/div[3]/div/div[2]/div[2]/div/div[1]/table/tbody/tr[1]/td[1]/div/div/div/div/div[1]/div/div[2]"
      );
      if (backImg) {
        const backImgClass = await backImg.evaluate((el) =>
          el.getAttribute("class")
        );
        if (backImgClass !== "") {
          await backImg.evaluate((el) => {
            el.innerHTML = "";
            el.setAttribute("class", "");
          });
          await page.waitForTimeout(2000);
        }
      }

      // Get Image
      const [img] = await page.$x(
        "/html/body/div[1]/div[1]/div[3]/div/div[2]/div[2]/div/div[1]/table/tbody/tr[1]/td[1]/div/div/div/div/div[1]/div/div[1]/img"
      );
      if (img) {
        const tokenCa = (await img.evaluate((el) => el.getAttribute("src")))
          .replace("/images/tokens/", "")
          .replace(".png", "");
        tokenAddresses = [
          ...tokenAddresses,
          {
            name: token.name,
            address: tokenCa,
          },
        ];

        const imgClass = await img.evaluate((el) => el.getAttribute("class"));
        if (imgClass !== "") {
          await img.evaluate((el) => {
            el.setAttribute("class", "");
            el.parentElement.setAttribute("class", "");
          });
          await page.waitForTimeout(2000);
        }

        img.screenshot({
          path: `C:\\Users\\cakia\\dev\\topapr\\front\\public\\token\\${token.name}.png`,
          type: "png",
          omitBackground: true,
          captureBeyondViewport: false,
        });
        console.log("tokenCa", tokenCa);
      } else {
        console.log("no image found");
      }
    }

    console.log(tokenAddresses);
    await chainExplorer(page, tokenAddresses, "BSC");
    await browser.close();
  }
  process.exit();
})();
