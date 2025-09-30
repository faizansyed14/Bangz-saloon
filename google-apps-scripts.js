/**
 * BANGZ SALOON - Simple Google Apps Script
 * This is a simplified version to eliminate any potential issues
 */

// Configuration
const CONFIG = {
  SPREADSHEET_ID: '1W79dhvJjNXIhJ80U3XS4MKcJNerGis1HIV_DFpanmmA', // To be set in Script Properties - Get from your Google Sheets URL
  SALON_NAME: 'BANGZ SALOON',
  TIMEZONE: 'Asia/Dubai',
  LOCATION: 'Dubai, UAE',
  SHEETS: {
    TRANSACTIONS: 'Transactions',
    DAILY_TRANSACTIONS: 'Daily_Transactions',
    WORKERS: 'Workers',
    SERVICES: 'Services',
    DAILY_SUMMARY: 'Daily_Summary',
    SETTINGS: 'Settings',
    USERS: 'Users'
  }
};

/**
 * Handle OPTIONS request for CORS preflight
 */
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Create response with CORS headers
 */
function createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Get the correct spreadsheet
 */
function getSpreadsheet() {
  return CONFIG.SPREADSHEET_ID ? 
    SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID) : 
    getSpreadsheet();
}

/**
 * Main entry point for HTTP requests
 */
function doPost(e) {
  try {
    console.log('Received POST request:', e);
    
    let data = {};
    
    // Handle FormData (from client)
    if (e.parameter.data) {
      try {
        data = JSON.parse(e.parameter.data);
        console.log('Parsed FormData:', data);
      } catch (parseError) {
        console.log('Error parsing FormData:', parseError);
        data = {};
      }
    }
    // Handle JSON (fallback)
    else if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
        console.log('Parsed JSON:', data);
      } catch (parseError) {
        console.log('Error parsing JSON:', parseError);
        data = {};
      }
    }
    // Handle direct parameters (another fallback)
    else {
      data = e.parameter;
      console.log('Using direct parameters:', data);
    }
    
    const endpoint = e.parameter.endpoint;
    console.log('Endpoint:', endpoint);
    
    if (!endpoint) {
      throw new Error('No endpoint specified');
    }
    
    let result = {};
    
    switch (endpoint) {
      case 'authenticateUser':
        result = authenticateUser(data);
        break;
      case 'getUsers':
        result = getUsers();
        break;
      case 'createUser':
        result = createUser(data);
        break;
      case 'updateUser':
        result = updateUser(data);
        break;
      case 'deleteUser':
        result = deleteUser(data);
        break;
      case 'getWorkers':
        result = getWorkers();
        break;
      case 'createWorker':
        result = createWorker(data);
        break;
      case 'updateWorker':
        result = updateWorker(data);
        break;
      case 'deleteWorker':
        result = deleteWorker(data);
        break;
      case 'getTransactions':
        result = getTransactions();
        break;
      case 'getAllTransactions':
        result = getTransactions();
        break;
      case 'getServices':
        result = getServices();
        break;
      case 'addService':
        result = addService(data);
        break;
      case 'updateService':
        result = updateService(data);
        break;
      case 'deleteService':
        result = deleteService(data);
        break;
      case 'getDailyData':
        result = getDailyData(data);
        break;
      case 'addServiceEntry':
        result = createTransaction(data);
        break;
      case 'createTransaction':
        console.log('=== CREATE TRANSACTION DEBUG ===');
        console.log('Raw data received:', data);
        console.log('Data type:', typeof data);
        console.log('Data keys:', Object.keys(data));
        console.log('Cost value:', data.cost);
        console.log('Amount value:', data.amount);
        console.log('Worker value:', data.worker);
        console.log('Service value:', data.service);
        console.log('Payment value:', data.payment);
        console.log('================================');
        result = createTransaction(data);
        break;
      case 'updateTransaction':
        result = updateTransaction(data);
        break;
      case 'deleteTransaction':
        result = deleteTransaction(data);
        break;
      case 'setupSpreadsheet':
        result = setupSpreadsheet();
        break;
      case 'test':
        result = { success: true, message: "Deployment working!", timestamp: new Date().toISOString() };
        break;
      case 'testServiceEndpoint':
        result = { success: true, message: "Service endpoints are working!", timestamp: new Date().toISOString() };
        break;
      case 'testAuth':
        result = testAuthentication();
        break;
      case 'addTransactionHeaders':
        result = addTransactionHeaders();
        break;
      case 'addMissingTransactionIds':
        result = addMissingTransactionIds();
        break;
      case 'getAllSales':
        result = getAllSales(data);
        break;
      case 'setupDailyEmailTrigger':
        result = setupDailyEmailTrigger();
        break;
      case 'sendDailyReport':
        result = sendDailyReport();
        break;
      case 'testEmail':
        result = testEmail();
        break;
      case 'checkEmailPermissions':
        result = checkEmailPermissions();
        break;
      case 'updateSheetStructure':
        result = updateSheetStructure();
        break;
      case 'getDailyData':
        result = getDailyData(data);
        break;
      default:
        throw new Error(`Unknown endpoint: ${endpoint}`);
    }
    
    return createResponse(result);
      
  } catch (error) {
    console.error('Error in doPost:', error);
    return createResponse({ 
      success: false, 
      error: error.message 
    });
  }
}

/**
 * Handle GET requests
 */
function doGet(e) {
  try {
    console.log('Received GET request:', e);
    
    const endpoint = e.parameter.endpoint;
    console.log('Endpoint:', endpoint);
    
    if (!endpoint) {
      throw new Error('No endpoint specified');
    }
    
    // Extract parameters for GET requests
    const data = {
      date: e.parameter.date,
      category: e.parameter.category
    };
    
    let result = {};
    
    switch (endpoint) {
      case 'getUsers':
        result = getUsers();
        break;
      case 'getWorkers':
        result = getWorkers();
        break;
      case 'getTransactions':
        result = getTransactions();
        break;
      case 'getAllTransactions':
        result = getTransactions();
        break;
      case 'getServices':
        result = getServices();
        break;
      case 'addService':
        result = addService(data);
        break;
      case 'updateService':
        result = updateService(data);
        break;
      case 'deleteService':
        result = deleteService(data);
        break;
      case 'getDailyData':
        result = getDailyData(data);
        break;
      case 'setupSpreadsheet':
        result = setupSpreadsheet();
        break;
      case 'test':
        result = { success: true, message: "Deployment working!", timestamp: new Date().toISOString() };
        break;
      case 'addTransactionHeaders':
        result = addTransactionHeaders();
        break;
      case 'addMissingTransactionIds':
        result = addMissingTransactionIds();
        break;
      case 'getAllSales':
        result = getAllSales(data);
        break;
      case 'setupDailyEmailTrigger':
        result = setupDailyEmailTrigger();
        break;
      case 'sendDailyReport':
        result = sendDailyReport();
        break;
      case 'testEmail':
        result = testEmail();
        break;
      case 'checkEmailPermissions':
        result = checkEmailPermissions();
        break;
      case 'updateSheetStructure':
        result = updateSheetStructure();
        break;
      case 'getDailyData':
        result = getDailyData(data);
        break;
      default:
        throw new Error(`Unknown endpoint: ${endpoint}`);
    }
    
    return createResponse(result);
      
  } catch (error) {
    console.error('Error in doGet:', error);
    return createResponse({ 
      success: false, 
      error: error.message 
    });
  }
}

/**
 * Authenticate user
 */
function authenticateUser(data) {
  try {
    console.log('Authenticating user:', data.email);
    const { email, password } = data;
    
    const spreadsheet = getSpreadsheet();
    console.log('Using spreadsheet ID:', spreadsheet.getId());
    
    const sheet = spreadsheet.getSheetByName('Users');
    if (!sheet) {
      console.log('Users sheet not found');
      return { success: false, error: 'Users sheet not found' };
    }
    
    const userData = sheet.getDataRange().getValues();
    console.log('User data rows:', userData.length);
    console.log('User data:', userData);
    
    for (let i = 1; i < userData.length; i++) {
      const row = userData[i];
      const userEmail = row[1]; // Email is in column B (index 1)
      const storedPasswordHash = row[2]; // Password hash is in column C (index 2)
      
      console.log(`Checking row ${i}: email="${userEmail}", looking for="${email}"`);
      
      if (userEmail === email) {
        // Hash the provided password
        const hashBytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password, Utilities.Charset.UTF_8);
        const providedPasswordHash = hashBytes.map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
        
        if (storedPasswordHash === providedPasswordHash) {
          const user = {
            name: row[0] || 'User',
            email: row[1] || '',
            role: row[3] || 'Worker',
            phone: row[4] || '',
            status: row[5] || 'Active'
          };
          
          console.log('User authenticated successfully:', user.email);
          return { success: true, user: user };
        } else {
          return { success: false, error: 'Invalid password' };
        }
      }
    }
    
    return { success: false, error: 'User not found' };
  } catch (error) {
    console.error('Error authenticating user:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Get all users
 */
function getUsers() {
  try {
    const sheet = getSpreadsheet().getSheetByName('Users');
    if (!sheet) {
      return { success: false, error: 'Users sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    const users = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      users.push({
        name: row[0] || '',
        email: row[1] || '',
        role: row[3] || 'Worker',
        phone: row[4] || '',
        status: row[5] || 'Active',
        createdat: row[6] || '',
        updatedat: row[7] || ''
      });
    }
    
    return { success: true, data: users };
  } catch (error) {
    console.error('Error getting users:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Create new user
 */
function createUser(data) {
  try {
    const sheet = getSpreadsheet().getSheetByName('Users');
    if (!sheet) {
      return { success: false, error: 'Users sheet not found' };
    }
    
    // Check if user already exists
    const existingData = sheet.getDataRange().getValues();
    for (let i = 1; i < existingData.length; i++) {
      if (existingData[i][1] === data.email) {
        return { success: false, error: 'User with this email already exists' };
      }
    }
    
    // Hash the password
    const hashedPassword = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, data.password, Utilities.Charset.UTF_8);
    const hashedPasswordString = hashedPassword.map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
    
    const newRow = [
      data.name || '',
      data.email || '',
      hashedPasswordString,
      data.role || 'Worker',
      data.phone || '',
      data.status || 'Active',
      new Date().toISOString(),
      new Date().toISOString()
    ];
    
    sheet.appendRow(newRow);
    
    return { success: true, message: 'User created successfully' };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Update user
 */
function updateUser(data) {
  try {
    const sheet = getSpreadsheet().getSheetByName('Users');
    if (!sheet) {
      return { success: false, error: 'Users sheet not found' };
    }
    
    const userData = sheet.getDataRange().getValues();
    
    for (let i = 1; i < userData.length; i++) {
      if (userData[i][1] === data.email) {
        // Update the row
        const row = i + 1;
        
        if (data.name) sheet.getRange(row, 1).setValue(data.name);
        if (data.password) {
          const hashedPassword = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, data.password, Utilities.Charset.UTF_8);
          const hashedPasswordString = hashedPassword.map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
          sheet.getRange(row, 3).setValue(hashedPasswordString);
        }
        if (data.role) sheet.getRange(row, 4).setValue(data.role);
        if (data.phone) sheet.getRange(row, 5).setValue(data.phone);
        if (data.status) sheet.getRange(row, 6).setValue(data.status);
        
        sheet.getRange(row, 8).setValue(new Date().toISOString());
        
        return { success: true, message: 'User updated successfully' };
      }
    }
    
    return { success: false, error: 'User not found' };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Delete user
 */
function deleteUser(data) {
  try {
    const sheet = getSpreadsheet().getSheetByName('Users');
    if (!sheet) {
      return { success: false, error: 'Users sheet not found' };
    }
    
    const userData = sheet.getDataRange().getValues();
    
    for (let i = 1; i < userData.length; i++) {
      if (userData[i][1] === data.email) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'User deleted successfully' };
      }
    }
    
    return { success: false, error: 'User not found' };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Get all workers
 */
function getWorkers() {
  try {
    const sheet = getSpreadsheet().getSheetByName('Workers');
    if (!sheet) {
      return { success: false, error: 'Workers sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    const workers = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      workers.push({
        name: row[0] || '',
        email: row[1] || '',
        phone: row[2] || '',
        role: row[3] || 'Worker',
        status: row[4] || 'Active',
        createdat: row[5] || '',
        updatedat: row[6] || ''
      });
    }
    
    return { success: true, data: workers };
  } catch (error) {
    console.error('Error getting workers:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Create new worker
 */
function createWorker(data) {
  try {
    const sheet = getSpreadsheet().getSheetByName('Workers');
    if (!sheet) {
      return { success: false, error: 'Workers sheet not found' };
    }
    
    const newRow = [
      data.name || '',
      data.email || '',
      data.phone || '',
      data.role || 'Worker',
      data.status || 'Active',
      new Date().toISOString(),
      new Date().toISOString()
    ];
    
    sheet.appendRow(newRow);
    
    return { success: true, message: 'Worker created successfully' };
  } catch (error) {
    console.error('Error creating worker:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Update worker
 */
function updateWorker(data) {
  try {
    const sheet = getSpreadsheet().getSheetByName('Workers');
    if (!sheet) {
      return { success: false, error: 'Workers sheet not found' };
    }
    
    const workerData = sheet.getDataRange().getValues();
    
    for (let i = 1; i < workerData.length; i++) {
      if (workerData[i][1] === data.email) {
        const row = i + 1;
        
        if (data.name) sheet.getRange(row, 1).setValue(data.name);
        if (data.phone) sheet.getRange(row, 3).setValue(data.phone);
        if (data.role) sheet.getRange(row, 4).setValue(data.role);
        if (data.status) sheet.getRange(row, 5).setValue(data.status);
        
        sheet.getRange(row, 7).setValue(new Date().toISOString());
        
        return { success: true, message: 'Worker updated successfully' };
      }
    }
    
    return { success: false, error: 'Worker not found' };
  } catch (error) {
    console.error('Error updating worker:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Delete worker
 */
function deleteWorker(data) {
  try {
    const sheet = getSpreadsheet().getSheetByName('Workers');
    if (!sheet) {
      return { success: false, error: 'Workers sheet not found' };
    }
    
    const workerData = sheet.getDataRange().getValues();
    
    for (let i = 1; i < workerData.length; i++) {
      if (workerData[i][1] === data.email) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'Worker deleted successfully' };
      }
    }
    
    return { success: false, error: 'Worker not found' };
  } catch (error) {
    console.error('Error deleting worker:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Get all services
 */
function getServices() {
  try {
    const sheet = getSpreadsheet().getSheetByName('Services');
    if (!sheet) {
      return { success: false, error: 'Services sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    const services = {};
    
    // Process services data from sheet
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const category = row[0] || '';
      const serviceName = row[1] || '';
      const cost = parseFloat(row[2]) || 0;
      
      if (category && serviceName && cost > 0) {
        if (!services[category]) {
          services[category] = {};
        }
        services[category][serviceName] = cost;
      }
    }
    
    return { success: true, data: services };
  } catch (error) {
    console.error('Error getting services:', error);
    return { success: false, error: error.toString() };
  }
}


/**
 * Get daily data for dashboard
 */
function getDailyData(data) {
  try {
    console.log('Getting daily data for date:', data.date);
    
    const sheet = getSpreadsheet().getSheetByName('Transactions');
    if (!sheet) {
      console.log('Transactions sheet not found');
      return { success: false, error: 'Transactions sheet not found' };
    }
    
    const allData = sheet.getDataRange().getValues();
    const targetDate = data.date || new Date().toLocaleDateString('en-GB');
    
    console.log('Looking for transactions on date:', targetDate);
    console.log('Total transactions in sheet:', allData.length);
    
    // Filter transactions for the target date
    const dailyTransactions = [];
    let startIndex = 0;
    if (allData.length > 0) {
      const firstRow = allData[0];
      const isHeaderRow = firstRow[0] === 'ID' || firstRow[1] === 'Date' || firstRow[3] === 'Service';
      if (isHeaderRow) {
        startIndex = 1; // Skip header row
      }
    }
    
    for (let i = startIndex; i < allData.length; i++) {
      const row = allData[i];
      const transactionDate = row[1]; // Date is in column B (index 1)
      
      console.log(`Checking transaction ${i}: date="${transactionDate}" vs target="${targetDate}"`);
      
      if (transactionDate === targetDate) {
        console.log(`✅ Match found for transaction ${i}`);
        console.log(`Transaction row data:`, row);
        console.log(`Worker field (row[4]):`, row[4]);
        
        const transaction = {
          id: row[0] || '',
          date: row[1] || '',
          customer: row[2] || '',
          service: row[3] || '',
          worker: row[4] || 'Unknown Worker',
          amount: parseFloat(row[5]) || 0,
          tip: parseFloat(row[6]) || 0,
          paymentMethod: row[7] || '',
          notes: row[8] || '',
          phone: row[9] || '',
          category: row[10] || '',
          createdAt: row[11] || '',
          updatedAt: row[12] || ''
        };
        
        console.log(`Transaction created:`, transaction);
        console.log(`Phone field:`, row[9]);
        console.log(`CreatedAt field:`, row[10]);
        console.log(`UpdatedAt field:`, row[11]);
        
        dailyTransactions.push(transaction);
      }
    }
    
    console.log('Found daily transactions:', dailyTransactions.length);
    
    // Calculate statistics
    const totalSales = dailyTransactions.reduce((sum, t) => sum + t.amount, 0);
    const cashTotal = dailyTransactions.filter(t => t.paymentMethod === 'Cash').reduce((sum, t) => sum + t.amount, 0);
    const cardTotal = dailyTransactions.filter(t => t.paymentMethod === 'Card').reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate worker stats
    const workerStats = {};
    dailyTransactions.forEach(transaction => {
      const worker = transaction.worker;
      if (!workerStats[worker]) {
        workerStats[worker] = { total: 0, count: 0, transactions: [] };
      }
      workerStats[worker].total += transaction.amount;
      workerStats[worker].count += 1;
      workerStats[worker].transactions.push(transaction);
    });
    
    const result = {
      success: true,
      data: {
        date: targetDate,
        totalSales: totalSales,
        transactionCount: dailyTransactions.length,
        cashTotal: cashTotal,
        cardTotal: cardTotal,
        workerStats: workerStats,
        recentTransactions: dailyTransactions.slice(-5), // Last 5 transactions
        entries: dailyTransactions
      }
    };
    
    console.log('Daily data result:', result);
    return result;
  } catch (error) {
    console.error('Error getting daily data:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Get all transactions
 */
function getTransactions() {
  try {
    const sheet = getSpreadsheet().getSheetByName('Transactions');
    if (!sheet) {
      return { success: false, error: 'Transactions sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    const transactions = [];
    
    // Check if first row is headers, then start from appropriate index
    let startIndex = 0;
    if (data.length > 0) {
      const firstRow = data[0];
      const isHeaderRow = firstRow[0] === 'ID' || firstRow[1] === 'Date' || firstRow[3] === 'Service';
      if (isHeaderRow) {
        startIndex = 1; // Skip header row
      }
    }
    
    for (let i = startIndex; i < data.length; i++) {
      const row = data[i];
      transactions.push({
        id: row[0] || '',
        date: row[1] || '',
        customerName: row[2] || '',
        service: row[3] || '',
        worker: row[4] || '',
        amount: row[5] || 0,
        tip: row[6] || 0,
        paymentMethod: row[7] || '',
        notes: row[8] || '',
        phone: row[9] || '',
        category: row[10] || '',
        createdat: row[11] || '',
        updatedat: row[12] || ''
      });
    }
    
    return { success: true, data: transactions };
  } catch (error) {
    console.error('Error getting transactions:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Create new transaction
 */
function createTransaction(data) {
  try {
    console.log('Creating transaction with data:', data);
    console.log('Data type:', typeof data);
    console.log('Data keys:', Object.keys(data));
    
    // Log each field individually
    console.log('worker:', data.worker);
    console.log('service:', data.service);
    console.log('cost:', data.cost);
    console.log('payment:', data.payment);
    console.log('customer:', data.customer);
    console.log('customerName:', data.customerName);
    console.log('date:', data.date);
    console.log('tip:', data.tip);
    console.log('category:', data.category);
    console.log('phone:', data.phone);
    
    const sheet = getSpreadsheet().getSheetByName('Transactions');
    if (!sheet) {
      console.log('Transactions sheet not found');
      return { success: false, error: 'Transactions sheet not found' };
    }
    
    // Generate unique ID if not provided
    const transactionId = data.id || 'TXN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    const newRow = [
      transactionId,
      data.date || new Date().toLocaleDateString('en-GB'),
      data.customer || data.customerName || '',
      data.service || '',
      data.worker || '',
      data.cost || data.amount || 0,
      data.tip || 0,
      data.payment || data.paymentMethod || '',
      data.notes || '',
      data.phone || '',
      data.category || '', // Add category field
      new Date().toISOString(),
      new Date().toISOString()
    ];
    
    console.log('Adding transaction row:', newRow);
    console.log('Row length:', newRow.length);
    console.log('Row values:', newRow.map((val, i) => `[${i}]: "${val}"`));
    
    sheet.appendRow(newRow);
    
    
    // Send WhatsApp message if phone number is provided
    if (data.phone && data.phone.trim() !== '') {
      try {
        const whatsappResult = sendWhatsAppMessage({
          phone: data.phone,
          customerName: data.customer || data.customerName || 'Valued Customer',
          service: data.service || '',
          amount: data.cost || data.amount || 0,
          tip: data.tip || 0,
          worker: data.worker || '',
          date: data.date || new Date().toLocaleDateString('en-GB'),
          services: data.services || [] // Individual services for detailed message
        });
        console.log('WhatsApp message result:', whatsappResult);
      } catch (whatsappError) {
        console.log('WhatsApp message failed:', whatsappError);
      }
    }
    
    console.log('Transaction created successfully');
    return { success: true, message: 'Transaction created successfully', data: { id: transactionId } };
  } catch (error) {
    console.error('Error creating transaction:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Update transaction
 */
function updateTransaction(data) {
  try {
    const sheet = getSpreadsheet().getSheetByName('Transactions');
    if (!sheet) {
      return { success: false, error: 'Transactions sheet not found' };
    }
    
    const transactionData = sheet.getDataRange().getValues();
    
    for (let i = 1; i < transactionData.length; i++) {
      if (transactionData[i][0] === data.id) {
        const row = i + 1;
        
        if (data.date) sheet.getRange(row, 2).setValue(data.date);
        if (data.customerName) sheet.getRange(row, 3).setValue(data.customerName);
        if (data.service) sheet.getRange(row, 4).setValue(data.service);
        if (data.worker) sheet.getRange(row, 5).setValue(data.worker);
        if (data.amount) sheet.getRange(row, 6).setValue(data.amount);
        if (data.paymentMethod) sheet.getRange(row, 7).setValue(data.paymentMethod);
        if (data.notes) sheet.getRange(row, 8).setValue(data.notes);
        
        sheet.getRange(row, 10).setValue(new Date().toISOString());
        
        return { success: true, message: 'Transaction updated successfully' };
      }
    }
    
    return { success: false, error: 'Transaction not found' };
  } catch (error) {
    console.error('Error updating transaction:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Delete transaction
 */
function deleteTransaction(data) {
  try {
    console.log('Deleting transaction with data:', data);
    
    const sheet = getSpreadsheet().getSheetByName('Transactions');
    if (!sheet) {
      console.log('Transactions sheet not found');
      return { success: false, error: 'Transactions sheet not found' };
    }
    
    const transactionData = sheet.getDataRange().getValues();
    console.log('Total rows in sheet:', transactionData.length);
    
    // If we have an index, use it directly (1-based for Google Sheets)
    if (data.index !== undefined) {
      // Check if there are headers to adjust the row index
      let headerOffset = 0;
      if (transactionData.length > 0) {
        const firstRow = transactionData[0];
        const isHeaderRow = firstRow[0] === 'ID' || firstRow[1] === 'Date' || firstRow[3] === 'Service';
        if (isHeaderRow) {
          headerOffset = 1; // Account for header row
        }
      }
      
      const rowIndex = data.index + 1 + headerOffset; // +1 for 0-based to 1-based conversion
      console.log('Using index-based deletion, row:', rowIndex);
      
      if (rowIndex > headerOffset && rowIndex <= transactionData.length) {
        sheet.deleteRow(rowIndex);
        console.log('Transaction deleted successfully by index');
        return { success: true, message: 'Transaction deleted successfully' };
      } else {
        console.log('Invalid row index:', rowIndex);
        return { success: false, error: 'Invalid transaction index' };
      }
    }
    
    // If we have an ID, try to find it
    if (data.id) {
      console.log('Looking for transaction with ID:', data.id);
      
      // Check if there are headers to adjust the search
      let startIndex = 0;
      if (transactionData.length > 0) {
        const firstRow = transactionData[0];
        const isHeaderRow = firstRow[0] === 'ID' || firstRow[1] === 'Date' || firstRow[3] === 'Service';
        if (isHeaderRow) {
          startIndex = 1; // Skip header row
        }
      }
      
      for (let i = startIndex; i < transactionData.length; i++) {
        if (transactionData[i][0] === data.id) {
          sheet.deleteRow(i + 1);
          console.log('Transaction deleted successfully by ID');
          return { success: true, message: 'Transaction deleted successfully' };
        }
      }
      console.log('Transaction not found with ID:', data.id);
      return { success: false, error: 'Transaction not found' };
    }
    
    console.log('No valid ID or index provided');
    return { success: false, error: 'No valid transaction identifier provided' };
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Setup spreadsheet with required sheets and data
 */
function setupSpreadsheet() {
  try {
    const spreadsheet = getSpreadsheet();
    
    // Create Users sheet
    let usersSheet = spreadsheet.getSheetByName('Users');
    if (!usersSheet) {
      usersSheet = spreadsheet.insertSheet('Users');
    }
    
    if (usersSheet.getLastRow() === 0) {
      usersSheet.getRange(1, 1, 1, 8).setValues([[
        'Name', 'Email', 'Password_Hash', 'Role', 'Phone', 'Status', 'Created_At', 'Updated_At'
      ]]);
      
      // Add default admin user
      const defaultUsers = [
        ['System Administrator', 'admin@bangzsaloon.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Admin', '', 'Active', new Date().toISOString(), new Date().toISOString()]
      ];
      usersSheet.getRange(2, 1, defaultUsers.length, 8).setValues(defaultUsers);
    }
    
    // Create Workers sheet
    let workersSheet = spreadsheet.getSheetByName('Workers');
    if (!workersSheet) {
      workersSheet = spreadsheet.insertSheet('Workers');
    }
    
    if (workersSheet.getLastRow() === 0) {
      workersSheet.getRange(1, 1, 1, 7).setValues([[
        'Name', 'Email', 'Phone', 'Role', 'Status', 'Created_At', 'Updated_At'
      ]]);
    }
    
    // Create Services sheet
    let servicesSheet = spreadsheet.getSheetByName('Services');
    if (!servicesSheet) {
      servicesSheet = spreadsheet.insertSheet('Services');
    }
    
    if (servicesSheet.getLastRow() === 0) {
      servicesSheet.getRange(1, 1, 1, 3).setValues([[
        'Category', 'Service_Name', 'Cost'
      ]]);
      
      // Add default promotional services
      const defaultServices = [
        ['Promotional', 'Basic Hair Cut', 15],
        ['Promotional', 'Premium Hair Cut', 10],
        ['Promotional', 'Hair Styling', 15],
        ['Promotional', 'head massage', 15],
        ['Promotional', 'Normal Scrub', 20],
        ['Promotional', 'Normal Facial', 30],
        ['Promotional', 'Gold Facial', 50],
        ['Promotional', 'Whiting Facial', 70],
        ['Promotional', 'Dimond Facial', 100],
        ['Promotional', 'Hair color Black', 25],
        ['Promotional', 'Stylish Color', 30],
        ['Promotional', 'Highlights Color', 40],
        ['Promotional', 'Hair SPA', 30],
        ['Promotional', 'Pedicure', 50],
        ['Promotional', 'Menicure', 30]
      ];
      servicesSheet.getRange(2, 1, defaultServices.length, 3).setValues(defaultServices);
    }
    
    // Create Transactions sheet
    let transactionsSheet = spreadsheet.getSheetByName('Transactions');
    if (!transactionsSheet) {
      transactionsSheet = spreadsheet.insertSheet('Transactions');
    }
    
    if (transactionsSheet.getLastRow() === 0) {
      transactionsSheet.getRange(1, 1, 1, 13).setValues([[
        'ID', 'Date', 'Customer_Name', 'Service', 'Worker', 'Amount', 'Tip', 'Payment_Method', 'Notes', 'Phone', 'Category', 'Created_At', 'Updated_At'
      ]]);
    } else {
      // Check if Tip column exists, if not add it
      const headers = transactionsSheet.getRange(1, 1, 1, transactionsSheet.getLastColumn()).getValues()[0];
      const tipColumnIndex = headers.indexOf('Tip');
      
      if (tipColumnIndex === -1) {
        console.log('Tip column not found, adding it...');
        // Insert Tip column after Amount column (column 6)
        transactionsSheet.insertColumnAfter(6);
        transactionsSheet.getRange(1, 7).setValue('Tip');
        
        // Insert Phone column after Notes column (now column 9)
        const notesColumnIndex = headers.indexOf('Notes');
        if (notesColumnIndex !== -1) {
          transactionsSheet.insertColumnAfter(notesColumnIndex + 1);
          transactionsSheet.getRange(1, notesColumnIndex + 2).setValue('Phone');
        }
        
        console.log('Tip and Phone columns added successfully');
      }
    }
    
    
    return { success: true, message: 'Spreadsheet setup completed successfully' };
  } catch (error) {
    console.error('Error setting up spreadsheet:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Debug function to check transactions and dates
 */
function debugTransactions() {
  try {
    const spreadsheet = getSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Transactions');
    
    if (!sheet) {
      return { success: false, error: 'Transactions sheet not found' };
    }
    
    const allData = sheet.getDataRange().getValues();
    const today = new Date().toLocaleDateString('en-GB');
    
    console.log('=== TRANSACTION DEBUG ===');
    console.log('Today date:', today);
    console.log('Total rows in sheet:', allData.length);
    
    if (allData.length > 0) {
      console.log('Headers:', allData[0]);
      
      for (let i = 1; i < allData.length; i++) {
        const row = allData[i];
        console.log(`Row ${i}:`, {
          id: row[0],
          date: row[1],
          customer: row[2],
          service: row[3],
          worker: row[4],
          amount: row[5],
          paymentMethod: row[7]
        });
      }
    }
    
    return {
      success: true,
      today: today,
      totalRows: allData.length,
      headers: allData.length > 0 ? allData[0] : [],
      transactions: allData.slice(1)
    };
  } catch (error) {
    console.error('Debug error:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Clean up unused sheets (Daily_Sales, Daily_Transactions)
 */
function cleanupUnusedSheets() {
  try {
    const spreadsheet = getSpreadsheet();
    const sheetsToDelete = ['Daily_Sales', 'Daily_Transactions'];
    const deletedSheets = [];
    
    sheetsToDelete.forEach(sheetName => {
      const sheet = spreadsheet.getSheetByName(sheetName);
      if (sheet) {
        spreadsheet.deleteSheet(sheet);
        deletedSheets.push(sheetName);
        console.log(`Deleted sheet: ${sheetName}`);
      }
    });
    
    return { 
      success: true, 
      message: `Cleaned up ${deletedSheets.length} unused sheets`,
      deletedSheets: deletedSheets
    };
  } catch (error) {
    console.error('Error cleaning up sheets:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Add a new service to the Services sheet
 */
function addService(data) {
  try {
    console.log('Adding new service:', data);
    
    const sheet = getSpreadsheet().getSheetByName('Services');
    if (!sheet) {
      return { success: false, error: 'Services sheet not found' };
    }
    
    const { category, serviceName, cost } = data;
    
    if (!category || !serviceName || !cost) {
      return { success: false, error: 'Missing required fields: category, serviceName, cost' };
    }
    
    // Check if service already exists
    const allData = sheet.getDataRange().getValues();
    for (let i = 1; i < allData.length; i++) {
      const row = allData[i];
      if (row[0] === category && row[1] === serviceName) {
        return { success: false, error: 'Service already exists in this category' };
      }
    }
    
    // Add new service
    const newRow = [category, serviceName, parseFloat(cost)];
    sheet.appendRow(newRow);
    
    return { 
      success: true, 
      message: `Service "${serviceName}" added successfully to ${category} category`,
      data: { category, serviceName, cost: parseFloat(cost) }
    };
  } catch (error) {
    console.error('Error adding service:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Update an existing service in the Services sheet
 */
function updateService(data) {
  try {
    console.log('Updating service:', data);
    
    const sheet = getSpreadsheet().getSheetByName('Services');
    if (!sheet) {
      return { success: false, error: 'Services sheet not found' };
    }
    
    const { oldCategory, oldServiceName, category, serviceName, cost } = data;
    
    if (!oldCategory || !oldServiceName || !category || !serviceName || !cost) {
      return { success: false, error: 'Missing required fields' };
    }
    
    const allData = sheet.getDataRange().getValues();
    let found = false;
    
    for (let i = 1; i < allData.length; i++) {
      const row = allData[i];
      if (row[0] === oldCategory && row[1] === oldServiceName) {
        // Update the row
        sheet.getRange(i + 1, 1, 1, 3).setValues([[category, serviceName, parseFloat(cost)]]);
        found = true;
        break;
      }
    }
    
    if (!found) {
      return { success: false, error: 'Service not found' };
    }
    
    return { 
      success: true, 
      message: `Service updated successfully`,
      data: { category, serviceName, cost: parseFloat(cost) }
    };
  } catch (error) {
    console.error('Error updating service:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Delete a service from the Services sheet
 */
function deleteService(data) {
  try {
    console.log('Deleting service:', data);
    
    const sheet = getSpreadsheet().getSheetByName('Services');
    if (!sheet) {
      return { success: false, error: 'Services sheet not found' };
    }
    
    const { category, serviceName } = data;
    
    if (!category || !serviceName) {
      return { success: false, error: 'Missing required fields: category, serviceName' };
    }
    
    const allData = sheet.getDataRange().getValues();
    let found = false;
    
    for (let i = 1; i < allData.length; i++) {
      const row = allData[i];
      if (row[0] === category && row[1] === serviceName) {
        // Delete the row
        sheet.deleteRow(i + 1);
        found = true;
        break;
      }
    }
    
    if (!found) {
      return { success: false, error: 'Service not found' };
    }
    
    return { 
      success: true, 
      message: `Service "${serviceName}" deleted successfully from ${category} category`
    };
  } catch (error) {
    console.error('Error deleting service:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Manually add services data to Services sheet
 */
function addServicesData() {
  try {
    const spreadsheet = getSpreadsheet();
    let servicesSheet = spreadsheet.getSheetByName('Services');
    
    if (!servicesSheet) {
      servicesSheet = spreadsheet.insertSheet('Services');
      // Add headers
      servicesSheet.getRange(1, 1, 1, 3).setValues([[
        'Category', 'Service_Name', 'Cost'
      ]]);
    }
    
    // Clear existing data (except headers)
    const lastRow = servicesSheet.getLastRow();
    if (lastRow > 1) {
      servicesSheet.getRange(2, 1, lastRow - 1, 3).clear();
    }
    
    // Add promotional services data
    const servicesData = [
      ['Promotional', 'Basic Hair Cut', 15],
      ['Promotional', 'Premium Hair Cut', 10],
      ['Promotional', 'Hair Styling', 15],
      ['Promotional', 'head massage', 15],
      ['Promotional', 'Normal Scrub', 20],
      ['Promotional', 'Normal Facial', 30],
      ['Promotional', 'Gold Facial', 50],
      ['Promotional', 'Whiting Facial', 70],
      ['Promotional', 'Dimond Facial', 100],
      ['Promotional', 'Hair color Black', 25],
      ['Promotional', 'Stylish Color', 30],
      ['Promotional', 'Highlights Color', 40],
      ['Promotional', 'Hair SPA', 30],
      ['Promotional', 'Pedicure', 50],
      ['Promotional', 'Menicure', 30]
    ];
    
    // Add the data starting from row 2
    servicesSheet.getRange(2, 1, servicesData.length, 3).setValues(servicesData);
    
    return { 
      success: true, 
      message: `Successfully added ${servicesData.length} services to Services sheet` 
    };
  } catch (error) {
    console.error('Error adding services data:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Test authentication function
 */
function testAuthentication() {
  try {
    const spreadsheet = getSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Users');
    
    if (!sheet) {
      return { 
        success: false, 
        error: 'Users sheet not found',
        spreadsheetId: spreadsheet.getId()
      };
    }
    
    const userData = sheet.getDataRange().getValues();
    
    // Test the actual authentication logic
    const testEmail = 'admin@bangzsaloon.com';
    let foundUser = false;
    let userDetails = null;
    
    for (let i = 1; i < userData.length; i++) {
      const row = userData[i];
      const userEmail = row[1];
      if (userEmail === testEmail) {
        foundUser = true;
        userDetails = {
          name: row[0],
          email: row[1],
          role: row[3],
          status: row[5]
        };
        break;
      }
    }
    
    return {
      success: true,
      message: 'Authentication test completed',
      spreadsheetId: spreadsheet.getId(),
      userDataRows: userData.length,
      testEmail: testEmail,
      foundUser: foundUser,
      userDetails: userDetails,
      allUserEmails: userData.slice(1).map(row => row[1])
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.toString() 
    };
  }
}

/**
 * Add headers to Transactions sheet
 */
function addTransactionHeaders() {
  try {
    console.log('Adding headers to Transactions sheet');
    
    const spreadsheet = getSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Transactions');
    
    if (!sheet) {
      return { success: false, error: 'Transactions sheet not found' };
    }
    
    // Get current data
    const data = sheet.getDataRange().getValues();
    console.log('Current data rows:', data.length);
    
    // Check if first row looks like headers
    if (data.length > 0) {
      const firstRow = data[0];
      const isHeaderRow = firstRow[0] === 'ID' || firstRow[1] === 'Date' || firstRow[3] === 'Service';
      
      if (!isHeaderRow) {
        console.log('No headers found, adding headers and shifting data down');
        
        // Insert a new row at the top
        sheet.insertRowBefore(1);
        
        // Add headers to the first row
        sheet.getRange(1, 1, 1, 10).setValues([[
          'ID', 'Date', 'Customer_Name', 'Service', 'Worker', 'Amount', 'Payment_Method', 'Notes', 'Created_At', 'Updated_At'
        ]]);
        
        console.log('Headers added successfully');
        return { 
          success: true, 
          message: 'Headers added to Transactions sheet successfully',
          rowsAffected: data.length
        };
      } else {
        console.log('Headers already exist');
        return { 
          success: true, 
          message: 'Headers already exist in Transactions sheet'
        };
      }
    } else {
      // Sheet is empty, just add headers
      sheet.getRange(1, 1, 1, 10).setValues([[
        'ID', 'Date', 'Customer_Name', 'Service', 'Worker', 'Amount', 'Payment_Method', 'Notes', 'Created_At', 'Updated_At'
      ]]);
      
      return { 
        success: true, 
        message: 'Headers added to empty Transactions sheet'
      };
    }
  } catch (error) {
    console.error('Error adding transaction headers:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Add missing transaction IDs to existing transactions
 */
function addMissingTransactionIds() {
  try {
    console.log('Adding missing transaction IDs');
    
    const spreadsheet = getSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Transactions');
    
    if (!sheet) {
      return { success: false, error: 'Transactions sheet not found' };
    }
    
    // Get current data
    const data = sheet.getDataRange().getValues();
    console.log('Current data rows:', data.length);
    
    if (data.length === 0) {
      return { success: true, message: 'No transactions found' };
    }
    
    // Check if first row is headers
    let startIndex = 0;
    let hasHeaders = false;
    if (data.length > 0) {
      const firstRow = data[0];
      const isHeaderRow = firstRow[0] === 'ID' || firstRow[1] === 'Date' || firstRow[3] === 'Service';
      if (isHeaderRow) {
        startIndex = 1; // Skip header row
        hasHeaders = true;
      }
    }
    
    let updatedCount = 0;
    
    // Check each transaction row for missing IDs
    for (let i = startIndex; i < data.length; i++) {
      const row = data[i];
      const currentId = row[0]; // ID is in first column
      
      // If ID is empty or just whitespace, generate a new one
      if (!currentId || currentId.toString().trim() === '') {
        const newId = 'TXN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        // Update the ID in the sheet (row i+1 because Google Sheets is 1-based)
        sheet.getRange(i + 1, 1).setValue(newId);
        updatedCount++;
        
        console.log(`Updated transaction ${i} with ID: ${newId}`);
      }
    }
    
    console.log(`Updated ${updatedCount} transactions with missing IDs`);
    
    return { 
      success: true, 
      message: `Successfully added IDs to ${updatedCount} transactions`,
      updatedCount: updatedCount,
      totalTransactions: data.length - startIndex
    };
  } catch (error) {
    console.error('Error adding missing transaction IDs:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Get all sales data with worker breakdown
 */
function getAllSales(data) {
  try {
    console.log('Getting all sales data');
    
    const sheet = getSpreadsheet().getSheetByName('Transactions');
    if (!sheet) {
      return { success: false, error: 'Transactions sheet not found' };
    }
    
    const allData = sheet.getDataRange().getValues();
    const targetDate = data.date || new Date().toLocaleDateString('en-GB');
    
    // Check if first row is headers
    let startIndex = 0;
    if (allData.length > 0) {
      const firstRow = allData[0];
      const isHeaderRow = firstRow[0] === 'ID' || firstRow[1] === 'Date' || firstRow[3] === 'Service';
      if (isHeaderRow) {
        startIndex = 1; // Skip header row
      }
    }
    
    // Filter transactions for the target date or get all if no date specified
    const filteredTransactions = [];
    for (let i = startIndex; i < allData.length; i++) {
      const row = allData[i];
      const transactionDate = row[1]; // Date is in column B (index 1)
      
      if (!data.date || transactionDate === targetDate) {
        filteredTransactions.push({
          id: row[0] || '',
          date: row[1] || '',
          customer: row[2] || '',
          service: row[3] || '',
          worker: row[4] || '',
          amount: parseFloat(row[5]) || 0,
          paymentMethod: row[6] || '',
          notes: row[7] || '',
          phone: row[8] || '',
          category: row[9] || '',
          createdAt: row[10] || '',
          updatedAt: row[11] || ''
        });
      }
    }
    
    // Calculate worker statistics
    const workerStats = {};
    let totalSales = 0;
    let totalTransactions = filteredTransactions.length;
    let cashTotal = 0;
    let cardTotal = 0;
    
    filteredTransactions.forEach(transaction => {
      const worker = transaction.worker;
      const amount = transaction.amount;
      
      if (!workerStats[worker]) {
        workerStats[worker] = {
          total: 0,
          count: 0,
          cashTotal: 0,
          cardTotal: 0,
          transactions: []
        };
      }
      
      workerStats[worker].total += amount;
      workerStats[worker].count += 1;
      workerStats[worker].transactions.push(transaction);
      
      if (transaction.paymentMethod === 'Cash') {
        workerStats[worker].cashTotal += amount;
        cashTotal += amount;
      } else if (transaction.paymentMethod === 'Card') {
        workerStats[worker].cardTotal += amount;
        cardTotal += amount;
      }
      
      totalSales += amount;
    });
    
    return {
      success: true,
      data: {
        date: targetDate,
        totalSales: totalSales,
        totalTransactions: totalTransactions,
        cashTotal: cashTotal,
        cardTotal: cardTotal,
        workerStats: workerStats,
        transactions: filteredTransactions
      }
    };
  } catch (error) {
    console.error('Error getting all sales:', error);
    return { success: false, error: error.toString() };
  }
}


/**
 * Setup daily email trigger for 7 AM
 */
function setupDailyEmailTrigger() {
  try {
    console.log('Setting up daily email trigger');
    
    // Delete existing triggers first
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'sendDailyReport') {
        ScriptApp.deleteTrigger(trigger);
        console.log('Deleted existing daily email trigger');
      }
    });
    
    // Create new trigger for 7 AM daily
    ScriptApp.newTrigger('sendDailyReport')
      .timeBased()
      .everyDays(1)
      .atHour(7) // 7 AM
      .create();
    
    console.log('Daily email trigger created for 7 AM');
    
    return {
      success: true,
      message: 'Daily email trigger setup successfully for 7 AM'
    };
  } catch (error) {
    console.error('Error setting up daily email trigger:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Send daily sales report via email
 */
function sendDailyReport() {
  try {
    console.log('Sending daily sales report');
    
    const today = new Date();
    const dateString = today.toLocaleDateString('en-GB');
    
    // Get today's sales data
    const salesData = getAllSales({ date: dateString });
    
    if (!salesData.success) {
      throw new Error('Failed to get sales data: ' + salesData.error);
    }
    
    const data = salesData.data;
    
    // Generate email content
    const emailContent = generateDailyReportEmail(data, dateString);
    
    // Send email
    const recipient = 'bangzsaloondubai@gmail.com';
    const subject = `BANGZ SALOON - Daily Sales Report - ${dateString}`;
    
    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      htmlBody: emailContent
    });
    
    console.log(`Daily sales report sent to ${recipient} for ${dateString}`);
    
    return {
      success: true,
      message: `Daily sales report sent successfully for ${dateString}`,
      recipient: recipient,
      date: dateString
    };
  } catch (error) {
    console.error('Error sending daily sales report:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Generate HTML email content for daily report
 */
function generateDailyReportEmail(data, date) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background-color: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
            .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
            .content { padding: 30px; }
            .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
            .summary-card { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; text-align: center; }
            .summary-card h3 { margin: 0 0 10px 0; color: #6c757d; font-size: 14px; font-weight: 500; }
            .summary-value { font-size: 24px; font-weight: bold; color: #8B5CF6; margin: 0; }
            .worker-section { margin-bottom: 30px; }
            .worker-section h3 { color: #343a40; margin-bottom: 20px; font-size: 20px; }
            .worker-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
            .worker-card { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; }
            .worker-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #dee2e6; }
            .worker-name { font-size: 18px; font-weight: bold; color: #343a40; margin: 0; }
            .worker-total { font-size: 18px; font-weight: bold; color: #8B5CF6; }
            .worker-stats { display: flex; flex-direction: column; gap: 8px; }
            .stat-row { display: flex; justify-content: space-between; align-items: center; }
            .stat-label { color: #6c757d; font-size: 14px; }
            .stat-value { color: #343a40; font-size: 14px; font-weight: 600; }
            .transactions-section { margin-top: 30px; }
            .transactions-section h3 { color: #343a40; margin-bottom: 20px; font-size: 20px; }
            .transactions-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .transactions-table th, .transactions-table td { padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6; }
            .transactions-table th { background: #f8f9fa; color: #343a40; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
            .transactions-table td { color: #6c757d; font-size: 14px; }
            .transactions-table tbody tr:hover { background: #f8f9fa; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #6c757d; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>BANGZ SALOON</h1>
                <p>Daily Sales Report - ${date}</p>
            </div>
            
            <div class="content">
                <div class="summary-cards">
                    <div class="summary-card">
                        <h3>Total Sales Today</h3>
                        <div class="summary-value">${data.totalSales.toFixed(2)} AED</div>
                    </div>
                    <div class="summary-card">
                        <h3>Total Transactions</h3>
                        <div class="summary-value">${data.totalTransactions}</div>
                    </div>
                    <div class="summary-card">
                        <h3>Active Workers</h3>
                        <div class="summary-value">${Object.keys(data.workerStats).length}</div>
                    </div>
                </div>
                
                <div class="worker-section">
                    <h3>Sales by Worker</h3>
                    <div class="worker-cards">
                        ${Object.keys(data.workerStats).map(worker => {
                          const stats = data.workerStats[worker];
                          return `
                            <div class="worker-card">
                                <div class="worker-header">
                                    <h4 class="worker-name">${worker}</h4>
                                    <span class="worker-total">${stats.total.toFixed(2)} AED</span>
                                </div>
                                <div class="worker-stats">
                                    <div class="stat-row">
                                        <span class="stat-label">Transactions:</span>
                                        <span class="stat-value">${stats.count}</span>
                                    </div>
                                    <div class="stat-row">
                                        <span class="stat-label">Cash:</span>
                                        <span class="stat-value">${stats.cashTotal.toFixed(2)} AED</span>
                                    </div>
                                    <div class="stat-row">
                                        <span class="stat-label">Card:</span>
                                        <span class="stat-value">${stats.cardTotal.toFixed(2)} AED</span>
                                    </div>
                                </div>
                            </div>
                          `;
                        }).join('')}
                    </div>
                </div>
                
                <div class="transactions-section">
                    <h3>Daily Sales Breakdown</h3>
                    <table class="transactions-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Worker</th>
                                <th>Service</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Payment</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.transactions.map(transaction => {
                              const time = transaction.createdAt ? new Date(transaction.createdAt).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: true 
                              }) : '';
                              return `
                                <tr>
                                    <td>${transaction.date}</td>
                                    <td>${transaction.worker}</td>
                                    <td>${transaction.service}</td>
                                    <td>${transaction.customer || 'N/A'}</td>
                                    <td>${transaction.amount.toFixed(2)} AED</td>
                                    <td>${transaction.paymentMethod}</td>
                                    <td>${time}</td>
                                </tr>
                              `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="footer">
                <p>This is an automated daily sales report from BANGZ SALOON Management System</p>
                <p>Generated on ${new Date().toLocaleString('en-GB')}</p>
            </div>
        </div>
    </body>
    </html>
  `;
  
  return html;
}

/**
 * Test email functionality
 */
function testEmail() {
  try {
    console.log('Testing email functionality');
    
    // Check if we have permission to send emails
    try {
      // Try to get the current user's email to test permissions
      const userEmail = Session.getActiveUser().getEmail();
      console.log('Current user email:', userEmail);
    } catch (permError) {
      console.log('Permission check failed:', permError);
      return {
        success: false,
        error: 'Email permissions not granted. Please authorize the script to send emails.',
        instructions: 'Go to Google Apps Script editor, click "Review permissions", and authorize the script to send emails.'
      };
    }
    
    // Send test email
    const recipient = 'bangzsaloondubai@gmail.com';
    const subject = 'BANGZ SALOON - Email Test';
    const htmlBody = `
      <h2>BANGZ SALOON - Email Test</h2>
      <p>This is a test email to verify that the email functionality is working correctly.</p>
      <p>Time: ${new Date().toLocaleString('en-GB')}</p>
      <p>If you receive this email, the automated daily reports will work properly.</p>
    `;
    
    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      htmlBody: htmlBody
    });
    
    console.log(`Test email sent to ${recipient}`);
    
    return {
      success: true,
      message: 'Test email sent successfully',
      recipient: recipient
    };
  } catch (error) {
    console.error('Error sending test email:', error);
    
    // Check if it's a permission error
    if (error.toString().includes('permission') || error.toString().includes('authorization')) {
      return {
        success: false,
        error: 'Email permissions not granted. Please authorize the script to send emails.',
        instructions: 'Go to Google Apps Script editor, click "Review permissions", and authorize the script to send emails.',
        detailedError: error.toString()
      };
    }
    
    return { 
      success: false, 
      error: error.toString(),
      instructions: 'Please check your Google Apps Script permissions and try again.'
    };
  }
}

/**
 * Check email permissions
 */
function checkEmailPermissions() {
  try {
    console.log('Checking email permissions');
    
    // Try to get the current user's email
    const userEmail = Session.getActiveUser().getEmail();
    console.log('Current user email:', userEmail);
    
    // Try to access MailApp to check permissions
    try {
      // This will trigger permission request if not already granted
      const triggers = ScriptApp.getProjectTriggers();
      console.log('Script triggers accessible');
      
      return {
        success: true,
        message: 'Email permissions are available',
        userEmail: userEmail,
        canSendEmails: true
      };
    } catch (mailError) {
      console.log('MailApp access failed:', mailError);
      return {
        success: false,
        error: 'Email permissions not granted',
        instructions: 'Please authorize the script to send emails by running the testEmail function and granting permissions when prompted.',
        userEmail: userEmail,
        canSendEmails: false
      };
    }
  } catch (error) {
    console.error('Error checking email permissions:', error);
    return {
      success: false,
      error: error.toString(),
      instructions: 'Please check your Google Apps Script setup and permissions.'
    };
  }
}


/**
 * Send WhatsApp message to customer
 */
function sendWhatsAppMessage(data) {
  try {
    console.log('Sending WhatsApp message:', data);
    
    // WhatsApp Business API endpoint (you'll need to replace with your actual API)
    const whatsappApiUrl = 'https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages';
    const accessToken = 'YOUR_WHATSAPP_ACCESS_TOKEN'; // You'll need to get this from Meta for Developers
    
    // Format phone number (remove any non-digits and add country code if needed)
    let phoneNumber = data.phone.replace(/\D/g, ''); // Remove non-digits
    if (!phoneNumber.startsWith('971')) { // Add UAE country code if not present
      phoneNumber = '971' + phoneNumber;
    }
    
    // Create message content
    let servicesText = '';
    if (data.services && data.services.length > 0) {
      // Multiple services - show detailed breakdown
      servicesText = data.services.map(service => 
        `• ${service.name} - ${service.cost} AED`
      ).join('\n');
      servicesText = `📋 Services Completed:\n${servicesText}\n💰 Total Amount: ${data.amount} AED`;
    } else {
      // Single service
      servicesText = `📋 Service: ${data.service}\n💰 Amount: ${data.amount} AED`;
    }
    
    // Add tip information if provided
    let tipText = '';
    if (data.tip && data.tip > 0) {
      tipText = `\n💝 Tip: ${data.tip} AED`;
    }
    
    const message = `🎉 Thank you for visiting BANGZ SALOON! 🎉

Dear ${data.customerName},

Your service has been completed:
${servicesText}${tipText}
👨‍💼 Stylist: ${data.worker}
📅 Date: ${data.date}

We hope you enjoyed your experience! 
Please visit us again soon.

Best regards,
BANGZ SALOON Team
Dubai, UAE`;

    const payload = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'text',
      text: {
        body: message
      }
    };

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload)
    };

    // For now, we'll just log the message instead of actually sending it
    // Replace this with actual API call when you have WhatsApp Business API set up
    console.log('WhatsApp message would be sent to:', phoneNumber);
    console.log('Message content:', message);
    
    // Uncomment the following lines when you have WhatsApp API set up:
    /*
    const response = UrlFetchApp.fetch(whatsappApiUrl, options);
    const responseData = JSON.parse(response.getContentText());
    
    if (response.getResponseCode() === 200) {
      console.log('WhatsApp message sent successfully:', responseData);
      return { success: true, message: 'WhatsApp message sent successfully' };
    } else {
      console.log('WhatsApp message failed:', responseData);
      return { success: false, error: responseData.error?.message || 'Failed to send WhatsApp message' };
    }
    */
    
    // For now, return success (simulation)
    return { 
      success: true, 
      message: 'WhatsApp message prepared (API not configured yet)',
      phoneNumber: phoneNumber,
      messageContent: message
    };
    
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Update existing sheet structure to include Tip and Phone columns
 */
function updateSheetStructure() {
  try {
    console.log('Updating sheet structure...');
    
    const spreadsheet = getSpreadsheet();
    const transactionsSheet = spreadsheet.getSheetByName('Transactions');
    
    if (!transactionsSheet) {
      return { success: false, error: 'Transactions sheet not found' };
    }
    
    // Get current headers
    const headers = transactionsSheet.getRange(1, 1, 1, transactionsSheet.getLastColumn()).getValues()[0];
    console.log('Current headers:', headers);
    
    const tipColumnIndex = headers.indexOf('Tip');
    const phoneColumnIndex = headers.indexOf('Phone');
    
    let changes = [];
    
    // Add Tip column if missing
    if (tipColumnIndex === -1) {
      console.log('Adding Tip column...');
      // Insert Tip column after Amount column (column 6)
      transactionsSheet.insertColumnAfter(6);
      transactionsSheet.getRange(1, 7).setValue('Tip');
      changes.push('Added Tip column');
    }
    
    // Add Phone column if missing
    if (phoneColumnIndex === -1) {
      console.log('Adding Phone column...');
      // Find Notes column position
      const notesColumnIndex = headers.indexOf('Notes');
      if (notesColumnIndex !== -1) {
        transactionsSheet.insertColumnAfter(notesColumnIndex + 1);
        transactionsSheet.getRange(1, notesColumnIndex + 2).setValue('Phone');
        changes.push('Added Phone column');
      }
    }
    
    if (changes.length === 0) {
      return { success: true, message: 'Sheet structure is already up to date' };
    }
    
    console.log('Sheet structure updated successfully:', changes);
    return { 
      success: true, 
      message: `Sheet structure updated: ${changes.join(', ')}` 
    };
    
  } catch (error) {
    console.error('Error updating sheet structure:', error);
    return { success: false, error: error.toString() };
  }
}

// ========================================
// RESPONSIVE NAVIGATION FUNCTIONALITY
// ========================================

// Initialize navigation functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
});

function initializeNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navOverlay = document.querySelector('.nav-overlay');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!navToggle || !navMenu || !navOverlay) {
        console.warn('Navigation elements not found');
        return;
    }

    // Toggle navigation menu
    navToggle.addEventListener('click', function() {
        toggleNavigation();
    });

    // Close navigation when clicking overlay
    navOverlay.addEventListener('click', function() {
        closeNavigation();
    });

    // Close navigation when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            closeNavigation();
        });
    });

    // Close navigation when pressing Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            closeNavigation();
        }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 1023) {
            closeNavigation();
        }
    });
}

function toggleNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navOverlay = document.querySelector('.nav-overlay');

    if (!navToggle || !navMenu || !navOverlay) return;

    const isActive = navMenu.classList.contains('active');

    if (isActive) {
        closeNavigation();
    } else {
        openNavigation();
    }
}

function openNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navOverlay = document.querySelector('.nav-overlay');

    if (!navToggle || !navMenu || !navOverlay) return;

    // Add active classes
    navToggle.classList.add('active');
    navMenu.classList.add('active');
    navOverlay.classList.add('active');

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Add smooth animation
    navMenu.style.transition = 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    navOverlay.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';
}

function closeNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navOverlay = document.querySelector('.nav-overlay');

    if (!navToggle || !navMenu || !navOverlay) return;

    // Remove active classes
    navToggle.classList.remove('active');
    navMenu.classList.remove('active');
    navOverlay.classList.remove('active');

    // Restore body scroll
    document.body.style.overflow = '';

    // Add smooth animation
    navMenu.style.transition = 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    navOverlay.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';
}

// ========================================
// RESPONSIVE UTILITIES
// ========================================

// Function to check if device is mobile
function isMobile() {
    return window.innerWidth <= 768;
}

// Function to check if device is tablet
function isTablet() {
    return window.innerWidth > 768 && window.innerWidth <= 1023;
}

// Function to check if device is desktop
function isDesktop() {
    return window.innerWidth > 1023;
}

// Function to get current breakpoint
function getCurrentBreakpoint() {
    if (window.innerWidth <= 425) return 'mobile-portrait';
    if (window.innerWidth <= 480) return 'mobile-landscape';
    if (window.innerWidth <= 767) return 'tablet-portrait';
    if (window.innerWidth <= 1023) return 'tablet-landscape';
    if (window.innerWidth <= 1439) return 'desktop';
    return 'large-desktop';
}

// Function to handle responsive adjustments
function handleResponsiveAdjustments() {
    const breakpoint = getCurrentBreakpoint();
    
    // Close navigation on larger screens
    if (breakpoint === 'desktop' || breakpoint === 'large-desktop') {
        closeNavigation();
    }
    
    // Adjust popup positioning based on screen size
    adjustPopupPositioning(breakpoint);
}

// Function to adjust popup positioning for different screen sizes
function adjustPopupPositioning(breakpoint) {
    // New popup system handles positioning automatically via CSS
    // No manual adjustments needed
}

// Initialize responsive handling
window.addEventListener('resize', handleResponsiveAdjustments);
window.addEventListener('load', handleResponsiveAdjustments);
