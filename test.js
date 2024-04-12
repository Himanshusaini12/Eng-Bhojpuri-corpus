const puppeteer = require('puppeteer');
const faker = require('faker');

(async () => {
    const pathToExtension = require('path').join(__dirname, 'CapSolver.Browser.Extension');

    const browser = await puppeteer.launch({
        headless: "new",
        args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
        '--no-sandbox', '--window-size=1400,800'
        ],
    // executablePath: executablePath()
    });
  const page = await browser.newPage();
  
  // Navigate to the URL
  await page.goto('https://giveaway.proxyjet.io/ref/65fc0b9dd3473M');

  // Wait for the form to load
  await page.waitForSelector('.form-signup__inner');

  // Generate random details
  const randomName = faker.name.findName();
  const randomEmail = faker.internet.email();
  const randomPhoneNumber = faker.phone.phoneNumber();
  const randomSocialChannel = faker.random.arrayElement(['Facebook', 'LinkedIn', 'Telegram', 'Discord', 'WhatsApp', 'Skype']);
  const randomSocialID = faker.internet.userName();

  // Fill the form with random details
  await page.type('input[name="txt_name"]', randomName);
  await page.type('input[name="txt_email"]', randomEmail);
  await page.type('input[name="PhoneNumber"]', randomPhoneNumber);
  await page.select('select[name="SocialChannel"]', randomSocialChannel);
  await page.type('input[name="SocialID"]', randomSocialID);
  await page.click('input[name="upv_form_170618260338565_terms_condition"]'); // Check terms and conditions

  // Submit the form
  await page.click('#lead_button');

  // Optional: You can add further actions here, like waiting for a confirmation message or navigating to another page
  
  // Close the browser
  //await browser.close();
})();
