// Configuration
const DATA_URL = 'https://raw.githubusercontent.com/kooroshkz/Dollar-Rial-Toman-Live-Price-Dataset/refs/heads/main/data/Dollar_Rial_Price_Dataset.csv';

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

// Sample data for local preview (matches actual Rial dataset columns)
const SAMPLE_DATA = [
    { gdate: '2025/09/06', pdate: '1404/06/15', open: 1012100, low: 1011700, high: 1034100, close: 1029800 },
    { gdate: '2025/09/04', pdate: '1404/06/13', open: 1023900, low: 1014300, high: 1024200, close: 1014400 },
    { gdate: '2025/09/03', pdate: '1404/06/12', open: 1032700, low: 1023800, high: 1032700, close: 1025700 },
    { gdate: '2025/09/02', pdate: '1404/06/11', open: 1055700, low: 1031300, high: 1056700, close: 1032000 },
    { gdate: '2025/08/31', pdate: '1404/06/09', open: 1024900, low: 1024300, high: 1049200, close: 1048300 }
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
    
    console.log('Making data globally accessible...');
    window.allData = allData;
    
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
    // Expected: Open Price,Low Price,High Price,Close Price,Change Amount,Change Percent,Gregorian Date,Persian Date
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length >= 8) {
            const [open, low, high, close, changeAmount, changePercent, gdate, pdate] = values;
            // Convert date for chart (YYYY/MM/DD to YYYY-MM-DD)
            const dateParts = gdate.split('/');
            if (dateParts.length === 3) {
                const chartDate = `${dateParts[0]}-${dateParts[1].padStart(2, '0')}-${dateParts[2].padStart(2, '0')}`;
                data.push({
                    gdate: gdate,
                    pdate: pdate,
                    time: chartDate,
                    open: parseInt(open, 10),
                    low: parseInt(low, 10),
                    high: parseInt(high, 10),
                    close: parseInt(close, 10),
                    value: parseInt(close, 10),
                    changeAmount: changeAmount,
                    changePercent: changePercent
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
    const lastUpdate = lastRecord.gdate;
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
            <td><strong>${record.gdate}</strong></td>
            <td>${record.pdate}</td>
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
    
    // Trigger technical analysis update
    console.log('Triggering technical analysis update...');
    if (window.technicalAnalysis) {
        console.log('Technical analysis found, setting data...');
        window.technicalAnalysis.setData(data);
    } else {
        console.log('Technical analysis not ready, will retry...');
        setTimeout(() => {
            if (window.technicalAnalysis) {
                console.log('Technical analysis ready on retry, setting data...');
                window.technicalAnalysis.setData(data);
            }
        }, 1000);
    }
    
    // Update technical analysis if available
    if (window.technicalAnalysis) {
        window.technicalAnalysis.setData(data);
    }
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