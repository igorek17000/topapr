// Bismillaahirrahmaanirrahiim

import puppeteer = require("puppeteer");
import dappeteer = require("@chainsafe/dappeteer");
import { dbConn } from "../db";
import { bscscan_snowtrace } from "./bscscan_snowtrace";

const device = puppeteer.devices["iPad Pro landscape"];

(async () => {
  const query = `select pair from topapr.farms where pool='Mdex-BSC'`;

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
      select 1 from tokens where data.name = tokens.name and tokens.network = 'BSC'
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
    await page.goto("https://bsc.mdex.co/#/swap?lang=en", {
      waitUntil: "networkidle2",
    });

    await page.waitForXPath(
      "/html/body/div/div/div[2]/div[4]/div[2]/div[1]/div[1]/div/div/button"
    );
    const [button] = await page.$x(
      "/html/body/div/div/div[2]/div[4]/div[2]/div[1]/div[1]/div/div/button"
    );
    button.click();

    await page.waitForSelector(
      "input[placeholder='Search name or paste address']"
    );
    var tokenAddresses = [];

    for (const token of newTokens) {
      const input = await page.$(
        "input[placeholder='Search name or paste address']"
      );
      input.click({ clickCount: 3 });
      await page.waitForTimeout(1000);
      await page.keyboard.type(token.name);
      await page.waitForTimeout(1000);

      await page.waitForXPath(
        "/html/body/reach-portal[1]/div[3]/div/div/div/div/div[3]/div[1]/div/div/div/img"
      );
      const [img] = await page.$x(
        "/html/body/reach-portal[1]/div[3]/div/div/div/div/div[3]/div[1]/div/div/div/img"
      );

      // Get Image
      if (img) {
        await page.evaluate(async () => {
          const selectors = Array.from(document.querySelectorAll("img"));
          await Promise.all(
            selectors.map((img) => {
              if (img.complete) return;
              return new Promise((resolve, reject) => {
                img.addEventListener("load", resolve);
                img.addEventListener("error", reject);
              });
            })
          );
        });

        const tokenCa = (await img.evaluate((el) => el.getAttribute("src")))
          .replace("https://mdex.co/token-icons/bsc/", "")
          .replace(".png", "");
        tokenAddresses = [
          ...tokenAddresses,
          {
            name: token.name,
            address: tokenCa,
          },
        ];

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
    await page.waitForTimeout(1000);

    console.log(tokenAddresses);
    await bscscan_snowtrace(page, tokenAddresses, true);
    await browser.close();
  }
  process.exit();
})();
