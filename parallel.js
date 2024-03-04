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

    // Read restaurant links from the JSON file
    const links = JSON.parse(fs.readFileSync('links.json', 'utf8'));

    for (const linkObj of links) {
        const page = await browser.newPage();
        await page.goto(linkObj.href, { waitUntil: 'domcontentloaded' });

        try {
            // Wait for the title and contact information to load   
            await page.waitForSelector('.title_container .notranslate');
            await page.waitForSelector('.buttons_wrapper');
            await page.waitForSelector('.address'); // Wait for the address to load

            // Extract data from the page
            const titleElement = await page.$('.title_container .notranslate');
            const title = titleElement ? (await titleElement.evaluate(title => title.textContent.trim().replace(/\s+/g, ' '))) : null;

            const cuisineElement = await page.$('.cuisine_wrapper');
            const cuisine = cuisineElement ? (await cuisineElement.evaluate(cuisine => cuisine.textContent.trim().replace(/\s+/g, ' '))) : null;

            const fullAddressElement = await page.$('.address');
            const fullAddressText = fullAddressElement ? (await fullAddressElement.evaluate(address => address.textContent.trim().replace(/\s+/g, ' '))) : null;

            const websiteElement = await page.$('.website a');
            const website = websiteElement ? (await websiteElement.evaluate(website => website.textContent.trim())) : null;

            const socialMediaElement = await page.$('.instagram .insta_btn');
            const socialMediaHandle = socialMediaElement ? (await socialMediaElement.evaluate(insta => insta.textContent.trim())) : null;

            const contactInfoElement = await page.$('.buttons_wrapper .call-write__wrap .call');
            const contactInfo = contactInfoElement ? await contactInfoElement.evaluate(call => call.getAttribute('href')) : null;

            // Add the scraped data to the array
            scrapedData.push({
                title,
                contactInfo,
                cuisine,
                fullAddressText,
                website,
                socialMediaHandle
            });

            // Write scraped data to a JSON file after scraping each page
            const jsonData = JSON.stringify(scrapedData, null, 2);
            fs.writeFileSync('scraped_data.json', jsonData);
            console.log('Scraped data saved after scraping page', linkObj.href);

        } catch (error) {
            console.error('Error during scraping:', error);
        }

        await page.close();
    }

    await browser.close();

    console.log('Scraping complete!');
})();
