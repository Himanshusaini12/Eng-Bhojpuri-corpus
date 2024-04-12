const puppeteer = require('puppeteer');
const { faker } = require('@faker-js/faker');

(async () => {
    const pathToExtension = require('path').join(__dirname, 'CapSolver.Browser.Extension');
    const numberOfAttempts = 100; // Change this to the number of times you want to repeat the process

    for (let attempt = 0; attempt < numberOfAttempts; attempt++) {
        const browser = await puppeteer.launch({
            headless: false,
            args: [
                `--disable-extensions-except=${pathToExtension}`,
                `--load-extension=${pathToExtension}`,
                '--no-sandbox', '--window-size=1400,800'
            ],
            // executablePath: executablePath()
        });
        const page = await browser.newPage();

        // Navigate to the URL
        await page.goto('https://giveaway.proxyjet.io/ref/65fc0b9dd3473M',{waitUntil:'domcontentloaded'});

        // Wait for the form to load
        await page.waitForSelector('.form-signup__inner');

        // Generate random details
        const randomName = faker.name.fullName();
        const randomEmail = faker.internet.email();
        const randomPhoneNumber = generateRandomPhoneNumber();
        const socialChannels = ['Facebook', 'LinkedIn', 'Telegram', 'Discord', 'WhatsApp', 'Skype'];
        const randomSocialChannel = faker.helpers.arrayElement(socialChannels);
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

        // Wait for a while before closing the browser (optional)
        await page.waitForTimeout(20000); // Adjust the time as needed

        // Close the browser
        await browser.close();
    }
})();

function generateRandomPhoneNumber() {
    const digits = '0123456789';
    let phoneNumber = '+';
    for (let i = 0; i < 10; i++) {
        phoneNumber += digits[Math.floor(Math.random() * 10)];
    }
    return phoneNumber;
}
