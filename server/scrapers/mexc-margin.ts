import puppeteer = require("puppeteer");
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

  console.log("Go to mexc-margin page...");
  await page.goto("https://www.mexc.com/markets/margin", {
    waitUntil: "networkidle2",
  });

  // console.log("Wait for 5 seconds...");
  // await page.waitForTimeout(5000);

  // const content = await page.content();
  // console.log(content);

  const mainInfo = await getContent(page);

  const [innovationButton] = await page.$x(
    "/html/body/div[1]/div[2]/div[2]/div[2]/div[1]/div[1]/div[2]"
  );
  await innovationButton.click();
  await page.waitForXPath(
    "/html/body/div[1]/div[2]/div[2]/div[2]/div[2]/div/div[2]/div[7]/span[1]",
    { timeout: 10000, visible: true }
  );
  await page.waitForTimeout(1000);

  const innovationInfo = await getContent(page);

  const [assessmentButton] = await page.$x(
    "/html/body/div[1]/div[2]/div[2]/div[2]/div[1]/div[1]/div[3]"
  );
  await assessmentButton.click();
  await page.waitForXPath(
    "/html/body/div[1]/div[2]/div[2]/div[2]/div[2]/div/div[2]/div[7]/span[1]",
    { timeout: 10000, visible: true }
  );
  await page.waitForTimeout(2000);

  const assessmentInfo = await getContent(page);

  const info = [...mainInfo, ...innovationInfo, ...assessmentInfo];

  const queryValues: string = info.reduce((prev, obj) => {
    const token = obj.token || obj.pair.replaceAll("/USDT", "");

    return `${prev}
    (${dbConn.escape(token)}, ${dbConn.escape(obj.tokenName)}, ${dbConn.escape(
      obj.pair
    )}, ${dbConn.escape(obj.leverageLimit)}, ${dbConn.escape(obj.desc)}, ${
      obj.tokenAmount
    }),`;
  }, "");

  const query = `insert into sql3476271.mexc values ${queryValues.slice(
    0,
    queryValues.length - 2
  )};`;

  // console.log(info);
  // console.log(query);

  const queryRes = await new Promise((res, rej) => {
    dbConn.query(query, function (err, result) {
      if (err) return rej(err);
      return res(result);
    });
  });

  await browser.close();
  console.log("finish", queryRes);
  process.exit();
})();

const getContent = async (page) => {
  const marketList = await page.$$('div[class^="marketList_tableRow"]');
  const infoButtons = await page.$x('//span[contains(., "Info")]');
  const tokenInfo = [];

  for (const infoButton of infoButtons) {
    if (infoButton) {
      await infoButton.click();
      await page.waitForTimeout(300);
      await page.waitForXPath(
        "/html/body/div[4]/div/div[2]/div/div/div[2]/div/div[2]",
        { timeout: 10000, visible: true }
      );
      await page.waitForTimeout(500);

      const infoBody = await page.$('div[class="ant-drawer-body"] > div');
      const info = await infoBody.evaluate((el) => {
        return {
          token: el.childNodes[1].childNodes[1].textContent,
          tokenAmount: parseInt(
            el.childNodes[5].childNodes[1].textContent.replaceAll(",", ""),
            10
          ),
          desc: el.lastChild.textContent,
        };
      });
      tokenInfo.push(info);

      const [closeButton] = await page.$$('button[class="ant-drawer-close"]');
      if (closeButton) {
        await closeButton.click();
        await page.waitForTimeout(400);
      }
    } else {
      console.log("Button not found");
    }
  }

  // console.log(tokenInfo);

  const pairName = await Promise.all(
    marketList.map(async (tab, idx) => {
      return tab.evaluate((el) => {
        return {
          pair: el.firstChild.firstChild.childNodes[2].firstChild.childNodes[0]
            .textContent,
          leverageLimit:
            el.firstChild.firstChild.childNodes[2].firstChild.childNodes[1]
              .textContent,
          tokenName:
            el.firstChild.firstChild.childNodes[2].childNodes[1].textContent,
        };
      });
    })
  );

  const info = pairName.map((pair, idx) => ({
    ...(tokenInfo[idx] || {}),
    ...pair,
  }));

  // console.log(info);

  return info;
};
