const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    try {
        const pathToExtension = require('path').join(__dirname, 'CapSolver.Browser.Extension');

        const browser = await puppeteer.launch({
            headless: false,
            args: [
                `--disable-extensions-except=${pathToExtension}`,
                `--load-extension=${pathToExtension}`,
                '--no-sandbox', '--window-size=1400,800'
            ],
        });

        const page = await browser.newPage();

        // Navigate to the URL
        await page.goto('https://restaurantguru.com/cajun-United-States-c13/1', { waitUntil: 'domcontentloaded' });

        // Wait for the restaurant cards to load
        await page.waitForSelector('.restaurant_row', { timeout: 120000 });

        // Get the links to each restaurant
        const restaurantLinks = await page.$$eval('.restaurant_row', links => links.map(link => link.querySelector('.title_url').getAttribute('href')));

        // Array to store restaurant data
        const restaurantData = [];

        // Process all links concurrently
        const promises = restaurantLinks.map(async (link) => {
            try {
                const newPage = await browser.newPage();
                await newPage.goto(link, { waitUntil: 'domcontentloaded' });
                // Wait for the title and contact information to load   
                await newPage.waitForSelector('.title_container .notranslate',{ timeout: 120000 });
                await newPage.waitForSelector('.buttons_wrapper');
                await newPage.waitForSelector('.cuisine_wrapper');
                await newPage.waitForSelector('.address'); // Wait for the address to load

                // Check if CAPTCHA page is present
                const captchaExists = await newPage.$('.contact_form .form_header');
                if (captchaExists) {
                    await page.waitForTimeout(20000);
                    // If CAPTCHA page exists, click the "Send" button
                    await newPage.click('.contact_form input[type="submit"]');
                }

                // Extract the title
                const title = (await newPage.$eval('.title_container .notranslate', title => title.textContent.trim().replace(/\s+/g, ' '))) || '';

                // Extract the phone number
                const phoneNumber = (await newPage.$eval('.buttons_wrapper .call-write__wrap .call', call => call.getAttribute('href'))) || '';

                // Extract the full address
                const fullAddressElement = await newPage.$('.address');
                const fullAddressText = await newPage.evaluate(address => address.textContent.trim().replace(/\s+/g, ' '), fullAddressElement);

                // Extract the website
                const website = (await newPage.$eval('.website a', website => website.textContent.trim().replace(/\s+/g, ' '))) || '';

                // Extract social media handle (Instagram)
                const socialMediaHandle = (await newPage.$eval('.instagram .insta_btn', insta => insta.textContent.trim().replace(/\s+/g, ' '))) || '';

                // Extract cuisine
                const cuisine = (await newPage.$eval('.cuisine_wrapper', cuisine => cuisine.textContent.trim().replace(/\s+/g, ' '))) || '';

                // Push data to array
                restaurantData.push({
                    title,
                    phoneNumber,
                    fullAddressText,
                    website,
                    socialMediaHandle,
                    cuisine
                });

                // Close the new page
                await newPage.close();
            } catch (error) {
                console.error('Error occurred while processing a restaurant:', error);
            }
        });

        // Wait for all promises to resolve
        await Promise.all(promises);

        // Write data to JSON file
        fs.writeFileSync('restaurantData.json', JSON.stringify(restaurantData, null, 2));

        // Close the browser
        await browser.close();
    } catch (error) {
        console.error('Error occurred:', error);
    }
})();
