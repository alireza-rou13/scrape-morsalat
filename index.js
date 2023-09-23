const puppeteer = require('puppeteer');

async function scrapeDataWithPagination() {
  // Launch a new browser instance
  const browser = await puppeteer.launch();

  // Create a new page
  const page = await browser.newPage();

  // Navigate to the initial page with the data
  await page.goto('http://www.dte.ir/portal/home/?64718/%D8%AE%D8%A8%D8%B1%D9%86%D8%A7%D9%85%D9%87');

  // Wait for the data to load
  await page.waitForSelector('.data-element');

  // Scrape the data from the initial page
  const data = await page.$$eval('.data-element', elements => {
    return elements.map(element => element.textContent);
  });

  // Process the scraped data
  console.log(data);

  // Find the pagination element
  const paginationElement = await page.$('.pagination');

  // Check if pagination exists
  if (paginationElement) {
    // Get the total number of pages
    const totalPages = await page.evaluate(element => {
      return parseInt(element.lastElementChild.textContent);
    }, paginationElement);

    // Iterate through each page
    for (let i = 2; i <= totalPages; i++) {
      // Navigate to the next page
      await Promise.all([
        page.waitForNavigation(),
        page.click(`.pagination a:nth-child(${i})`)
      ]);

      // Wait for the data to load
      await page.waitForSelector('.data-element');

      // Scrape the data from the current page
      const pageData = await page.$$eval('.data-element', elements => {
        return elements.map(element => element.textContent);
      });

      // Process the scraped data from the current page
      console.log(pageData);
    }
  }

  // Close the browser
  await browser.close();
}

// Call the function to start scraping
scrapeDataWithPagination();