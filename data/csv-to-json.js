// convert-csv-to-json.js
const fs = require('fs');
const csv = require('csv-parser');

const results = [];

const numericColumns = [
  'Average GPA',
  'Average MCAT',
  'Average Graduate Indebtedness',
  'Tuition and Fees',
  'Total Cost of Attendance',
  'NIH Research Funding',
  'NIH Research Funding per Faculty',
  'Total Faculty',
  '#n_ranked_specialties',
  '#n_top10_specialties',
  '#n_top1_specialties',
  'URM%',
  'Applications',
  'Class Size',
  'Matriculation Rate'
];

fs.createReadStream('final_medical_school_data.csv')
  .pipe(csv())
  .on('data', (data) => {
    const row = { ...data };

    numericColumns.forEach(col => {
      if (row[col] !== undefined && row[col] !== null && row[col] !== '') {
        const num = parseFloat(row[col].replace(/[^0-9.-]/g, '')); // strip % or $
        row[col] = isNaN(num) ? null : num;
      } else {
        row[col] = null;
      }
    });

    // Special: % Receiving Aid → keep as string (e.g., "100%")
    if (row['% Receiving Aid']) {
      row['% Receiving Aid'] = row['% Receiving Aid'].trim();
    }

    results.push(row);
  })
  .on('end', () => {
    fs.writeFileSync('../src/data/schools.json', JSON.stringify(results, null, 2));
    console.log('Conversion complete! All numeric fields are now numbers.');
    console.log('Sample:', results[0]);
  });