const puppeteer = require('puppeteer');
const readline = require('readline');
const fs = require('fs');
const { createObjectCsvWriter } = require('csv-writer');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Define a function to create website objects
function createWebsite(url) {
  return {
    url,
    priceSelector: '.productPrice.colorLink', // Selector for the price on Shopzilla
    itemNameSelector: '[data-product-title]', // Selector for the item name on Shopzilla using data-product-title attribute
  };
}

// Define a mapping of website URLs to their respective selectors for item name and price
const websiteData = [
  createWebsite('https://www.shopzilla.com/towels/products/'),
  createWebsite('https://www.shopzilla.com/cellphones/products/'),
  createWebsite('https://www.shopzilla.com/skincareproducts/browse/'),
  createWebsite('https://www.shopzilla.com/pens/browse/'),
  createWebsite('https://www.shopzilla.com/womensclothing/browse/'),
  createWebsite('https://www.shopzilla.com/mensclothing/browse/'),
  createWebsite('https://www.shopzilla.com/calculators1/browse/'),
  createWebsite('https://www.shopzilla.com/laptopcomputers/browse/'),
  createWebsite('https://www.shopzilla.com/headsets_microphones/browse/'),
  // Add more websites here as needed
];

// Function to scrape prices and item names from a website
async function scrapeWebsiteData(websiteIndex) {
  try {
    const websiteInfo = websiteData[websiteIndex];
    if (!websiteInfo) {
      console.log('Invalid website selection.');
      return { prices: [], itemNames: [] };
    }

    const browser = await puppeteer.launch({
      headless: true,
    });
    const page = await browser.newPage();

    await page.goto(websiteInfo.url);

    // Wait for the price selector to become visible
    await page.waitForSelector(websiteInfo.priceSelector, { visible: true });

    const prices = await page.$$eval(websiteInfo.priceSelector, (elements) =>
      elements.map((element) => parseFloat(element.textContent.trim().replace('$', '').replace(',', '')))
    );

    const itemNames = await page.$$eval(websiteInfo.itemNameSelector, (elements) =>
      elements.map((element) => element.getAttribute('data-product-title'))
    );

    await browser.close();

    return { prices, itemNames };
  } catch (error) {
    console.error('Error scraping website:', error);
    return { prices: [], itemNames: [] };
  }
}

// Define the output directory for CSV files
const outputDirectory = './output/';

// Function to write scraped data to a CSV file and sort by price
async function writeAndSortDataToCSV(url, prices, itemNames) {
  // Combine prices and itemNames into an array of objects
  const records = prices.map((price, index) => ({
    itemName: itemNames[index] || 'N/A',
    price,
  }));

  // Sort records by price (smallest to largest)
  records.sort((a, b) => a.price - b.price);

  // Create a CSV writer
  const csvWriter = createObjectCsvWriter({
    path: `${outputDirectory}data_${url.replace(/[^a-zA-Z0-9]/g, '_')}.csv`,
    header: [
      { id: 'itemName', title: 'Item Name' },
      { id: 'price', title: 'Price' },
    ],
  });

  // Write sorted records to the CSV file
  await csvWriter.writeRecords(records);
  console.log(`Data was added to data_${url.replace(/[^a-zA-Z0-9]/g, '_')}.csv (sorted by price).`);
}

// Display the list of available websites for the user to choose from
console.log('Available websites:');
websiteData.forEach((data, index) => {
  console.log(`${index + 1}. ${data.url}`);
});

rl.question('Enter the number corresponding to the website you want to scrape: ', async (selectedNumber) => {
  rl.close();

  const websiteIndex = parseInt(selectedNumber) - 1;

  if (isNaN(websiteIndex) || websiteIndex < 0 || websiteIndex >= websiteData.length) {
    console.log('Invalid website selection.');
    return;
  }

  const websiteInfo = websiteData[websiteIndex];
  const { prices, itemNames } = await scrapeWebsiteData(websiteIndex);

  if (prices.length === 0) {
    console.log('No prices found on the website.');
    return;
  }

  await writeAndSortDataToCSV(websiteInfo.url, prices, itemNames);
  console.log('Price data extraction and CSV writing (sorted by price) completed.');
});
