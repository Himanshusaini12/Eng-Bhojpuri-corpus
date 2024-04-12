const puppeteer = require('puppeteer');
const fs = require('fs');
const ExcelJS = require('exceljs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' ,args: [ "--no-sandbox"]});
  const page1 = await browser.newPage();
  const page2 = await browser.newPage();
  const page3 = await browser.newPage();

  // Read the Excel file
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('eng.xlsx');
  const worksheet = workbook.getWorksheet(1);

  // Initialize an object to store the Punjabi translations
  const punjabTranslations = {};

  // Navigate to the Google Translate page in all tabs
  await page1.goto('https://www.google.com/search?q=google+translate+english+to+punjabi');
  await page1.waitForSelector('textarea.tw-ta.tw-text-large.q8U8x.goog-textarea');
  const textarea1 = await page1.$('textarea.tw-ta.tw-text-large.q8U8x.goog-textarea');

  await page2.goto('https://www.google.com/search?q=google+translate+english+to+punjabi');
  await page2.waitForSelector('textarea.tw-ta.tw-text-large.q8U8x.goog-textarea');
  const textarea2 = await page2.$('textarea.tw-ta.tw-text-large.q8U8x.goog-textarea');

  await page3.goto('https://www.google.com/search?q=google+translate+english+to+punjabi');
  await page3.waitForSelector('textarea.tw-ta.tw-text-large.q8U8x.goog-textarea');
  const textarea3 = await page3.$('textarea.tw-ta.tw-text-large.q8U8x.goog-textarea');

  // Loop through each row in the Excel file
  for (let i = 2; i <= worksheet.rowCount; i += 3) {
    const englishSentence1 = worksheet.getRow(i).getCell(1).value;
    const englishSentence2 = worksheet.getRow(i + 1).getCell(1).value;
    const englishSentence3 = worksheet.getRow(i + 2).getCell(1).value;

    // Clear the previous text from the textareas
    await Promise.all([
      clearTextarea(textarea1, page1),
      clearTextarea(textarea2, page2),
      clearTextarea(textarea3, page3),
    ]);

    // Translate the English sentences to Punjabi concurrently
    const [punjabText1, punjabText2, punjabText3] = await Promise.all([
      translateToPunjabi(textarea1, page1, englishSentence1),
      translateToPunjabi(textarea2, page2, englishSentence2),
      translateToPunjabi(textarea3, page3, englishSentence3),
    ]);

    // Store the Punjabi translations in the object
    punjabTranslations[englishSentence1] = punjabText1;
    punjabTranslations[englishSentence2] = punjabText2;
    punjabTranslations[englishSentence3] = punjabText3;

    // Save the Punjabi translations to the JSON file
    fs.writeFileSync('punjab_translations.json', JSON.stringify(punjabTranslations, null, 2));

    if (i % 5 == 0) {
      console.log(`Translated ${i} sentences.`);
      console.log(englishSentence1 + "---" + punjabText1);
      
    }
  }

  await browser.close();
})();

async function clearTextarea(textarea, page) {
  await textarea.focus();
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
}

async function translateToPunjabi(textarea, page, englishSentence) {
  await textarea.type(englishSentence);
  await page.waitForTimeout(1500);
  return await page.$eval('span.Y2IQFc[lang="pa"]', (el) => el.textContent);
}
