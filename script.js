const msPerDay = 1000 * 60 * 60 * 24;
const todayElem = document.getElementById('today');
const calculateBtn = document.getElementById('calculateBtn');
const toggleTable = document.getElementById('toggleTable');
const clearBtn = document.getElementById('clearBtn');
const downloadButtonsDiv = document.getElementById('downloadButtons');
const downloadJPG = document.getElementById('downloadJPG');
const downloadPDF = document.getElementById('downloadPDF');
const endDateInput = document.getElementById('endDate');
const totalAmountInput = document.getElementById('totalAmount');
const unitSelect = document.getElementById('unitSelect');
const remainingDaysP = document.getElementById('remainingDays');
const dailyAverageP = document.getElementById('dailyAverage');
const dailyTable = document.getElementById('dailyTable');

const todayDate = new Date();
todayElem.textContent = 'Today: ' + todayDate.toLocaleDateString();

let tbody = dailyTable.querySelector('tbody');
if (!tbody) {
  tbody = document.createElement('tbody');
  dailyTable.appendChild(tbody);
}

// Default hide
dailyTable.style.display = 'none';
downloadButtonsDiv.style.display = 'none';
toggleTable.textContent = 'Show Table';

// Format GB/MB nicely
function formatGBMB(valueMB) {
  if (!isFinite(valueMB) || valueMB <= 0) return '0 MB';
  const absMB = Math.round(valueMB);
  const gb = Math.floor(absMB / 1024);
  const mb = absMB % 1024;
  if (gb && mb) return `${gb} GB ${mb} MB`;
  if (gb) return `${gb} GB`;
  return `${mb} MB`;
}

// Main Calculation
function calculateUsage() {
  const endDateValue = endDateInput.value;
  let totalAmount = parseFloat(totalAmountInput.value);
  const unit = unitSelect.value;

  if (!endDateValue || isNaN(totalAmount) || totalAmount <= 0) {
    alert('Please enter a valid date and amount.');
    return;
  }

  if (unit === 'GB') totalAmount *= 1024;

  const start = new Date();
  const end = new Date(endDateValue);
  const diff = end - start;
  if (diff < 0) {
    alert('End date must be in the future.');
    return;
  }

  const remainingDays = Math.floor(diff / msPerDay) + 1;
  const dailyMB = totalAmount / remainingDays;

  remainingDaysP.textContent = 'Remaining Days: ' + remainingDays;
  dailyAverageP.textContent = 'Daily Average: ' + formatGBMB(dailyMB) + '/day';

  tbody.innerHTML = '';
  let remaining = totalAmount;
  for (let i = 0; i < remainingDays; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const remainingAfter = Math.max(0, remaining - dailyMB);
    const row = document.createElement('tr');
    row.innerHTML = `<td>${date.toLocaleDateString()}</td><td>${formatGBMB(remainingAfter)}</td>`;
    tbody.appendChild(row);
    remaining = remainingAfter;
  }

  // show table toggle button
 toggleTable.style.display = 'block';
toggleTable.style.textAlign = 'center';

}

calculateBtn.addEventListener('click', calculateUsage);

// Toggle Table visibility
toggleTable.addEventListener('click', () => {
  if (dailyTable.style.display === 'none') {
    dailyTable.style.display = 'table';
    toggleTable.textContent = 'Hide Table';
    downloadButtonsDiv.style.display = 'flex';
  } else {
    dailyTable.style.display = 'none';
    toggleTable.textContent = 'Show Table';
    downloadButtonsDiv.style.display = 'none';
  }
});

// Clear all inputs and data
clearBtn.addEventListener('click', () => {
  endDateInput.value = '';
  totalAmountInput.value = '';
  unitSelect.value = 'GB';
  remainingDaysP.textContent = '';
  dailyAverageP.textContent = '';
  tbody.innerHTML = '';
  dailyTable.style.display = 'none';
  toggleTable.textContent = 'Show Table';
  downloadButtonsDiv.style.display = 'none';
});

// Helper: temporarily hide buttons/footer for clean capture
function temporarilyHideUI() {
  const elements = [
    document.getElementById('downloadButtons'),
    document.querySelector('footer'),
    document.querySelector('.controls'),
  ];

  elements.forEach(el => {
    if (el) el.style.visibility = 'hidden';
  });

  return () => {
    elements.forEach(el => {
      if (el) el.style.visibility = 'visible';
    });
  };
}

// Download JPG
downloadJPG.addEventListener('click', async () => {
  const restore = temporarilyHideUI();
  await new Promise(r => setTimeout(r, 150)); // short delay for hide effect

  const section = document.querySelector('.list-section');
  const canvas = await html2canvas(section, { scale: 2, backgroundColor: '#ffffff' });
  const link = document.createElement('a');
  link.download = 'daily_usage_plan.jpg';
  link.href = canvas.toDataURL('image/jpeg');
  link.click();

  restore(); // show again
});

// Download PDF
downloadPDF.addEventListener('click', async function () {
  const restore = temporarilyHideUI();
  await new Promise(r => setTimeout(r, 150));

  const section = document.querySelector('.list-section');
  if (!section) return alert('Section not found.');

  const jsPDFConstructor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF || null;
  if (!jsPDFConstructor) {
    restore();
    return alert('jsPDF not found. Make sure the library is loaded.');
  }

  try {
    const canvas = await html2canvas(section, { scale: 2, useCORS: true, backgroundColor: '#fff' });
    const imgData = canvas.toDataURL('image/png');

    const doc = new jsPDFConstructor('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const ratio = pageWidth / canvas.width;
    const renderedHeight = canvas.height * ratio;
    let y = 0;

    while (y < canvas.height) {
      const pageCanvas = document.createElement('canvas');
      const pageCtx = pageCanvas.getContext('2d');
      pageCanvas.width = canvas.width;
      pageCanvas.height = Math.min(canvas.height - y, pageHeight / ratio);
      pageCtx.drawImage(canvas, 0, y, canvas.width, pageCanvas.height, 0, 0, canvas.width, pageCanvas.height);

      const pageImg = pageCanvas.toDataURL('image/png');
      if (y > 0) doc.addPage();
      doc.addImage(pageImg, 'PNG', 0, 0, pageWidth, pageCanvas.height * ratio);

      y += pageCanvas.height;
    }

    doc.save('daily_usage_plan.pdf');
  } catch (err) {
    console.error(err);
    alert('Failed to generate PDF. See console for details.');
  } finally {
    restore(); // restore UI after download
  }
});
