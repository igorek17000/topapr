import puppeteer = require("puppeteer");
import fs = require("fs");
import dbConn from "../db";

const device = puppeteer.devices["iPad Pro landscape"];

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--start-maximized"],
  });
  const page = await browser.newPage();
  await page.emulate(device);

  console.log("Go to coingecko page...");
  await page.goto("https://www.coingecko.com/", {
    waitUntil: "domcontentloaded",
    // timeout: 60000,
  });
  console.log("sini");
  await page.waitForTimeout(5000);

  const query = `select pair from farms`;

  // console.log(query);
  const farms: any = await new Promise((res, rej) => {
    dbConn.query(query, function (err, result) {
      if (err) return rej(err);
      return res(result);
    });
  });

  const tokens: string[] = farms.reduce((prev, val) => {
    const tokenArr = (val.pair as string).split("-");

    return [...new Set([...prev, tokenArr[0], tokenArr[1]])];
  }, []);

  for (const token of tokens) {
    console.log("token", token);
    const [div] = await page.$x(
      "/html/body/div[1]/div[3]/div[3]/div[2]/div[5]/div/div/div"
    );
    // console.log("div", div);
    const tokenFirst = token.substring(0, token.length - 1);
    if (div) {
      div.click();
      await page.waitForSelector(
        "input[placeholder='Search token name or exchange']"
      );
      // console.log("tokenFirst", tokenFirst);
      await page.evaluate((tokenFirst) => {
        const inputEl = document.querySelector(
          "input[placeholder='Search token name or exchange']"
        );
        if (inputEl) {
          (inputEl as any).value = tokenFirst;
        }
      }, tokenFirst);
      await page.keyboard.press("ArrowRight");
      const tokenLast = token.substring(token.length - 1, token.length);
      // console.log("tokenLast", tokenLast);
      await page.keyboard.press(tokenLast as puppeteer.KeyInput);
      await page.waitForTimeout(3000);

      const ul = await page.$("ul[class='list-reset relevant-results']");
      if (ul) {
        const li = await ul.$("li");
        if (li) {
          const img = await li.$("img");
          if (img) {
            await img.screenshot({
              path: `C:\\Users\\cakia\\dev\\topapr\\server\\tokenImg\\${token}.png`,
              omitBackground: true,
            });
          }
        }
      }
    }
  }

  console.log("finish", tokens);
  await browser.close();
  process.exit();
})();
