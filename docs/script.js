// Configuration
const DATA_URL = 'https://raw.githubusercontent.com/kooroshkz/Dollar-Rial-Toman-Live-Price-Dataset/refs/heads/main/data/Dollar_Toman_Price_Dataset.csv';

// Global variables
let chart;
let candlestickSeries;
let lineSeries;
let areaSeries;
let currentSeriesType = 'candlestick';
let allData = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting initialization...');
    
    try {
        console.log('Checking TradingView library...');
        if (typeof LightweightCharts === 'undefined') {
            throw new Error('LightweightCharts library not loaded');
        }
        console.log('✅ TradingView library loaded');
        
        console.log('Initializing chart...');
        initializeChart();
        console.log('✅ Chart initialized');
        
        console.log('Loading data...');
        loadData();
        console.log('✅ Data loading started');
        
        console.log('Setting up event listeners...');
        setupEventListeners();
        console.log('✅ Event listeners set up');
        
    } catch (error) {
        console.error('❌ Initialization error:', error);
        showError(error.message);
    }
});

// Initialize the chart
function initializeChart() {
    try {
        console.log('Getting chart container...');
        const chartContainer = document.getElementById('chart');
        if (!chartContainer) {
            throw new Error('Chart container not found');
        }
        console.log('✅ Chart container found');
        
        console.log('Creating chart...');
        chart = LightweightCharts.createChart(chartContainer, {
            width: chartContainer.clientWidth,
            height: 500,
            layout: {
                background: { type: 'solid', color: '#0d1117' },
                textColor: '#c9d1d9',
            },
            grid: {
                vertLines: { color: '#21262d' },
                horzLines: { color: '#21262d' },
            },
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal,
            },
            rightPriceScale: {
                borderColor: '#30363d',
                textColor: '#8b949e',
            },
            timeScale: {
                borderColor: '#30363d',
                textColor: '#8b949e',
                timeVisible: true,
                secondsVisible: false,
            },
        });
        console.log('✅ Chart created');

        console.log('Adding series...');
        // Create all series types (initially hidden)
        candlestickSeries = chart.addCandlestickSeries({
            upColor: '#238636',
            downColor: '#f85149',
            borderVisible: false,
            wickUpColor: '#238636',
            wickDownColor: '#f85149',
        });

        lineSeries = chart.addLineSeries({
            color: '#58a6ff',
            lineWidth: 2,
        });

        areaSeries = chart.addAreaSeries({
            topColor: 'rgba(88, 166, 255, 0.56)',
            bottomColor: 'rgba(88, 166, 255, 0.04)',
            lineColor: '#58a6ff',
            lineWidth: 2,
        });
        
        // Initially hide non-candlestick series
        lineSeries.applyOptions({ visible: false });
        areaSeries.applyOptions({ visible: false });
        console.log('✅ All series added');

        // Handle resize
        window.addEventListener('resize', () => {
            chart.applyOptions({ width: chartContainer.clientWidth });
        });
        console.log('✅ Resize handler added');
        
    } catch (error) {
        console.error('❌ Chart initialization error:', error);
        showError('Failed to initialize chart: ' + error.message);
    }
}

// Sample data for testing (will be replaced with real data when deployed to GitHub Pages)
const SAMPLE_DATA = [
    { date: '31/07/2025', persianDate: '1404/05/09', time: '2025-07-31', open: 89000, high: 90885, low: 89570, close: 90560, value: 90560 },
    { date: '30/07/2025', persianDate: '1404/05/08', time: '2025-07-30', open: 88500, high: 89200, low: 88100, close: 89000, value: 89000 },
    { date: '29/07/2025', persianDate: '1404/05/07', time: '2025-07-29', open: 87800, high: 88600, low: 87500, close: 88500, value: 88500 },
    { date: '28/07/2025', persianDate: '1404/05/06', time: '2025-07-28', open: 87200, high: 87900, low: 87000, close: 87800, value: 87800 },
    { date: '27/07/2025', persianDate: '1404/05/05', time: '2025-07-27', open: 86800, high: 87300, low: 86500, close: 87200, value: 87200 },
    { date: '26/07/2025', persianDate: '1404/05/04', time: '2025-07-26', open: 86200, high: 86900, low: 86000, close: 86800, value: 86800 },
    { date: '25/07/2025', persianDate: '1404/05/03', time: '2025-07-25', open: 85800, high: 86300, low: 85500, close: 86200, value: 86200 },
    { date: '24/07/2025', persianDate: '1404/05/02', time: '2025-07-24', open: 85200, high: 85900, low: 85000, close: 85800, value: 85800 },
    { date: '23/07/2025', persianDate: '1404/05/01', time: '2025-07-23', open: 84800, high: 85300, low: 84500, close: 85200, value: 85200 },
    { date: '22/07/2025', persianDate: '1404/04/31', time: '2025-07-22', open: 84200, high: 84900, low: 84000, close: 84800, value: 84800 }
];

// Load and process data
async function loadData() {
    try {
        console.log('Starting data load...');
        console.log('Fetching data from:', DATA_URL);
        
        // Try to fetch real data first
        const response = await fetch(DATA_URL, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'text/csv,text/plain,*/*'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvText = await response.text();
        console.log('CSV data loaded, length:', csvText.length);
        
        allData = parseCSV(csvText);
        console.log('Parsed data points:', allData.length);
        
        if (allData.length === 0) {
            throw new Error('No data parsed from CSV');
        }
        
    } catch (error) {
        console.error('Error loading real data:', error);
        console.log('Using sample data for local preview...');
        
        // Use sample data as fallback
        allData = SAMPLE_DATA;
        console.log('Sample data loaded:', allData.length, 'records');
        
        // Show a message to user
        showDataSourceMessage('Using sample data for local preview. Real data will load automatically when deployed to GitHub Pages.');
    }
    
    console.log('Updating statistics...');
    updateStatistics(allData);
    
    console.log('Updating data table...');
    updateRecentDataTable(allData.slice(-10)); // Show last 10 records
    
    console.log('Updating chart...');
    updateChart(allData);
    
    console.log('Hiding loading indicator...');
    hideLoading();
    
    console.log('✅ Data loading complete');
}

// Show data source message
function showDataSourceMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #58a6ff;
        color: #0d1117;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(88, 166, 255, 0.3);
        z-index: 1000;
        max-width: 300px;
        font-size: 14px;
        line-height: 1.4;
        border: 1px solid #30363d;
    `;
    messageDiv.innerHTML = `
        <strong>Local Preview:</strong><br>
        ${message}
        <button onclick="this.parentElement.remove()" style="
            background: rgba(13, 17, 23, 0.2);
            border: none;
            color: #0d1117;
            float: right;
            cursor: pointer;
            font-size: 16px;
            margin-top: -5px;
            border-radius: 3px;
            width: 25px;
            height: 25px;
        ">×</button>
    `;
    document.body.appendChild(messageDiv);
    
    // Auto-remove after 15 seconds
    setTimeout(() => {
        if (messageDiv.parentElement) {
            messageDiv.remove();
        }
    }, 15000);
}

// Parse CSV data
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const header = lines[0].split(',').map(col => col.replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length >= 6) {
            const [date, persianDate, open, low, high, close] = values;
            
            // Convert date from DD/MM/YYYY to YYYY-MM-DD for the chart
            const dateParts = date.split('/');
            if (dateParts.length === 3) {
                const chartDate = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
                
                data.push({
                    date: date,
                    persianDate: persianDate,
                    time: chartDate,
                    open: parseFloat(open.replace(/,/g, '')),
                    high: parseFloat(high.replace(/,/g, '')),
                    low: parseFloat(low.replace(/,/g, '')),
                    close: parseFloat(close.replace(/,/g, '')),
                    value: parseFloat(close.replace(/,/g, '')), // For line and area series
                });
            }
        }
    }

    return data.sort((a, b) => new Date(a.time) - new Date(b.time));
}

// Parse a single CSV line (handling quoted values)
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

// Update statistics
function updateStatistics(data) {
    if (data.length === 0) return;

    const totalRecords = data.length;
    const lastRecord = data[data.length - 1];
    const currentPrice = formatNumber(lastRecord.close);
    const lastUpdate = lastRecord.date;

    document.getElementById('totalRecords').textContent = formatNumber(totalRecords);
    document.getElementById('lastUpdate').textContent = lastUpdate;
    document.getElementById('currentPrice').textContent = currentPrice;
}

// Update recent data table
function updateRecentDataTable(recentData) {
    const tbody = document.getElementById('recentDataBody');
    tbody.innerHTML = '';

    // Reverse to show newest first
    recentData.reverse().forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${record.date}</strong></td>
            <td>${record.persianDate}</td>
            <td>${formatNumber(record.open)}</td>
            <td>${formatNumber(record.low)}</td>
            <td>${formatNumber(record.high)}</td>
            <td><strong>${formatNumber(record.close)}</strong></td>
        `;
        tbody.appendChild(row);
    });
}

// Update chart with data
function updateChart(data) {
    if (data.length === 0) return;

    console.log('Preparing chart data...');
    // Prepare data for different series types
    const candlestickData = data.map(item => ({
        time: item.time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
    }));

    const lineData = data.map(item => ({
        time: item.time,
        value: item.close,
    }));

    console.log('Setting data to series...');
    console.log('Sample candlestick data:', candlestickData.slice(0, 2));
    console.log('Sample line data:', lineData.slice(0, 2));

    // Set data for all series
    candlestickSeries.setData(candlestickData);
    lineSeries.setData(lineData);
    areaSeries.setData(lineData);

    console.log('Fitting content...');
    // Fit content to show all data
    chart.timeScale().fitContent();
    console.log('✅ Chart updated successfully');
}

// Setup event listeners
function setupEventListeners() {
    const chartButtons = document.querySelectorAll('.chart-btn');
    
    chartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const seriesType = button.getAttribute('data-type');
            switchChartType(seriesType);
            
            // Update button states
            chartButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
}

// Switch chart type
function switchChartType(type) {
    // Hide all series first
    candlestickSeries.applyOptions({ visible: false });
    lineSeries.applyOptions({ visible: false });
    areaSeries.applyOptions({ visible: false });

    // Show the selected series
    switch (type) {
        case 'candlestick':
            candlestickSeries.applyOptions({ visible: true });
            break;
        case 'line':
            lineSeries.applyOptions({ visible: true });
            break;
        case 'area':
            areaSeries.applyOptions({ visible: true });
            break;
    }

    currentSeriesType = type;
}

// Hide loading indicator
function hideLoading() {
    const loadingElement = document.getElementById('chartLoading');
    if (loadingElement) {
        loadingElement.classList.add('hidden');
    }
}

// Show error message
function showError(message) {
    const loadingElement = document.getElementById('chartLoading');
    if (loadingElement) {
        loadingElement.innerHTML = `
            <div style="color: #e74c3c; text-align: center;">
                <h3>⚠️ Error</h3>
                <p>${message}</p>
            </div>
        `;
    }

    // Update table
    const tbody = document.getElementById('recentDataBody');
    tbody.innerHTML = '<tr><td colspan="6" class="loading" style="color: #e74c3c;">Failed to load data</td></tr>';

    // Update stats
    document.getElementById('totalRecords').textContent = 'Error';
    document.getElementById('lastUpdate').textContent = 'Error';
    document.getElementById('currentPrice').textContent = 'Error';
}

// Format number with thousands separator
function formatNumber(num) {
    if (typeof num === 'number') {
        return num.toLocaleString();
    }
    return num;
}

// Refresh data (can be called manually)
function refreshData() {
    document.getElementById('chartLoading').classList.remove('hidden');
    loadData();
}

// Export functions for external use
window.DollarRialChart = {
    refresh: refreshData,
    switchChart: switchChartType,
    getData: () => allData
};
