const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const antibotbrowser = require("antibotbrowser");
// Add Stealth Plugin


(async () => {
  // Launch a non-headless browser
  const pathToExtension = require('path').join(__dirname, 'CapSolver.Browser.Extension');

  // const browser = await puppeteer.launch({
  //   headless: false,
  //   args: [
  //     `--disable-extensions-except=${pathToExtension}`,
  //     `--load-extension=${pathToExtension}`,
  //   ],
  //  // executablePath: executablePath()
  // });

  // Open a new page
  // const page = await browser.newPage();

  // // Anonymize User-Agent
  // await page.evaluateOnNewDocument(() => {
  //   Object.defineProperty(navigator, 'userAgent', {
  //     get: () => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36'
  //   });
  // });

  // Authenticate with a username and password
  // await page.authenticate({
  //   username: 'irawangr',
  //   password: '9668c3-3d7f35-5cb48e-5136a9-4d5fd9'
  // });

  // Navigate to a website

  const antibrowser = await antibotbrowser.startbrowser();  

  const browser = await puppeteer.connect({browserWSEndpoint: antibrowser.websokcet, headless: false});

 // Normal use from now on
  const page = await browser.newPage();    

  await page.setViewport({width:0, height:0});

  //page.goto("https://google.com")
  await page.goto('https://testnet.pryzm.zone/faucet');

  await page.waitForTimeout(100000)

  // Perform other actions on the page as needed

  // Close the browser manually when you're done
  // await browser.close();
})();
