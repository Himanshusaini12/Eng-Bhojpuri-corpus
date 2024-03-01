const puppeteer = require('puppeteer');
const fs = require('fs');
const ExcelJS = require('exceljs');
const { google } = require('googleapis');

// Add your Google Sheets API credentials file
const credentials = {
    "type": "service_account",
    "project_id": "golf-413208",
    "private_key_id": "161ece8582657b75e9a3d8c2e598952e678fd1d6",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC2DWqCqPNNn+Xh\nKliJ0Zayac/xXX8jYjNCRWQb8s9e10SLk8hB6G1KXZBHDuzeEvgGl/pGGv0hgclK\nWzk49mUecYcw6fP8OaqstfsNkOsRWmlnGJ99GJBlOp5NVZ7q4cErVBbKFrwL8Jg+\n4pn9PF/XNsOcoyicHIBS1+sYGQlCC4woB2blF69i4kk7kwi0PBhYMp85tSANWrj9\ncqAQ0jJHBNtAQIK0akNza0NZnz0o33rE0vM4NDHKPzo386x8flDsc6FvLEPXjyu5\nJujnmtSg8umOKklGq9BYZjq99H0MWLb1ZxFII0yEIZzDkJQxL4Gzrvh5l+tjVb+h\ntniwW73BAgMBAAECggEAA8qJSZ8PTZW/oo37FkD6/IVGeIYs6/PTPFVJ0vcsfpMB\nuE7VbqkLcguQiQwQ2u+AooqEV9hKCWpC1ISTXXyk+VNvsEoUSTOXHjFo3VQDloEJ\nKYzLKekwC0ZKc6S4QmJg7YyeaOAR4cVTqBjtggOIoS+1/gRKB+AAg6rqUTAKgaXj\ng7m1qowDUSx4AOjVfsfyczLdzXBVms3VZyl9fxNJsitd5jYQGxvruCJO2Sa/aL1w\nfzwBJY/HAd1qzH4ZeiGg6kQTwst36RnZ1kyV3sM2Bb9oihx5zwquWzNTVZj9dpEy\nPwElngPxhQ2/QVZfxhSP2B1i+AaAZZJ/j5P/Jej7fQKBgQD1c9GdUIDKTIQwjeeR\n1pPe4jrLe+xYGgyoDKwb2z8/y7rmbi3Jrvdx8wkPalalHXo/lvjzxjwZLNZn0Dbx\n3sZqhRK0lXzsiQCS4MNHqII7X5BTglAlzNw2DqsO4T8cKOOMzueZ8D3bhvhtTqSt\nuixfTIjrdVuBZy1CEXLRAqGYuwKBgQC94CTvsZP7T7kETrlfjbVVEdjgdcq2ECFd\nA5LvOuiGX2lfdsWxxxsLQ8U/GmXQLyrkZHedke8RszFiGwmev7u0kesPSL/nLOE0\nbA668RHoNkIU4B+D4FgavMvD6udIgNXn20oZRk4Hh6V4Pcfyt88bRezYYE9tCO7b\n1mrePTgpswKBgQDLXfbjPPw4oUU1ZZ3ke8Fw/khwqHCeXpb19enz+qhhF0/39HoD\njPCAfTmYiCbaD55maZRDho/s2/WZdi7QICCNyUxCS0mCQdEz4P5rtPaScw+F4Ya+\niwo5z9VzMrWzgz1mQVgrd54I8b+L8YkIWCTDoQog7M+wW+hnwUU8X828WQKBgGVQ\nKUVAUn6hDk7PFrh2q4/lwvwZvf0hZDv2QTunChVQ6a/HdzshyztagO/nzPWlhVRy\niySnjpG6NJptZNew5J430d3I6qSWXOAU3FNBeFWYRfBPmmFKnpg9rtguChS0se5S\nIxqTWeVIqrEa/gpzq22ZBQR7d0Xto03n/gPxVHtjAoGAV3Ft0tQbzYrPWyKUuDe5\naGpRMTy1V4KEdou/IgxEzkvKCNlJIgQQSvqVTQKMDkknXmwGm9fc7xb1TW872DXT\nmWIFzJXwB0diBT6bdudutMB+lquRdN6OgsiaaBg4iKICVMLEYdbI/DKY/0p0aKR2\nQpvNlokhSskx59yOIhSCK6g=\n-----END PRIVATE KEY-----",
    "client_email": "arjun-sharma@golf-413208.iam.gserviceaccount.com",
    "client_id": "111376867783526331306",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/arjun-sharma%40golf-413208.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
}

const sheets = google.sheets('v4');

const spreadsheetId = '1idYgmMqfCi12SNsGW50jgdy-PGkTk7_17pKZTL3dNwY'; // Replace with your Google Sheet ID
// const sheetName = 'Sheet5'; // Replace with your sheet name

const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});


(async () => {

    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile('eng.xlsx');
        const worksheet = workbook.getWorksheet('eng');

        // console.log('Excel file loaded');

        const sentences = new Set();

        for (let i = 1; i <= worksheet.rowCount; i++) {

            const row = worksheet.getRow(i);

            const sentence = row.getCell('A').value;

            sentences.add(sentence);

        }

        // console.log(sentences.size);

        // const browser = await puppeteer.launch({
        //     headless: true,
        //     defaultViewport: {
        //         width: 1300,
        //         height: 800,
        //     },
        //     args: ['--no-sandbox', '--window-size=1400,800'],
        // });



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
        const sheetTitle = 'Sheet1';

        const page = await browser.newPage();

        await page.goto('https://www.google.com/search?q=translate&rlz=1C1ONGR_enIN1062IN1062&oq=tra&gs_lcrp=EgZjaHJvbWUqDwgBEEUYOxiDARixAxiABDIGCAAQRRg8Mg8IARBFGDsYgwEYsQMYgAQyBggCEEUYOTITCAMQLhiDARjHARixAxjRAxiABDIHCAQQABiABDIGCAUQRRg8MgYIBhBFGDwyBggHEEUYPNIBCDgyMzZqMGo3qAIAsAIA&sourceid=chrome&ie=UTF-8');

        await page.waitForSelector('span.target-language');

        await page.waitForTimeout(1000);

        await page.click('span.target-language');

        await page.waitForSelector('input[placeholder="Translate to"]');

        await page.type('input[placeholder="Translate to"]', 'Bhojpuri');

        await page.keyboard.press('Enter');

        await page.waitForTimeout(2000);

        console.log('Process Started...');

        let flag = 1;

        let mainData = [];

        // Loop through each sentence
        for (const sentence of sentences) {

            // Type the sentence in the input text area
            await page.type('#tw-source-text-ta', sentence);

            // Wait for translation to appear
            await page.waitForFunction(() => document.querySelector('#tw-target-text > span').textContent.trim() !== '');

            await page.waitForTimeout(1500);

            // Get the translated text
            const translatedText = await page.evaluate(() => document.querySelector('#tw-target-text > span').textContent);

            // console.log(`Translated: ${translatedText}`);

            // Append the translated text to the result file
            // fs.appendFileSync('output.txt', `${sentence}    ${translatedText}\n`);

            const obj = {
                'English': sentence,
                'Bhojpuri': translatedText
            }

            mainData.push(Object.values(obj));

            if (flag) {
                const headers = Object.keys(obj);
                await sheets.spreadsheets.values.append({
                    auth,
                    spreadsheetId,
                    range: sheetTitle,
                    valueInputOption: 'RAW',
                    resource: {
                        values: [headers],
                    },
                });

                flag = 0;
            }

            if (mainData.length >= 100) {
                await sheets.spreadsheets.values.append({
                    auth,
                    spreadsheetId,
                    range: sheetTitle,
                    valueInputOption: 'RAW',
                    resource: {
                        values: mainData,
                    },
                });

                mainData = [];

                console.log(`Next 100 sentences data added!!`);
            }
            // Clear the input text area for the next sentence
            await page.$eval('#tw-source-text-ta', textarea => textarea.value = '');

            await page.waitForTimeout(1000);
        }

        if (mainData.length > 0) {
            await sheets.spreadsheets.values.append({
                auth,
                spreadsheetId,
                range: sheetTitle,
                valueInputOption: 'RAW',
                resource: {
                    values: Object.values(mainData),
                },
            });
        }

        // Close the browser
        await browser.close();
    } catch (err) {
        console.log(err);
    }
})();