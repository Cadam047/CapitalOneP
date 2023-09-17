const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs'); // Include the fs module

// The URL of the web page you want to scrape
const url = 'https://laymansolution.com/category/how-to/';

axios.get(url)
  .then((response) => {
    const $ = cheerio.load(response.data);
    const articleTitles = [];

    $('.article-title').each((index, element) => {
      articleTitles.push($(element).text());
    });

    // Format the data as a CSV string
    const csvData = articleTitles.join('\n');

    // Specify the file path where you want to save the CSV file
    const filePath = 'article_titles.csv';

    // Write the CSV data to a file
    fs.writeFile(filePath, csvData, (err) => {
      if (err) {
        console.error('Error writing CSV file:', err);
      } else {
        console.log('CSV file saved successfully:', filePath);
      }
    });
  })
  .catch((error) => {
    console.error('Error:', error);
  });