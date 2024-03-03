const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const pathToExtension = require('path').join(__dirname, 'CapSolver.Browser.Extension');

    const browser = await puppeteer.launch({
        headless: true,
        args: [
            `--disable-extensions-except=${pathToExtension}`,
            `--load-extension=${pathToExtension}`,
            '--no-sandbox', '--window-size=1400,800'
        ],
    });

    let scrapedData = []; // Array to store scraped data

    for (let pageNum = 29; pageNum <= 437; pageNum++) { // Scraping first 5 pages, modify as needed
        const page = await browser.newPage();
        const url = `https://restaurantguru.com/cajun-United-States-c13/${pageNum}`;
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        const captchaForm = await page.$('.contact_form.ab_check_form');
        if (captchaForm) {
            await page.waitForTimeout(20000);
            await page.click('.btn_wrapper input[type="submit"]');
        }

        await page.waitForSelector('.restaurant_row');

        const restaurantLinks = await page.$$eval('.restaurant_row', links => links.map(link => link.querySelector('.title_url').getAttribute('href')));
        for (const link of restaurantLinks) {
            try {
                const newPage = await browser.newPage();
                await newPage.goto(link, { waitUntil: 'domcontentloaded' });
                const captchaForm = await newPage.$('.contact_form.ab_check_form');
                if (captchaForm) {
                    await newPage.waitForTimeout(20000);
                    await newPage.click('.btn_wrapper input[type="submit"]');
                }

                await newPage.waitForSelector('.title_container .notranslate');
                await newPage.waitForSelector('.buttons_wrapper');
                await newPage.waitForSelector('.address');

                const titleElement = await newPage.$('.title_container .notranslate');
                const title = titleElement ? (await titleElement.evaluate(title => title.textContent.trim().replace(/\s+/g, ' '))) : null;
                
                const cuisineElement = await newPage.$('.cuisine_wrapper');
                const cuisine = cuisineElement ? (await cuisineElement.evaluate(cuisine => cuisine.textContent.trim().replace(/\s+/g, ' '))) : null;
                
                const fullAddressElement = await newPage.$('.address');
                const fullAddressText = fullAddressElement ? (await fullAddressElement.evaluate(address => address.textContent.trim().replace(/\s+/g, ' '))) : null;
                
                const websiteElement = await newPage.$('.website a');
                const website = websiteElement ? (await websiteElement.evaluate(website => website.textContent.trim())) : null;
                
                const socialMediaElement = await newPage.$('.instagram .insta_btn');
                const socialMediaHandle = socialMediaElement ? (await socialMediaElement.evaluate(insta => insta.textContent.trim())) : null;
                
                const contactInfoElement = await newPage.$('.buttons_wrapper .call-write__wrap .call');
                const contactInfo = contactInfoElement ? await contactInfoElement.evaluate(call => call.getAttribute('href')) : null;

                scrapedData.push({
                    title,
                    contactInfo,
                    cuisine,
                    fullAddressText,
                    website,
                    socialMediaHandle
                });

                await newPage.close();
            } catch (error) {
                console.error('Error during scraping:', error);
            }
        }
        await page.close();

        // Append scraped data to the existing JSON file
        const jsonData = JSON.stringify(scrapedData, null, 2);
        fs.appendFileSync('scraped_data.json', jsonData);
        console.log(`Scraped data from page ${pageNum} appended to scraped_data.json`);
    }

    await browser.close();

    console.log('Scraping complete!');
})();
