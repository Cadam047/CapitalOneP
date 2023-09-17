const csvFileInput = document.getElementById('csvFileInput');
const loadCSVButton = document.getElementById('loadCSVButton');
const dataDisplay = document.getElementById('dataDisplay');

loadCSVButton.addEventListener('click', () => {
  const file = csvFileInput.files[0];

  if (file) {
    // Check if the selected file is a CSV file
    if (file.name.endsWith('.csv')) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const csvData = event.target.result;
        displayCSVData(csvData);
      };

      // Read the file as text
      reader.readAsText(file);
    } else {
      alert('Please select a valid CSV file.');
    }
  } else {
    alert('Please select a file to load.');
  }
});

function displayCSVData(csvData) {
  // Split the CSV data into rows
  const rows = csvData.split('\n');

  // Create an HTML table to display the data
  let tableHTML = '<table>';

  // Create headers from the first row (assuming the first row contains headers)
  tableHTML += '<thead><tr>';
  const headers = rows[0].split(',');
  headers.forEach((header) => {
    tableHTML += `<th>${header}</th>`;
  });
  tableHTML += '</tr></thead>';

  // Create table rows with data
  tableHTML += '<tbody>';
  for (let i = 1; i < rows.length; i++) {
    const columns = rows[i].split(',');
    tableHTML += '<tr>';
    columns.forEach((column) => {
      tableHTML += `<td>${column}</td>`;
    });
    tableHTML += '</tr>';
  }
  tableHTML += '</tbody></table>';

  // Display the HTML table in the dataDisplay div
  dataDisplay.innerHTML = tableHTML;
}
