/**
 * Salon Management System - Google Integration
 * Handles communication with Google Apps Script and Google Sheets
 */

class GoogleIntegration {
    constructor() {
        // This will be set when the Google Apps Script is deployed
        this.scriptUrl = ''; // To be configured with actual Google Apps Script URL
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
        
        const requestOptions = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (method === 'POST' && Object.keys(data).length > 0) {
            requestOptions.body = JSON.stringify(data);
        }

        try {
            console.log(`[${new Date().toISOString()}] 🔄 Making request to ${endpoint}`);
            const response = await fetch(url, requestOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log(`[${new Date().toISOString()}] ✅ Request successful: ${endpoint}`);
            return result;
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Request failed: ${endpoint}`, error);
            throw error;
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

            const result = await this.makeRequest('addServiceEntry', entryData);
            
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
                return this.getOfflineServices();
            }

            const result = await this.makeRequest('getServices', {}, 'GET');
            return result.data || {};
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error getting services:`, error);
            return this.getOfflineServices();
        }
    }

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

            const result = await this.makeRequest('getDailyData', { date }, 'GET');
            return result.data || this.getEmptyDailyData();
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error getting daily data:`, error);
            return this.getOfflineDailyData(date);
        }
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
            this.makeRequest('addServiceEntry', entry).catch(error => {
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
            salonName: "SalonPro",
            currency: "USD",
            timezone: "America/New_York",
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
}

// Create global instance
window.googleIntegration = new GoogleIntegration();
