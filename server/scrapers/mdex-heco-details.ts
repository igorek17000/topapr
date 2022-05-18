// Bismillaahirrahmaanirrahiim

import puppeteer = require("puppeteer");
import { dbConn } from "../db";
import { chainExplorer } from "./chainExplorer";

const device = puppeteer.devices["iPad Pro landscape"];

(async () => {
  const query = `select pair from topapr.farms where pool='Mdex-Heco'`;

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
      select 1 from tokens where data.name = tokens.name and tokens.network = 'Heco'
    )
  `;

  const newTokens: any = (
    (await new Promise((res, rej) => {
      dbConn.query(newTokensQuery, function (err, result) {
        if (err) return rej(err);
        return res(result);
      });
    })) as any
  ).filter((token) => token.name !== "ETH");

  console.log(newTokens);

  if (newTokens.length > 0) {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();
    await page.emulate(device);

    console.log("Go to mdex page...");
    await page.goto("https://ht.mdex.co/#/swap?lang=en", {
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

        const tokenCa = await (async () => {
          if (token.name === "WHT")
            return "0x5545153CCFcA01fbd7Dd11C0b23ba694D9509A6F";
          if (token.name === "HUSD")
            return "0x0298c2b32eaE4da002a15f36fdf7615BEa3DA047";
          if (token.name === "HBTC")
            return "0x66a79D23E58475D2738179Ca52cd0b41d73f0BEa";
          if (token.name === "HBCH")
            return "0xeF3CEBD77E0C52cb6f60875d9306397B5Caca375";
          if (token.name === "HDOT")
            return "0xA2c49cEe16a5E5bDEFDe931107dc1fae9f7773E3";
          if (token.name === "HFIL")
            return "0xae3a768f9aB104c69A7CD6041fE16fFa235d1810";
          if (token.name === "HLTC")
            return "0xecb56cf772B5c9A6907FB7d32387Da2fCbfB63b4";
          return (await img.evaluate((el) => el.getAttribute("src")))
            .replace("https://mdex.co/token-icons/heco/", "")
            .replace(".png", "");
        })();
        tokenAddresses = [
          ...tokenAddresses,
          {
            name: token.name,
            address: tokenCa,
          },
        ];

        img.screenshot({
          path: `C:\\Users\\cakia\\dev\\topapr\\front\\public\\token2\\${token.name}.png`,
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
    await chainExplorer(page, tokenAddresses, "Heco");
    await browser.close();
  }
  process.exit();
})();
