/**
 * BANGZ SALOON - Professional Salon Management System
 * Google Integration - Handles communication with Google Apps Script and Google Sheets
 */

class GoogleIntegration {
    constructor() {
        // This will be set when the Google Apps Script is deployed
        this.scriptUrl = 'https://script.google.com/macros/s/AKfycbx5dz53IVe9uGyWWzRmGeloW7SoWMZ4ZnHyFamflAMtnfo_Za4tpK0WO2Z5JpOcbHdW/exec';
        this.isOnline = navigator.onLine;
        this.offlineData = this.loadOfflineData();
        
        this.setupOnlineOfflineHandlers();
        console.log(`[${new Date().toISOString()}] ✅ Google Integration initialized`);
    }

    /**
     * Set the Google Apps Script URL
     * @param {string} url - The deployed Google Apps Script web app URL
     */
    setScriptUrl(url) {
        this.scriptUrl = url;
        console.log(`[${new Date().toISOString()}] 🔗 Google Apps Script URL set: ${url}`);
    }

    /**
     * Setup online/offline event handlers
     */
    setupOnlineOfflineHandlers() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log(`[${new Date().toISOString()}] 🌐 Connection restored`);
            this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log(`[${new Date().toISOString()}] 📴 Connection lost`);
        });
    }

    /**
     * Make HTTP request to Google Apps Script
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request data
     * @param {string} method - HTTP method (GET/POST)
     * @returns {Promise} Response data
     */
    async makeRequest(endpoint, data = {}, method = 'POST') {
        if (!this.scriptUrl) {
            throw new Error('Google Apps Script URL not configured');
        }

        const url = `${this.scriptUrl}?endpoint=${endpoint}`;
        
        let requestOptions;
        
        if (method === 'GET') {
            // For GET requests, add data as URL parameters
            const params = new URLSearchParams();
            Object.keys(data).forEach(key => {
                if (data[key] !== undefined && data[key] !== null) {
                    params.append(key, data[key]);
                }
            });
            const getUrl = params.toString() ? `${url}&${params.toString()}` : url;
            
            requestOptions = {
                method: 'GET'
            };
            
            try {
                console.log(`[${new Date().toISOString()}] 🔄 Making GET request to ${endpoint}`);
                console.log(`[${new Date().toISOString()}] 📤 Request data:`, data);
                console.log(`[${new Date().toISOString()}] 📤 Request URL:`, getUrl);
                const response = await fetch(getUrl, requestOptions);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                console.log(`[${new Date().toISOString()}] ✅ Request successful: ${endpoint}`);
                console.log(`[${new Date().toISOString()}] 📥 Response data:`, result);
                return result;
            } catch (error) {
                console.error(`[${new Date().toISOString()}] ❌ GET Request failed: ${endpoint}`, error);
                throw error;
            }
        } else {
            // For POST requests, use FormData to avoid CORS preflight
            const formData = new FormData();
            formData.append('data', JSON.stringify(data));
            
            requestOptions = {
                method: 'POST',
                body: formData
            };

            try {
                console.log(`[${new Date().toISOString()}] 🔄 Making POST request to ${endpoint}`);
                console.log(`[${new Date().toISOString()}] 📤 Request data:`, data);
                console.log(`[${new Date().toISOString()}] 📤 Request URL:`, url);
                const response = await fetch(url, requestOptions);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                console.log(`[${new Date().toISOString()}] ✅ Request successful: ${endpoint}`);
                console.log(`[${new Date().toISOString()}] 📥 Response data:`, result);
                return result;
            } catch (error) {
                console.error(`[${new Date().toISOString()}] ❌ POST Request failed: ${endpoint}`, error);
                throw error;
            }
        }
    }

    /**
     * Submit a new service entry
     * @param {Object} entryData - Service entry data
     * @returns {Promise} Submission result
     */
    async submitServiceEntry(entryData) {
        try {
            if (!this.isOnline) {
                return this.handleOfflineSubmission(entryData);
            }

            const result = await this.makeRequest('createTransaction', entryData);
            
            if (result.success) {
                console.log(`[${new Date().toISOString()}] ✅ Service entry submitted successfully`);
                return { success: true, data: result.data };
            } else {
                throw new Error(result.error || 'Submission failed');
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error submitting service entry:`, error);
            
            // Fallback to offline storage
            return this.handleOfflineSubmission(entryData);
        }
    }

    /**
     * Handle offline submission by storing locally
     * @param {Object} entryData - Service entry data
     * @returns {Object} Offline submission result
     */
    handleOfflineSubmission(entryData) {
        console.log(`[${new Date().toISOString()}] 📱 Storing entry offline`);
        
        const offlineEntry = {
            ...entryData,
            id: Date.now().toString(),
            offline: true,
            timestamp: new Date().toISOString()
        };

        this.offlineData.push(offlineEntry);
        this.saveOfflineData();

        return {
            success: true,
            data: offlineEntry,
            offline: true,
            message: 'Entry saved offline. Will sync when connection is restored.'
        };
    }

    /**
     * Get workers list
     * @returns {Promise} Workers array
     */
    async getWorkers() {
        try {
            if (!this.isOnline) {
                return this.getOfflineWorkers();
            }

            const result = await this.makeRequest('getWorkers', {}, 'GET');
            return result.data || [];
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error getting workers:`, error);
            return this.getOfflineWorkers();
        }
    }

    /**
     * Get services list
     * @returns {Promise} Services object
     */
    async getServices() {
        try {
            if (!this.isOnline) {
                console.log(`[${new Date().toISOString()}] 📴 Offline mode, using offline services`);
                return this.getOfflineServices();
            }

            console.log(`[${new Date().toISOString()}] 🌐 Online mode, fetching services from API`);
            const result = await this.makeRequest('getServices', {}, 'GET');
            console.log(`[${new Date().toISOString()}] 📊 Services API response:`, result);
            
            if (result && result.success) {
                console.log(`[${new Date().toISOString()}] ✅ Services loaded from API:`, result.data);
                return result.data || {};
            } else {
                console.log(`[${new Date().toISOString()}] ⚠️ API failed, using offline services:`, result?.error);
                return this.getOfflineServices();
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error getting services:`, error);
            console.log(`[${new Date().toISOString()}] 🔄 Falling back to offline services`);
            return this.getOfflineServices();
        }
    }

    /**
     * Get services by category
     * @param {string} category - Category name (Normal or Promotional)
     * @returns {Promise} Services object for the category
     */

    /**
     * Get daily data for dashboard
     * @param {string} date - Date string
     * @returns {Promise} Daily data object
     */
    async getDailyData(date) {
        try {
            if (!this.isOnline) {
                return this.getOfflineDailyData(date);
            }

            console.log(`[${new Date().toISOString()}] 🔍 Requesting daily data for date: "${date}"`);
            
            // Try getDailyData first, fallback to getAllTransactions if not available
            try {
                const result = await this.makeRequest('getDailyData', { date }, 'GET');
                if (result.success) {
                    console.log(`[${new Date().toISOString()}] 📊 Daily data response:`, result);
                    return result.data || this.getEmptyDailyData();
                } else {
                    console.log(`[${new Date().toISOString()}] ⚠️ getDailyData failed, falling back to getAllTransactions:`, result.error);
                }
            } catch (error) {
                console.log(`[${new Date().toISOString()}] ⚠️ getDailyData error, falling back to getAllTransactions:`, error);
            }
            
            // Fallback: Get all transactions and filter on client side
            console.log(`[${new Date().toISOString()}] 🔄 Using fallback method: getTransactions`);
            const allTransactionsResult = await this.makeRequest('getTransactions');
            console.log(`[${new Date().toISOString()}] 📊 All transactions response:`, allTransactionsResult);
            
            if (allTransactionsResult && allTransactionsResult.success && allTransactionsResult.data) {
                return this.filterTransactionsForDate(allTransactionsResult.data, date);
            } else {
                console.log(`[${new Date().toISOString()}] ⚠️ getTransactions failed, using empty data`);
                return this.getEmptyDailyData();
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error getting daily data:`, error);
            return this.getOfflineDailyData(date);
        }
    }

    /**
     * Get all sales data with worker breakdown
     * @param {string} date - Optional date filter
     * @returns {Object} All sales data with worker stats
     */
    async getAllSales(date = null) {
        try {
            if (!this.isOnline) {
                return this.getOfflineAllSalesData(date);
            }

            console.log(`[${new Date().toISOString()}] 🔍 Requesting all sales data for date: "${date || 'all'}"`);
            
            const result = await this.makeRequest('getAllSales', { date }, 'GET');
            
            if (result && result.success) {
                console.log(`[${new Date().toISOString()}] 📊 All sales data response:`, result);
                return result;
            } else {
                console.log(`[${new Date().toISOString()}] ⚠️ getAllSales failed, falling back to getTransactions:`, result?.error);
                
                // Fallback: Get all transactions and process on client side
                const allTransactionsResult = await this.makeRequest('getTransactions', {}, 'GET');
                console.log(`[${new Date().toISOString()}] 📊 All transactions response:`, allTransactionsResult);
                
                if (allTransactionsResult && allTransactionsResult.success && (allTransactionsResult.data || allTransactionsResult.transactions)) {
                    const transactions = allTransactionsResult.data || allTransactionsResult.transactions;
                    return this.processAllSalesData(transactions, date);
                } else {
                    console.log(`[${new Date().toISOString()}] ⚠️ getTransactions failed, using empty data`);
                    return this.getEmptyAllSalesData();
                }
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error getting all sales data:`, error);
            return this.getOfflineAllSalesData(date);
        }
    }

    /**
     * Process all sales data from transactions
     * @param {Array} transactions - All transactions
     * @param {string} targetDate - Optional date filter
     * @returns {Object} Processed all sales data
     */
    processAllSalesData(transactions, targetDate = null) {
        console.log(`[${new Date().toISOString()}] 🔍 Processing ${transactions.length} transactions for all sales data`);
        console.log(`[${new Date().toISOString()}] 📊 Sample transaction:`, transactions[0]);
        
        // Filter transactions if date is specified
        let filteredTransactions = transactions;
        if (targetDate) {
            filteredTransactions = transactions.filter(transaction => {
                const transactionDate = transaction.date || transaction.Date;
                console.log(`[${new Date().toISOString()}] 📅 Checking transaction date: "${transactionDate}" vs target: "${targetDate}"`);
                return transactionDate === targetDate;
            });
        }
        
        console.log(`[${new Date().toISOString()}] 📊 Filtered transactions:`, filteredTransactions.length);
        
        // Calculate worker statistics
        const workerStats = {};
        let totalSales = 0;
        let totalTransactions = filteredTransactions.length;
        let cashTotal = 0;
        let cardTotal = 0;
        
        filteredTransactions.forEach(transaction => {
            const worker = transaction.worker || transaction.Worker;
            const amount = parseFloat(transaction.amount || transaction.Amount) || 0;
            const paymentMethod = transaction.paymentMethod || transaction.Payment_Method || transaction.Payment;
            
            console.log(`[${new Date().toISOString()}] 💰 Processing transaction - Worker: ${worker}, Amount: ${amount}, Payment: ${paymentMethod}`);
            
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
            
            if (paymentMethod === 'Cash') {
                workerStats[worker].cashTotal += amount;
                cashTotal += amount;
            } else if (paymentMethod === 'Card') {
                workerStats[worker].cardTotal += amount;
                cardTotal += amount;
            }
            
            totalSales += amount;
        });
        
        const processedData = {
            date: targetDate || new Date().toLocaleDateString('en-GB'),
            totalSales: totalSales,
            totalTransactions: totalTransactions,
            cashTotal: cashTotal,
            cardTotal: cardTotal,
            workerStats: workerStats,
            transactions: filteredTransactions
        };
        
        console.log(`[${new Date().toISOString()}] 📊 Processed all sales data:`, processedData);
        return { success: true, data: processedData };
    }

    /**
     * Get empty all sales data structure
     * @returns {Object} Empty all sales data
     */
    getEmptyAllSalesData() {
        return {
            success: true,
            data: {
                date: new Date().toLocaleDateString('en-GB'),
                totalSales: 0,
                totalTransactions: 0,
                cashTotal: 0,
                cardTotal: 0,
                workerStats: {},
                transactions: []
            }
        };
    }

    /**
     * Get offline all sales data
     * @param {string} date - Date filter
     * @returns {Object} Offline all sales data
     */
    getOfflineAllSalesData(date) {
        console.log(`[${new Date().toISOString()}] 📱 Using offline all sales data for date: "${date || 'all'}"`);
        return this.getEmptyAllSalesData();
    }

    /**
     * Filter transactions for a specific date
     * @param {Array} transactions - All transactions
     * @param {string} targetDate - Date to filter for
     * @returns {Object} Daily data object
     */
    filterTransactionsForDate(transactions, targetDate) {
        console.log(`[${new Date().toISOString()}] 🔍 Filtering ${transactions.length} transactions for date: "${targetDate}"`);
        
        // Filter transactions for the target date
        const dailyTransactions = transactions.filter(transaction => {
            const transactionDate = transaction.date || transaction.Date;
            console.log(`[${new Date().toISOString()}] 📅 Checking transaction date: "${transactionDate}" vs target: "${targetDate}"`);
            return transactionDate === targetDate;
        });
        
        console.log(`[${new Date().toISOString()}] ✅ Found ${dailyTransactions.length} transactions for ${targetDate}`);
        console.log(`[${new Date().toISOString()}] 📊 Daily transactions data:`, dailyTransactions);
        
        // Calculate statistics
        const totalSales = dailyTransactions.reduce((sum, t) => {
            const amount = parseFloat(t.amount) || parseFloat(t.Amount) || 0;
            console.log(`[${new Date().toISOString()}] 💰 Transaction amount: ${amount} (from ${t.amount || t.Amount})`);
            return sum + amount;
        }, 0);
        const cashTotal = dailyTransactions.filter(t => {
            const paymentMethod = t.paymentMethod || t.Payment_Method || t.payment || t.Payment;
            return paymentMethod === 'Cash';
        }).reduce((sum, t) => sum + (parseFloat(t.amount) || parseFloat(t.Amount) || 0), 0);
        
        const cardTotal = dailyTransactions.filter(t => {
            const paymentMethod = t.paymentMethod || t.Payment_Method || t.payment || t.Payment;
            return paymentMethod === 'Card';
        }).reduce((sum, t) => sum + (parseFloat(t.amount) || parseFloat(t.Amount) || 0), 0);
        
        // Calculate worker stats
        const workerStats = {};
        dailyTransactions.forEach(transaction => {
            const worker = transaction.worker || transaction.Worker;
            const amount = parseFloat(transaction.amount) || parseFloat(transaction.Amount) || 0;
            
            if (!workerStats[worker]) {
                workerStats[worker] = { total: 0, count: 0, transactions: [] };
            }
            workerStats[worker].total += amount;
            workerStats[worker].count += 1;
            workerStats[worker].transactions.push(transaction);
        });
        
        const result = {
            date: targetDate,
            totalSales: totalSales,
            transactionCount: dailyTransactions.length,
            cashTotal: cashTotal,
            cardTotal: cardTotal,
            workerStats: workerStats,
            recentTransactions: dailyTransactions.slice(-5), // Last 5 transactions
            entries: dailyTransactions
        };
        
        console.log(`[${new Date().toISOString()}] 📊 Filtered daily data:`, result);
        return result;
    }

    /**
     * Get app settings
     * @returns {Promise} Settings object
     */
    async getSettings() {
        try {
            if (!this.isOnline) {
                return this.getOfflineSettings();
            }

            const result = await this.makeRequest('getSettings', {}, 'GET');
            return result.data || {};
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error getting settings:`, error);
            return this.getOfflineSettings();
        }
    }

    /**
     * Sync offline data when connection is restored
     */
    async syncOfflineData() {
        if (this.offlineData.length === 0) {
            return;
        }

        console.log(`[${new Date().toISOString()}] 🔄 Syncing ${this.offlineData.length} offline entries`);
        
        const syncPromises = this.offlineData.map(entry => 
            this.makeRequest('createTransaction', entry).catch(error => {
                console.error(`[${new Date().toISOString()}] ❌ Failed to sync entry:`, error);
                return { success: false, entry };
            })
        );

        try {
            const results = await Promise.allSettled(syncPromises);
            const successful = results.filter(result => 
                result.status === 'fulfilled' && result.value.success
            ).length;

            console.log(`[${new Date().toISOString()}] ✅ Synced ${successful}/${this.offlineData.length} entries`);
            
            if (successful === this.offlineData.length) {
                this.clearOfflineData();
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error syncing offline data:`, error);
        }
    }

    /**
     * Load offline data from localStorage
     * @returns {Array} Offline data array
     */
    loadOfflineData() {
        try {
            const data = localStorage.getItem('salon_offline_data');
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error loading offline data:`, error);
            return [];
        }
    }

    /**
     * Save offline data to localStorage
     */
    saveOfflineData() {
        try {
            localStorage.setItem('salon_offline_data', JSON.stringify(this.offlineData));
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error saving offline data:`, error);
        }
    }

    /**
     * Clear offline data
     */
    clearOfflineData() {
        this.offlineData = [];
        localStorage.removeItem('salon_offline_data');
        console.log(`[${new Date().toISOString()}] ✅ Offline data cleared`);
    }

    /**
     * Get offline workers (fallback)
     * @returns {Array} Workers array
     */
    getOfflineWorkers() {
        return ["Maria", "Ahmed", "Sarah", "John", "Lisa"];
    }

    /**
     * Get offline services (fallback)
     * @returns {Object} Services object
     */
    getOfflineServices() {
        return {};
    }

    /**
     * Get offline daily data (fallback)
     * @param {string} date - Date string
     * @returns {Object} Daily data object
     */
    getOfflineDailyData(date) {
        const todayEntries = this.offlineData.filter(entry => 
            entry.date === date || entry.timestamp.startsWith(date)
        );

        return this.calculateDailyStats(todayEntries);
    }

    /**
     * Get offline settings (fallback)
     * @returns {Object} Settings object
     */
    getOfflineSettings() {
        return {
            salonName: "BANGZ SALOON",
            currency: "AED",
            timezone: "Asia/Dubai",
            location: "Dubai, UAE",
            offlineMode: true
        };
    }

    /**
     * Get empty daily data structure
     * @returns {Object} Empty daily data
     */
    getEmptyDailyData() {
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
     * Calculate daily statistics from entries
     * @param {Array} entries - Array of service entries
     * @returns {Object} Calculated statistics
     */
    calculateDailyStats(entries) {
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

            // Worker stats with transaction details
            if (entry.worker) {
                if (!stats.workerStats[entry.worker]) {
                    stats.workerStats[entry.worker] = { 
                        total: 0, 
                        count: 0, 
                        transactions: [] 
                    };
                }
                stats.workerStats[entry.worker].total += cost;
                stats.workerStats[entry.worker].count += 1;
                stats.workerStats[entry.worker].transactions.push({
                    service: entry.service,
                    cost: cost,
                    payment: entry.payment,
                    timestamp: entry.timestamp,
                    customer: entry.customer || ''
                });
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

        // Sort worker transactions by timestamp (newest first)
        Object.values(stats.workerStats).forEach(workerStat => {
            if (workerStat.transactions) {
                workerStat.transactions.sort((a, b) => 
                    new Date(b.timestamp) - new Date(a.timestamp)
                );
            }
        });

        return stats;
    }

    /**
     * Authenticate user with email and password
     * @param {string} email - User's email
     * @param {string} password - User's hashed password
     * @returns {Promise} Authentication result
     */
    async authenticateUser(email, password) {
        try {
            if (!this.isOnline) {
                return this.handleOfflineAuthentication(email, password);
            }

            const result = await this.makeRequest('authenticateUser', { email, password });
            
            if (result.success) {
                console.log(`[${new Date().toISOString()}] ✅ User authenticated successfully: ${email}`);
                return { success: true, user: result.user };
            } else {
                throw new Error(result.error || 'Authentication failed');
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Authentication error:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle offline authentication (fallback)
     * @param {string} email - User's email
     * @param {string} password - User's hashed password
     * @returns {Object} Offline authentication result
     */
    handleOfflineAuthentication(email, password) {
        // For offline mode, allow admin user only
        const adminEmail = 'admin@bangzsaloon.com';
        const adminPassword = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';
        
        if (email === adminEmail && password === adminPassword) {
            return {
                success: true,
                user: {
                    email: adminEmail,
                    name: 'Sohel',
                    role: 'Admin',
                    lastLogin: new Date().toISOString()
                }
            };
        }
        
        return {
            success: false,
            error: 'Offline mode: Only admin access available'
        };
    }

    /**
     * Test connection to Google Apps Script
     * @returns {Promise} Connection test result
     */
    async testConnection() {
        try {
            const result = await this.makeRequest('test', {}, 'GET');
            console.log(`[${new Date().toISOString()}] ✅ Connection test successful`);
            return { success: true, message: 'Connection successful' };
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Connection test failed:`, error);
            return { success: false, message: error.message };
        }
    }

    /**
     * Get connection status
     * @returns {Object} Connection status
     */
    getConnectionStatus() {
        return {
            online: this.isOnline,
            scriptUrl: this.scriptUrl,
            offlineEntries: this.offlineData.length,
            lastSync: localStorage.getItem('salon_last_sync') || 'Never'
        };
    }

    /**
     * Update sheet structure to include Tip and Phone columns
     * @returns {Promise} Update result
     */
    async updateSheetStructure() {
        try {
            if (!this.isOnline) {
                return { success: false, error: 'Offline' };
            }

            const result = await this.makeRequest('updateSheetStructure', {}, 'GET');
            return result;
        } catch (error) {
            console.error('Error updating sheet structure:', error);
            return { success: false, error: error.message };
        }
    }

}

// Create global instance
window.googleIntegration = new GoogleIntegration();






