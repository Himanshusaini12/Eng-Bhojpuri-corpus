const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const pathToExtension = require('path').join(__dirname, 'CapSolver.Browser.Extension');
    const numBrowsers = 5; // Number of browser instances to run concurrently

    const browserPromises = Array.from({ length: numBrowsers }, async () => {
        return await puppeteer.launch({
            headless: false,
            args: [
                `--disable-extensions-except=${pathToExtension}`,
                `--load-extension=${pathToExtension}`,
                '--no-sandbox', '--window-size=1400,800'
            ],
        });
    });

    const browsers = await Promise.all(browserPromises);

    const links = require('./links.json'); // Load links from JSON file
    let failedLinks = []; // Array to store failed links

    let scrapedDataArray = []; // Array to store all scraped data

    let pageNum = 1; // Counter for the page number or link number
    for (const linkObj of links) { // Iterate over each link object
        try {
            const browserIndex = (pageNum - 1) % numBrowsers; // Determine which browser instance to use
            const browser = browsers[browserIndex];
            
            const newPage = await browser.newPage();
            await newPage.goto(linkObj.href, { waitUntil: 'domcontentloaded' });

            const captchaForm = await newPage.$('.contact_form.ab_check_form');
        if (captchaForm) {
            //console.log('reCAPTCHA challenge detected. Please solve the challenge.');
            await newPage.waitForTimeout(20000)
            // Implement code to solve reCAPTCHA challenge
            // You may use third-party services or manual interaction here
            // Once the challenge is solved, proceed to click the "Send" button
            await newPage.click('.btn_wrapper input[type="submit"]');
          //  console.log('reCAPTCHA challenge solved. Clicked the "Send" button.');
        }

            // Wait for the elements to load
            await newPage.waitForSelector('.title_container .notranslate');
            await newPage.waitForSelector('.buttons_wrapper');
            await newPage.waitForSelector('.address');


            // Extract data from the page
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
            

            // Create an object with scraped data
            const scrapedData = {
                title,
                contactInfo,
                cuisine,
                fullAddressText,
                website,
                socialMediaHandle
            };

            // Add the scraped data to the array
              scrapedDataArray.push(scrapedData);

        // Write scraped data to a JSON file (append instead of write)
        const jsonData = JSON.stringify(scrapedData, null, 2);
        fs.appendFileSync('scraped_data.json', jsonData + ',\n');
        console.log(`Scraped data from link ${pageNum} appended to scraped_data.json`);
            pageNum++;

            await newPage.close();
        } catch (error) {
            console.error('Error during scraping:', error);
            // Add failed link to the list
            failedLinks.push({
                title: linkObj.title,
                href: linkObj.href,
                
            });
        }
    }

    // Write scraped data to a JSON file


    // Close all browser instances
    for (const browser of browsers) {
        await browser.close();
    }

    console.log('Scraping complete!');
})();
