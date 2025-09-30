/**
 * BANGZ SALOON - Supabase Integration
 * Replaces Google Apps Script with fast Supabase database
 */

class SupabaseIntegration {
    constructor() {
        // These will be set from config.js or environment variables
        this.supabaseUrl = null;
        this.supabaseKey = null;
        this.supabase = null;
        this.isOnline = navigator.onLine;
        this.offlineData = this.loadOfflineData();
        
        this.setupOnlineOfflineHandlers();
        console.log(`[${new Date().toISOString()}] ✅ Supabase Integration initialized (waiting for credentials)`);
    }

    /**
     * Initialize Supabase client
     */
    initializeSupabase() {
        // Check if Supabase is available and credentials are set
        if (typeof supabase !== 'undefined' && this.supabaseUrl && this.supabaseKey) {
            this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey);
            console.log(`[${new Date().toISOString()}] 🔗 Supabase client initialized with URL: ${this.supabaseUrl}`);
        } else if (typeof supabase === 'undefined') {
            console.warn(`[${new Date().toISOString()}] ⚠️ Supabase not loaded, using fallback mode`);
        } else {
            console.warn(`[${new Date().toISOString()}] ⚠️ Supabase credentials not set, waiting for setCredentials() call`);
        }
    }

    /**
     * Set Supabase credentials
     */
    setCredentials(url, key) {
        this.supabaseUrl = url;
        this.supabaseKey = key;
        console.log(`[${new Date().toISOString()}] 🔑 Setting Supabase credentials: ${url}`);
        this.initializeSupabase();
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
     * Make authenticated request to Supabase
     */
    async makeRequest(endpoint, data = {}, method = 'POST') {
        if (!this.supabase) {
            throw new Error('Supabase not initialized');
        }

        try {
            console.log(`[${new Date().toISOString()}] 🔄 Making ${method} request to ${endpoint}`);
            console.log(`[${new Date().toISOString()}] 📤 Request data:`, data);

            let result;
            
            switch (endpoint) {
                case 'authenticateUser':
                    result = await this.authenticateUser(data);
                    break;
                case 'getUsers':
                    result = await this.getUsers();
                    break;
                case 'createUser':
                    result = await this.createUser(data);
                    break;
                case 'updateUser':
                    result = await this.updateUser(data);
                    break;
                case 'deleteUser':
                    result = await this.deleteUser(data);
                    break;
                case 'getWorkers':
                    result = await this.getWorkers();
                    break;
                case 'createWorker':
                    result = await this.createWorker(data);
                    break;
                case 'updateWorker':
                    result = await this.updateWorker(data);
                    break;
                case 'deleteWorker':
                    result = await this.deleteWorker(data);
                    break;
                case 'getTransactions':
                    result = await this.getTransactions(data);
                    break;
                case 'createTransaction':
                    result = await this.createTransaction(data);
                    break;
                case 'getServices':
                    result = await this.getServices();
                    break;
                case 'addService':
                case 'createService':
                    result = await this.addService(data);
                    break;
                case 'updateService':
                    result = await this.updateService(data);
                    break;
                case 'deleteService':
                    result = await this.deleteService(data);
                    break;
                case 'getDailyData':
                    result = await this.getDailyData(data);
                    break;
                case 'getAllSales':
                    result = await this.getAllSales(data);
                    break;
                case 'getDailySales':
                    result = await this.getDailySales(data);
                    break;
                case 'getWorkerPerformance':
                    result = await this.getWorkerPerformance();
                    break;
                case 'getSalesReport':
                    result = await this.getSalesReport(data);
                    break;
                case 'getCalendarData':
                    result = await this.getCalendarData(data);
                    break;
                case 'updateTransaction':
                    result = await this.updateTransaction(data);
                    break;
                default:
                    throw new Error(`Unknown endpoint: ${endpoint}`);
            }

            console.log(`[${new Date().toISOString()}] ✅ Request successful: ${endpoint}`);
            console.log(`[${new Date().toISOString()}] 📥 Response data:`, result);
            return result;

        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Request failed: ${endpoint}`, error);
            throw error;
        }
    }

    /**
     * Authenticate user
     */
    async authenticateUser(data) {
        const { email, password } = data;
        
        // Hash the password (same as Google Apps Script)
        const hashBytes = await this.hashPassword(password);
        const hashedPassword = hashBytes;

        const { data: users, error } = await this.supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('password_hash', hashedPassword)
            .eq('status', 'Active')
            .single();

        if (error || !users) {
            return { success: false, error: 'Invalid credentials' };
        }

        return { 
            success: true, 
            user: {
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                phone: users.phone,
                status: users.status
            }
        };
    }

    /**
     * Hash password using Web Crypto API
     */
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
    }

    /**
     * Get all users
     */
    async getUsers() {
        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data: data };
    }

    /**
     * Create new user
     */
    async createUser(data) {
        const hashedPassword = await this.hashPassword(data.password);
        
        const { data: result, error } = await this.supabase
            .from('users')
            .insert([{
                name: data.name,
                email: data.email,
                password_hash: hashedPassword,
                role: data.role || 'Worker',
                phone: data.phone || '',
                status: data.status || 'Active'
            }])
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, message: 'User created successfully', data: result };
    }

    /**
     * Update user
     */
    async updateUser(data) {
        const updateData = {
            name: data.name,
            role: data.role,
            phone: data.phone,
            status: data.status,
            updated_at: new Date().toISOString()
        };

        if (data.password) {
            updateData.password_hash = await this.hashPassword(data.password);
        }

        const { data: result, error } = await this.supabase
            .from('users')
            .update(updateData)
            .eq('email', data.email)
            .select();

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, message: 'User updated successfully', data: result };
    }

    /**
     * Delete user
     */
    async deleteUser(data) {
        const { error } = await this.supabase
            .from('users')
            .delete()
            .eq('email', data.email);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, message: 'User deleted successfully' };
    }

    /**
     * Get all workers
     */
    async getWorkers() {
        const { data, error } = await this.supabase
            .from('workers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data: data };
    }

    /**
     * Create new worker
     */
    async createWorker(data) {
        const { data: result, error } = await this.supabase
            .from('workers')
            .insert([{
                name: data.name,
                email: data.email || '',
                phone: data.phone || '',
                role: data.role || 'Worker',
                status: data.status || 'Active'
            }])
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, message: 'Worker created successfully', data: result };
    }

    /**
     * Update worker
     */
    async updateWorker(data) {
        const updateData = {
            name: data.name,
            phone: data.phone,
            role: data.role,
            status: data.status,
            updated_at: new Date().toISOString()
        };

        const { data: result, error } = await this.supabase
            .from('workers')
            .update(updateData)
            .eq('email', data.email)
            .select();

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, message: 'Worker updated successfully', data: result };
    }

    /**
     * Delete worker
     */
    async deleteWorker(data) {
        const { error } = await this.supabase
            .from('workers')
            .delete()
            .eq('email', data.email);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, message: 'Worker deleted successfully' };
    }

    /**
     * Get all transactions
     */
    async getTransactions(data = {}) {
        let query = this.supabase
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false });

        if (data.date) {
            query = query.eq('date', data.date);
        }

        const { data: transactions, error } = await query;

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data: transactions };
    }

    /**
     * Create new transaction
     */
    async createTransaction(data) {
        // Convert DD/MM/YYYY to YYYY-MM-DD format for database
        let dbDate = data.date || new Date().toLocaleDateString('en-GB');
        if (dbDate.includes('/')) {
            const [day, month, year] = dbDate.split('/');
            dbDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        
        const transactionData = {
            date: dbDate,
            customer_name: data.customer || data.customerName || data.customer_name || '',
            service: data.service || '',
            worker: data.worker || '',
            amount: parseFloat(data.cost || data.amount || 0),
            tip: parseFloat(data.tip || 0),
            payment_method: data.payment || data.paymentMethod || data.payment_method || '',
            phone: data.phone || '',
            category: data.category || ''
        };

        const { data: result, error } = await this.supabase
            .from('transactions')
            .insert([transactionData])
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, message: 'Transaction created successfully', data: result };
    }

    /**
     * Get all services
     */
    async getServices() {
        const { data, error } = await this.supabase
            .from('services')
            .select('*')
            .order('category', { ascending: true })
            .order('service_name', { ascending: true });

        if (error) {
            return { success: false, error: error.message };
        }

        // Transform to match existing format
        const services = {};
        data.forEach(service => {
            if (!services[service.category]) {
                services[service.category] = {};
            }
            services[service.category][service.service_name] = service.cost;
        });

        return { success: true, data: services };
    }

    /**
     * Add new service
     */
    async addService(data) {
        const { data: result, error } = await this.supabase
            .from('services')
            .insert([{
                category: data.category,
                service_name: data.service_name || data.serviceName,
                cost: parseFloat(data.cost)
            }])
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        return { 
            success: true, 
            message: `Service "${data.serviceName}" added successfully to ${data.category} category`,
            data: result
        };
    }

    /**
     * Update service
     */
    async updateService(data) {
        const { data: result, error } = await this.supabase
            .from('services')
            .update({
                category: data.category,
                service_name: data.serviceName,
                cost: parseFloat(data.cost),
                updated_at: new Date().toISOString()
            })
            .eq('category', data.oldCategory)
            .eq('service_name', data.oldServiceName)
            .select();

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, message: 'Service updated successfully', data: result };
    }

    /**
     * Delete service
     */
    async deleteService(data) {
        const { error } = await this.supabase
            .from('services')
            .delete()
            .eq('category', data.category)
            .eq('service_name', data.serviceName);

        if (error) {
            return { success: false, error: error.message };
        }

        return { 
            success: true, 
            message: `Service "${data.serviceName}" deleted successfully from ${data.category} category`
        };
    }

    /**
     * Get daily data for dashboard
     */
    async getDailyData(data) {
        const date = data.date || new Date().toLocaleDateString('en-GB');
        
        // Convert DD/MM/YYYY to YYYY-MM-DD format for database query
        let dbDate = date;
        if (date.includes('/')) {
            const [day, month, year] = date.split('/');
            dbDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        
        const { data: transactions, error } = await this.supabase
            .from('transactions')
            .select('*')
            .eq('date', dbDate)
            .order('created_at', { ascending: false });

        if (error) {
            return { success: false, error: error.message };
        }

        // Calculate statistics
        const totalSales = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const cashTotal = transactions.filter(t => t.payment_method === 'Cash').reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const cardTotal = transactions.filter(t => t.payment_method === 'Card').reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        // Calculate worker stats
        const workerStats = {};
        transactions.forEach(transaction => {
            const worker = transaction.worker;
            if (!workerStats[worker]) {
                workerStats[worker] = { 
                    total: 0, 
                    count: 0, 
                    cashTotal: 0,
                    cardTotal: 0,
                    transactions: [] 
                };
            }
            workerStats[worker].total += parseFloat(transaction.amount);
            workerStats[worker].count += 1;
            workerStats[worker].transactions.push(transaction);
            
            if (transaction.payment_method === 'Cash') {
                workerStats[worker].cashTotal += parseFloat(transaction.amount);
            } else if (transaction.payment_method === 'Card') {
                workerStats[worker].cardTotal += parseFloat(transaction.amount);
            }
        });

        const result = {
            date: date,
            totalSales: totalSales,
            transactionCount: transactions.length,
            cashTotal: cashTotal,
            cardTotal: cardTotal,
            workerStats: workerStats,
            recentTransactions: transactions.slice(0, 5),
            entries: transactions
        };

        return { success: true, data: result };
    }

    /**
     * Get all sales data with worker breakdown
     */
    async getAllSales(data = {}) {
        let query = this.supabase
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false });

        if (data.date) {
            // Convert DD/MM/YYYY to YYYY-MM-DD format for database query
            let dbDate = data.date;
            if (data.date.includes('/')) {
                const [day, month, year] = data.date.split('/');
                dbDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
            query = query.eq('date', dbDate);
        }

        const { data: transactions, error } = await query;

        if (error) {
            return { success: false, error: error.message };
        }

        // Calculate worker statistics
        const workerStats = {};
        let totalSales = 0;
        let totalTransactions = transactions.length;
        let cashTotal = 0;
        let cardTotal = 0;
        
        transactions.forEach(transaction => {
            const worker = transaction.worker;
            const amount = parseFloat(transaction.amount);
            
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
            
            if (transaction.payment_method === 'Cash') {
                workerStats[worker].cashTotal += amount;
                cashTotal += amount;
            } else if (transaction.payment_method === 'Card') {
                workerStats[worker].cardTotal += amount;
                cardTotal += amount;
            }
            
            totalSales += amount;
        });

        const result = {
            date: data.date || new Date().toLocaleDateString('en-GB'),
            totalSales: totalSales,
            totalTransactions: totalTransactions,
            cashTotal: cashTotal,
            cardTotal: cardTotal,
            workerStats: workerStats,
            transactions: transactions
        };

        return { success: true, data: result };
    }

    /**
     * Submit a new service entry (alias for createTransaction)
     */
    async submitServiceEntry(entryData) {
        return await this.createTransaction(entryData);
    }

    /**
     * Test connection to Supabase
     */
    async testConnection() {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('count')
                .limit(1);

            if (error) {
                throw error;
            }

            return { success: true, message: 'Connection successful' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * Get connection status
     */
    getConnectionStatus() {
        return {
            online: this.isOnline,
            supabaseUrl: this.supabaseUrl,
            offlineEntries: this.offlineData.length,
            lastSync: localStorage.getItem('salon_last_sync') || 'Never'
        };
    }

    /**
     * Handle offline submission by storing locally
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
     * Load offline data from localStorage
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
     * Sync offline data when connection is restored
     */
    async syncOfflineData() {
        if (this.offlineData.length === 0) {
            return;
        }

        console.log(`[${new Date().toISOString()}] 🔄 Syncing ${this.offlineData.length} offline entries`);
        
        const syncPromises = this.offlineData.map(entry => 
            this.createTransaction(entry).catch(error => {
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
     * Clear offline data
     */
    clearOfflineData() {
        this.offlineData = [];
        localStorage.removeItem('salon_offline_data');
        console.log(`[${new Date().toISOString()}] ✅ Offline data cleared`);
    }

    /**
     * Get daily sales for a specific date
     */
    async getDailySales(data) {
        const { date } = data;
        
        const { data: sales, error } = await this.supabase
            .from('transactions')
            .select('*')
            .eq('date', date);

        if (error) {
            return { success: false, error: error.message };
        }

        const totalSales = sales.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
        const totalTips = sales.reduce((sum, transaction) => sum + parseFloat(transaction.tip || 0), 0);
        const cashTotal = sales
            .filter(t => t.payment_method === 'Cash')
            .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
        const cardTotal = sales
            .filter(t => t.payment_method === 'Card')
            .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);

        return {
            success: true,
            data: {
                date,
                total_sales: totalSales,
                total_tips: totalTips,
                cash_total: cashTotal,
                card_total: cardTotal,
                transaction_count: sales.length,
                transactions: sales
            }
        };
    }

    /**
     * Get worker performance data
     */
    async getWorkerPerformance() {
        const { data: transactions, error } = await this.supabase
            .from('transactions')
            .select('worker, amount, tip, date');

        if (error) {
            return { success: false, error: error.message };
        }

        const performance = {};
        transactions.forEach(transaction => {
            const worker = transaction.worker;
            if (!performance[worker]) {
                performance[worker] = {
                    worker,
                    transaction_count: 0,
                    total_sales: 0,
                    total_tips: 0,
                    average_transaction: 0,
                    last_transaction_date: null
                };
            }
            
            performance[worker].transaction_count++;
            performance[worker].total_sales += parseFloat(transaction.amount);
            performance[worker].total_tips += parseFloat(transaction.tip || 0);
            
            if (!performance[worker].last_transaction_date || 
                transaction.date > performance[worker].last_transaction_date) {
                performance[worker].last_transaction_date = transaction.date;
            }
        });

        // Calculate averages
        Object.values(performance).forEach(worker => {
            worker.average_transaction = worker.total_sales / worker.transaction_count;
        });

        return {
            success: true,
            data: Object.values(performance).sort((a, b) => b.total_sales - a.total_sales)
        };
    }

    /**
     * Get sales report for date range
     */
    async getSalesReport(data) {
        const { startDate, endDate } = data;
        
        const { data: transactions, error } = await this.supabase
            .from('transactions')
            .select('*')
            .gte('date', startDate)
            .lte('date', endDate);

        if (error) {
            return { success: false, error: error.message };
        }

        const totalSales = transactions.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
        const totalTips = transactions.reduce((sum, transaction) => sum + parseFloat(transaction.tip || 0), 0);
        const cashTotal = transactions
            .filter(t => t.payment_method === 'Cash')
            .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
        const cardTotal = transactions
            .filter(t => t.payment_method === 'Card')
            .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);

        return {
            success: true,
            data: {
                start_date: startDate,
                end_date: endDate,
                total_sales: totalSales,
                total_tips: totalTips,
                cash_total: cashTotal,
                card_total: cardTotal,
                transaction_count: transactions.length,
                transactions: transactions
            }
        };
    }

    /**
     * Get calendar data for a month
     */
    async getCalendarData(data) {
        const { month, year } = data;
        
        // Get start and end dates for the month
        const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];
        
        const { data: transactions, error } = await this.supabase
            .from('transactions')
            .select('date, amount, tip, payment_method')
            .gte('date', startDate)
            .lte('date', endDate);

        if (error) {
            return { success: false, error: error.message };
        }

        const calendarData = {};
        transactions.forEach(transaction => {
            const date = transaction.date;
            if (!calendarData[date]) {
                calendarData[date] = {
                    total_sales: 0,
                    total_tips: 0,
                    transaction_count: 0,
                    cash_total: 0,
                    card_total: 0
                };
            }
            
            calendarData[date].total_sales += parseFloat(transaction.amount);
            calendarData[date].total_tips += parseFloat(transaction.tip || 0);
            calendarData[date].transaction_count++;
            
            if (transaction.payment_method === 'Cash') {
                calendarData[date].cash_total += parseFloat(transaction.amount);
            } else {
                calendarData[date].card_total += parseFloat(transaction.amount);
            }
        });

        return {
            success: true,
            data: calendarData
        };
    }

    /**
     * Update transaction
     */
    async updateTransaction(data) {
        const { id, ...updateData } = data;
        
        const { data: result, error } = await this.supabase
            .from('transactions')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, message: 'Transaction updated successfully', data: result };
    }
}

// Create global instance
window.supabaseIntegration = new SupabaseIntegration();
