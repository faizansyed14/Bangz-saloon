/**
 * Salon Management System - Google Apps Script Backend
 * Handles all server-side operations and Google Sheets integration
 */

// Configuration
const CONFIG = {
  SPREADSHEET_ID: '', // To be set in Script Properties
  SALON_NAME: 'SalonPro',
  TIMEZONE: 'America/New_York',
  SHEETS: {
    TRANSACTIONS: 'Transactions',
    WORKERS: 'Workers',
    SERVICES: 'Services',
    DAILY_SUMMARY: 'Daily_Summary',
    SETTINGS: 'Settings'
  }
};

/**
 * Main entry point for HTTP requests
 */
function doPost(e) {
  try {
    console.log('Received POST request:', e);
    
    const data = JSON.parse(e.postData.contents);
    const endpoint = e.parameter.endpoint;
    
    let result;
    
    switch (endpoint) {
      case 'addServiceEntry':
        result = addServiceEntry(data);
        break;
      case 'test':
        result = { success: true, message: 'Connection test successful' };
        break;
      default:
        throw new Error(`Unknown endpoint: ${endpoint}`);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.message 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Main entry point for HTTP GET requests
 */
function doGet(e) {
  try {
    console.log('Received GET request:', e);
    
    const endpoint = e.parameter.endpoint;
    let result;
    
    switch (endpoint) {
      case 'getWorkers':
        result = getWorkers();
        break;
      case 'getServices':
        result = getServices();
        break;
      case 'getDailyData':
        result = getDailyData(e.parameter.date);
        break;
      case 'getSettings':
        result = getSettings();
        break;
      case 'test':
        result = { success: true, message: 'Connection test successful' };
        break;
      default:
        throw new Error(`Unknown endpoint: ${endpoint}`);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in doGet:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.message 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Add a new service entry to the Transactions sheet
 * @param {Object} data - Service entry data
 * @returns {Object} Result object
 */
function addServiceEntry(data) {
  try {
    console.log('Adding service entry:', data);
    
    const spreadsheet = getSpreadsheet();
    const sheet = spreadsheet.getSheetByName(CONFIG.SHEETS.TRANSACTIONS);
    
    if (!sheet) {
      throw new Error('Transactions sheet not found');
    }
    
    // Prepare row data
    const rowData = [
      data.timestamp || new Date().toISOString(),
      data.date || new Date().toLocaleDateString(),
      data.worker,
      data.service,
      data.cost,
      data.payment,
      data.customer || '',
      data.monthYear || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    ];
    
    // Add the row
    sheet.appendRow(rowData);
    
    // Update daily summary
    updateDailySummary(data.date || new Date().toLocaleDateString());
    
    console.log('Service entry added successfully');
    return {
      success: true,
      data: {
        id: sheet.getLastRow(),
        timestamp: rowData[0],
        ...data
      }
    };
    
  } catch (error) {
    console.error('Error adding service entry:', error);
    throw error;
  }
}

/**
 * Get list of workers from Workers sheet
 * @returns {Object} Result object with workers array
 */
function getWorkers() {
  try {
    console.log('Getting workers list');
    
    const spreadsheet = getSpreadsheet();
    const sheet = spreadsheet.getSheetByName(CONFIG.SHEETS.WORKERS);
    
    if (!sheet) {
      // Return default workers if sheet doesn't exist
      return {
        success: true,
        data: ["Maria", "Ahmed", "Sarah", "John", "Lisa"]
      };
    }
    
    const data = sheet.getDataRange().getValues();
    const workers = [];
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const workerName = data[i][0];
      const status = data[i][1] || 'Active';
      
      if (workerName && status === 'Active') {
        workers.push(workerName);
      }
    }
    
    console.log(`Found ${workers.length} active workers`);
    return {
      success: true,
      data: workers
    };
    
  } catch (error) {
    console.error('Error getting workers:', error);
    // Return default workers as fallback
    return {
      success: true,
      data: ["Maria", "Ahmed", "Sarah", "John", "Lisa"]
    };
  }
}

/**
 * Get services and pricing from Services sheet
 * @returns {Object} Result object with services object
 */
function getServices() {
  try {
    console.log('Getting services list');
    
    const spreadsheet = getSpreadsheet();
    const sheet = spreadsheet.getSheetByName(CONFIG.SHEETS.SERVICES);
    
    if (!sheet) {
      // Return default services if sheet doesn't exist
      return {
        success: true,
        data: getDefaultServices()
      };
    }
    
    const data = sheet.getDataRange().getValues();
    const services = {};
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const category = data[i][0];
      const serviceName = data[i][1];
      const price = data[i][2];
      const status = data[i][3] || 'Active';
      
      if (category && serviceName && price && status === 'Active') {
        if (!services[category]) {
          services[category] = {};
        }
        services[category][serviceName] = parseFloat(price);
      }
    }
    
    console.log(`Found services in ${Object.keys(services).length} categories`);
    return {
      success: true,
      data: services
    };
    
  } catch (error) {
    console.error('Error getting services:', error);
    // Return default services as fallback
    return {
      success: true,
      data: getDefaultServices()
    };
  }
}

/**
 * Get daily data for dashboard
 * @param {string} date - Date string
 * @returns {Object} Result object with daily data
 */
function getDailyData(date) {
  try {
    console.log(`Getting daily data for ${date}`);
    
    const spreadsheet = getSpreadsheet();
    const transactionsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.TRANSACTIONS);
    
    if (!transactionsSheet) {
      return {
        success: true,
        data: getEmptyDailyData()
      };
    }
    
    const data = transactionsSheet.getDataRange().getValues();
    const todayEntries = [];
    
    // Skip header row and filter by date
    for (let i = 1; i < data.length; i++) {
      const entryDate = data[i][1]; // Date column
      if (entryDate === date) {
        todayEntries.push({
          worker: data[i][2],
          service: data[i][3],
          cost: parseFloat(data[i][4]) || 0,
          payment: data[i][5],
          customer: data[i][6],
          timestamp: data[i][0]
        });
      }
    }
    
    const dailyData = calculateDailyStats(todayEntries);
    
    console.log(`Found ${todayEntries.length} entries for ${date}`);
    return {
      success: true,
      data: dailyData
    };
    
  } catch (error) {
    console.error('Error getting daily data:', error);
    return {
      success: true,
      data: getEmptyDailyData()
    };
  }
}

/**
 * Get app settings from Settings sheet
 * @returns {Object} Result object with settings
 */
function getSettings() {
  try {
    console.log('Getting app settings');
    
    const spreadsheet = getSpreadsheet();
    const sheet = spreadsheet.getSheetByName(CONFIG.SHEETS.SETTINGS);
    
    if (!sheet) {
      return {
        success: true,
        data: getDefaultSettings()
      };
    }
    
    const data = sheet.getDataRange().getValues();
    const settings = {};
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const settingName = data[i][0];
      const settingValue = data[i][1];
      
      if (settingName && settingValue) {
        settings[settingName] = settingValue;
      }
    }
    
    console.log(`Found ${Object.keys(settings).length} settings`);
    return {
      success: true,
      data: settings
    };
    
  } catch (error) {
    console.error('Error getting settings:', error);
    return {
      success: true,
      data: getDefaultSettings()
    };
  }
}

/**
 * Update daily summary sheet
 * @param {string} date - Date string
 */
function updateDailySummary(date) {
  try {
    const spreadsheet = getSpreadsheet();
    let summarySheet = spreadsheet.getSheetByName(CONFIG.SHEETS.DAILY_SUMMARY);
    
    if (!summarySheet) {
      // Create summary sheet if it doesn't exist
      summarySheet = spreadsheet.insertSheet(CONFIG.SHEETS.DAILY_SUMMARY);
      summarySheet.getRange(1, 1, 1, 6).setValues([[
        'Date', 'Total_Sales', 'Transaction_Count', 'Cash_Total', 'Card_Total', 'Worker_Stats'
      ]]);
    }
    
    // Get today's data
    const dailyData = getDailyData(date);
    const stats = dailyData.data;
    
    // Check if entry for this date already exists
    const data = summarySheet.getDataRange().getValues();
    let rowIndex = -1;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === date) {
        rowIndex = i + 1; // Convert to 1-based index
        break;
      }
    }
    
    const rowData = [
      date,
      stats.totalSales,
      stats.transactionCount,
      stats.cashTotal,
      stats.cardTotal,
      JSON.stringify(stats.workerStats)
    ];
    
    if (rowIndex > 0) {
      // Update existing row
      summarySheet.getRange(rowIndex, 1, 1, 6).setValues([rowData]);
    } else {
      // Add new row
      summarySheet.appendRow(rowData);
    }
    
    console.log(`Daily summary updated for ${date}`);
    
  } catch (error) {
    console.error('Error updating daily summary:', error);
  }
}

/**
 * Get the main spreadsheet
 * @returns {Spreadsheet} Google Sheets spreadsheet object
 */
function getSpreadsheet() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  
  if (!spreadsheetId) {
    throw new Error('SPREADSHEET_ID not configured in Script Properties');
  }
  
  return SpreadsheetApp.openById(spreadsheetId);
}

/**
 * Calculate daily statistics from entries
 * @param {Array} entries - Array of service entries
 * @returns {Object} Calculated statistics
 */
function calculateDailyStats(entries) {
  const stats = {
    totalSales: 0,
    transactionCount: entries.length,
    cashTotal: 0,
    cardTotal: 0,
    workerStats: {},
    recentTransactions: []
  };
  
  entries.forEach(entry => {
    const cost = parseFloat(entry.cost) || 0;
    stats.totalSales += cost;
    
    if (entry.payment === 'Cash') {
      stats.cashTotal += cost;
    } else if (entry.payment === 'Card') {
      stats.cardTotal += cost;
    }
    
    // Worker stats
    if (entry.worker) {
      if (!stats.workerStats[entry.worker]) {
        stats.workerStats[entry.worker] = { total: 0, count: 0 };
      }
      stats.workerStats[entry.worker].total += cost;
      stats.workerStats[entry.worker].count += 1;
    }
    
    // Recent transactions
    stats.recentTransactions.push({
      service: entry.service,
      worker: entry.worker,
      cost: cost,
      payment: entry.payment,
      timestamp: entry.timestamp
    });
  });
  
  // Sort recent transactions by timestamp (newest first)
  stats.recentTransactions.sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );
  
  return stats;
}

/**
 * Get default services configuration
 * @returns {Object} Default services object
 */
function getDefaultServices() {
  return {
    "Hair Services": {
      "Basic Hair Cut": 15,
      "Premium Hair Cut": 25,
      "Hair Styling": 20,
      "Hair Wash & Blow Dry": 12,
      "Hair Coloring": 45,
      "Hair Treatment": 35,
      "Highlights": 60
    },
    "Shaving Services": {
      "Basic Shave": 8,
      "Premium Shave": 15,
      "Beard Trim": 10,
      "Mustache Trim": 5
    },
    "Facial Services": {
      "Basic Facial": 25,
      "Deep Cleansing Facial": 40,
      "Anti-Aging Facial": 50
    }
  };
}

/**
 * Get default settings
 * @returns {Object} Default settings object
 */
function getDefaultSettings() {
  return {
    salonName: CONFIG.SALON_NAME,
    currency: "USD",
    timezone: CONFIG.TIMEZONE,
    version: "1.0"
  };
}

/**
 * Get empty daily data structure
 * @returns {Object} Empty daily data
 */
function getEmptyDailyData() {
  return {
    totalSales: 0,
    transactionCount: 0,
    cashTotal: 0,
    cardTotal: 0,
    workerStats: {},
    recentTransactions: []
  };
}

/**
 * Setup function to initialize the spreadsheet
 * Run this once to create the required sheets and sample data
 */
function setupSpreadsheet() {
  try {
    console.log('Setting up spreadsheet...');
    
    const spreadsheet = getSpreadsheet();
    
    // Create sheets if they don't exist
    const sheetNames = Object.values(CONFIG.SHEETS);
    sheetNames.forEach(sheetName => {
      let sheet = spreadsheet.getSheetByName(sheetName);
      if (!sheet) {
        sheet = spreadsheet.insertSheet(sheetName);
        console.log(`Created sheet: ${sheetName}`);
      }
    });
    
    // Setup Transactions sheet
    const transactionsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.TRANSACTIONS);
    if (transactionsSheet.getLastRow() === 0) {
      transactionsSheet.getRange(1, 1, 1, 8).setValues([[
        'Timestamp', 'Date', 'Worker_Name', 'Service_Type', 'Service_Cost', 'Payment_Method', 'Customer_Name', 'Month_Year'
      ]]);
    }
    
    // Setup Workers sheet
    const workersSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.WORKERS);
    if (workersSheet.getLastRow() === 0) {
      workersSheet.getRange(1, 1, 1, 4).setValues([[
        'Worker_Name', 'Status', 'Hire_Date', 'Notes'
      ]]);
      
      // Add sample workers
      const sampleWorkers = [
        ['Maria', 'Active', '2024-01-15', 'Senior Stylist'],
        ['Ahmed', 'Active', '2024-02-01', 'Barber'],
        ['Sarah', 'Active', '2024-01-20', 'Hair Stylist'],
        ['John', 'Active', '2024-03-01', 'Barber'],
        ['Lisa', 'Active', '2024-02-15', 'Hair Stylist']
      ];
      
      workersSheet.getRange(2, 1, sampleWorkers.length, 4).setValues(sampleWorkers);
    }
    
    // Setup Services sheet
    const servicesSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.SERVICES);
    if (servicesSheet.getLastRow() === 0) {
      servicesSheet.getRange(1, 1, 1, 4).setValues([[
        'Category', 'Service_Name', 'Price', 'Status'
      ]]);
      
      // Add sample services
      const sampleServices = [
        ['Hair Services', 'Basic Hair Cut', 15, 'Active'],
        ['Hair Services', 'Premium Hair Cut', 25, 'Active'],
        ['Hair Services', 'Hair Styling', 20, 'Active'],
        ['Hair Services', 'Hair Wash & Blow Dry', 12, 'Active'],
        ['Hair Services', 'Hair Coloring', 45, 'Active'],
        ['Hair Services', 'Hair Treatment', 35, 'Active'],
        ['Hair Services', 'Highlights', 60, 'Active'],
        ['Shaving Services', 'Basic Shave', 8, 'Active'],
        ['Shaving Services', 'Premium Shave', 15, 'Active'],
        ['Shaving Services', 'Beard Trim', 10, 'Active'],
        ['Shaving Services', 'Mustache Trim', 5, 'Active'],
        ['Facial Services', 'Basic Facial', 25, 'Active'],
        ['Facial Services', 'Deep Cleansing Facial', 40, 'Active'],
        ['Facial Services', 'Anti-Aging Facial', 50, 'Active']
      ];
      
      servicesSheet.getRange(2, 1, sampleServices.length, 4).setValues(sampleServices);
    }
    
    // Setup Daily_Summary sheet
    const dailySummarySheet = spreadsheet.getSheetByName(CONFIG.SHEETS.DAILY_SUMMARY);
    if (dailySummarySheet.getLastRow() === 0) {
      dailySummarySheet.getRange(1, 1, 1, 6).setValues([[
        'Date', 'Total_Sales', 'Transaction_Count', 'Cash_Total', 'Card_Total', 'Worker_Stats'
      ]]);
    }
    
    // Setup Settings sheet
    const settingsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.SETTINGS);
    if (settingsSheet.getLastRow() === 0) {
      settingsSheet.getRange(1, 1, 1, 3).setValues([[
        'Setting_Name', 'Setting_Value', 'Description'
      ]]);
      
      // Add default settings
      const defaultSettings = [
        ['salonName', CONFIG.SALON_NAME, 'Name of the salon'],
        ['currency', 'USD', 'Default currency'],
        ['timezone', CONFIG.TIMEZONE, 'Timezone for the salon'],
        ['version', '1.0', 'System version']
      ];
      
      settingsSheet.getRange(2, 1, defaultSettings.length, 3).setValues(defaultSettings);
    }
    
    console.log('Spreadsheet setup completed successfully');
    
  } catch (error) {
    console.error('Error setting up spreadsheet:', error);
    throw error;
  }
}
