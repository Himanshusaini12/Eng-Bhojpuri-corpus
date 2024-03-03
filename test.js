const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const pathToExtension = require('path').join(__dirname, 'CapSolver.Browser.Extension');

    const browser = await puppeteer.launch({
        headless: false,
        args: [
            `--disable-extensions-except=${pathToExtension}`,
            `--load-extension=${pathToExtension}`,
            '--no-sandbox', '--window-size=1400,800'
        ],
    });

    let scrapedData = []; // Array to store scraped data

    for (let pageNum = 1; pageNum <= 437; pageNum++) { // Scraping first 5 pages, modify as needed
        const page = await browser.newPage();
        const url = `https://restaurantguru.com/cajun-United-States-c13/${pageNum}`;
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        const captchaForm = await page.$('.contact_form.ab_check_form');
        if (captchaForm) {
            console.log('reCAPTCHA challenge detected. Please solve the challenge.');
            await page.waitForTimeout(30000);
            // Implement code to solve reCAPTCHA challenge
            // You may use third-party services or manual interaction here
            // Once the challenge is solved, proceed to click the "Send" button
            await page.click('.btn_wrapper input[type="submit"]');
            console.log('reCAPTCHA challenge solved. Clicked the "Send" button.');
        }

        // Wait for the restaurant cards to load
        await page.waitForSelector('.restaurant_row');

        // Get the links to each restaurant
        const restaurantLinks = await page.$$eval('.restaurant_row', links => links.map(link => link.querySelector('.title_url').getAttribute('href')));

        // Open an incognito context
        const context = await browser.createIncognitoBrowserContext();

        // Process each link in a new page within the incognito context
        const scrapePromises = restaurantLinks.map(async (link) => {
            try {
                const newPage = await context.newPage();
                await newPage.goto(link, { waitUntil: 'domcontentloaded' });

                // Wait for the necessary elements to load
                await newPage.waitForSelector('.title_container .notranslate');
                await newPage.waitForSelector('.buttons_wrapper');
                await newPage.waitForSelector('.cuisine_wrapper');
                await newPage.waitForSelector('.address');

                // Extract data
                const title = (await newPage.$eval('.title_container .notranslate', title => title.textContent.trim().replace(/\s+/g, ' '))) || null;
                const cuisine = (await newPage.$eval('.cuisine_wrapper', cuisine => cuisine.textContent.trim().replace(/\s+/g, ' '))) || null;
                const fullAddressText = (await newPage.$eval('.address', address => address.textContent.trim().replace(/\s+/g, ' '))) || null;
                const websiteElement = await newPage.$('.website a');
                const website = websiteElement ? (await websiteElement.evaluate(website => website.textContent.trim())) : null;
                const socialMediaElement = await newPage.$('.instagram .insta_btn');
                const socialMediaHandle = socialMediaElement ? (await socialMediaElement.evaluate(insta => insta.textContent.trim())) : null;
                const contactInfoElement = await newPage.$('.buttons_wrapper .call-write__wrap .call');
                const contactInfo = contactInfoElement ? await contactInfoElement.evaluate(call => call.getAttribute('href')) : null;

                // Add to scrapedData array
                scrapedData.push({
                    title,
                    cuisine,
                    fullAddressText,
                    website,
                    socialMediaHandle,
                    contactInfo
                });

                await newPage.close();
            } catch (error) {
                console.error('Error during scraping:', error);
            }
        });

        await Promise.all(scrapePromises);
        await page.close();

        // Write scraped data to a JSON file after scraping each page
        const jsonData = JSON.stringify(scrapedData, null, 2);
        fs.writeFileSync(`scraped_data_page_${pageNum}.json`, jsonData);
        console.log(`Scraped data from page ${pageNum} saved to scraped_data_page_${pageNum}.json`);
    }

    await browser.close();

    console.log('Scraping complete!');
})();
