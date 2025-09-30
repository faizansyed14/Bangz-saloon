/**
 * BANGZ SALOON - Admin Management System
 * Handles admin-specific UI interactions and data management
 */

class AdminManager {
    constructor() {
        this.workers = [];
        this.transactions = [];
        this.users = [];
        this.googleIntegration = window.supabaseIntegration;
        if (!this.googleIntegration) {
            console.error('Supabase integration not available in AdminManager');
        }
        this.currentUser = null;
        this.currentCalendarDate = new Date();
        this.selectedDate = null;
        this.calendarData = {};
        
        this.init();
    }

    async init() {
        console.log(`[${new Date().toISOString()}] 🚀 Initializing Admin Management System`);
        
        try {
            this.setupEventListeners();
            this.setupNavigation();
            this.setupUserInterface();
            await this.loadInitialData();
            this.updateDashboard();
            
            console.log(`[${new Date().toISOString()}] ✅ Admin Management System initialized successfully`);
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error initializing admin system:`, error);
            this.showMessage('Failed to initialize admin system. Please refresh the page.', 'error');
        }
    }

    setupEventListeners() {
        console.log(`[${new Date().toISOString()}] 🔧 Setting up admin event listeners`);
        
        // Navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    this.navigateToSection(href.substring(1));
                }
            });
        });

        // Create worker form
        const createWorkerForm = document.getElementById('create-worker-form');
        if (createWorkerForm) {
            createWorkerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateWorker();
            });
        }

        // Create user form
        const createUserForm = document.getElementById('create-user-form');
        if (createUserForm) {
            createUserForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateUser();
            });
        }

        // Edit user form
        const editUserForm = document.getElementById('edit-user-form');
        if (editUserForm) {
            editUserForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEditUser();
            });
        }

        // Edit worker form
        const editWorkerForm = document.getElementById('edit-worker-form');
        if (editWorkerForm) {
            editWorkerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEditWorker();
            });
        }

        // Modal close buttons
        const closeEditModal = document.getElementById('close-edit-modal');
        const cancelEdit = document.getElementById('cancel-edit');
        if (closeEditModal) {
            closeEditModal.addEventListener('click', () => this.closeEditModal());
        }
        if (cancelEdit) {
            cancelEdit.addEventListener('click', () => this.closeEditModal());
        }

        const closeEditUserModal = document.getElementById('close-edit-user-modal');
        const cancelEditUser = document.getElementById('cancel-edit-user');
        if (closeEditUserModal) {
            closeEditUserModal.addEventListener('click', () => this.closeEditUserModal());
        }
        if (cancelEditUser) {
            cancelEditUser.addEventListener('click', () => this.closeEditUserModal());
        }

        // Refresh dashboard button
        const refreshDashboardBtn = document.getElementById('refresh-dashboard');
        if (refreshDashboardBtn) {
            refreshDashboardBtn.addEventListener('click', async () => {
                await this.loadInitialData();
                this.updateDashboard();
                this.showMessage('Dashboard data refreshed!', 'success');
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('bangz_saloon_session');
                window.location.href = 'login.html';
            });
        }

        // Admin Calendar event listeners
        const adminShowAllCalendarBtn = document.getElementById('admin-show-all-calendar-btn');
        if (adminShowAllCalendarBtn) {
            adminShowAllCalendarBtn.addEventListener('click', () => {
                this.loadAdminCalendarData(true);
            });
        }

        const adminDownloadSelectedExcelBtn = document.getElementById('admin-download-selected-excel-btn');
        if (adminDownloadSelectedExcelBtn) {
            adminDownloadSelectedExcelBtn.addEventListener('click', () => {
                this.downloadSelectedDateExcel();
            });
        }

        const adminDownloadAllExcelBtn = document.getElementById('admin-download-all-excel-btn');
        if (adminDownloadAllExcelBtn) {
            adminDownloadAllExcelBtn.addEventListener('click', () => {
                this.downloadAllTransactionsExcel();
            });
        }

        // Costings management event listeners
        const addServiceBtn = document.getElementById('add-service-btn');
        if (addServiceBtn) {
            addServiceBtn.addEventListener('click', () => {
                this.openServiceModal();
            });
        }

        const refreshCostingsBtn = document.getElementById('refresh-costings-btn');
        if (refreshCostingsBtn) {
            refreshCostingsBtn.addEventListener('click', () => {
                this.loadCostingsData();
            });
        }

        const closeModal = document.getElementById('close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.closeServiceModal();
            });
        }

        const cancelServiceBtn = document.getElementById('cancel-service-btn');
        if (cancelServiceBtn) {
            cancelServiceBtn.addEventListener('click', () => {
                this.closeServiceModal();
            });
        }

        const serviceForm = document.getElementById('service-form');
        if (serviceForm) {
            serviceForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleServiceFormSubmit();
            });
        }

        // Mobile navigation toggle
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        const navOverlay = document.querySelector('.nav-overlay');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                if (navOverlay) {
                    navOverlay.classList.toggle('active');
                }
            });
        }
        
        // Close menu when clicking overlay
        if (navOverlay) {
            navOverlay.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navOverlay.classList.remove('active');
            });
        }
        
        // Close menu when clicking nav links
        const mobileNavLinks = document.querySelectorAll('.nav-link');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                if (navOverlay) {
                    navOverlay.classList.remove('active');
                }
            });
        });




        // Workers table event delegation
        const workersTable = document.getElementById('workers-table-body');
        if (workersTable) {
            workersTable.addEventListener('click', (e) => {
                if (e.target.classList.contains('edit-worker-btn')) {
                    const index = parseInt(e.target.getAttribute('data-index'));
                    this.editWorker(index);
                } else if (e.target.classList.contains('delete-worker-btn')) {
                    const index = parseInt(e.target.getAttribute('data-index'));
                    this.deleteWorker(index);
                }
            });
        }

        // Users table event delegation
        const usersTable = document.getElementById('users-table-body');
        if (usersTable) {
            usersTable.addEventListener('click', (e) => {
                if (e.target.classList.contains('edit-user-btn')) {
                    const index = parseInt(e.target.getAttribute('data-index'));
                    this.editUser(index);
                } else if (e.target.classList.contains('delete-user-btn')) {
                    const index = parseInt(e.target.getAttribute('data-index'));
                    this.deleteUser(index);
                }
            });
        }

    }

    async loadInitialData() {
        console.log(`[${new Date().toISOString()}] 🔄 Loading initial admin data`);
        this.showLoading(true);
        
        try {
            // Load users
            await this.loadUsers();
            console.log(`[${new Date().toISOString()}] 👤 Users loaded: ${this.users.length}`);
            
            // Load workers
            await this.loadWorkers();
            console.log(`[${new Date().toISOString()}] 👥 Workers loaded: ${this.workers.length}`);
            
            // Load transactions
            await this.loadTransactions();
            console.log(`[${new Date().toISOString()}] 💰 Transactions loaded: ${this.transactions.length}`);
            
            // Only add sample data if we have no transactions at all (not just empty arrays)
            if (this.transactions.length === 0) {
                console.log(`[${new Date().toISOString()}] 📊 No transactions found, adding sample data for testing`);
                this.addSampleData();
            } else {
                console.log(`[${new Date().toISOString()}] 📊 Found ${this.transactions.length} real transactions, skipping sample data`);
                // Make sure we don't override real workers with sample data
                if (this.workers.length > 0) {
                    console.log(`[${new Date().toISOString()}] 👥 Keeping real workers: ${this.workers.length}`);
                    this.populateWorkersTable();
                }
            }
            
            console.log(`[${new Date().toISOString()}] ✅ Initial admin data loaded successfully`);
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error loading initial data:`, error);
            this.showMessage('Failed to load data. Please try again.', 'error');
            
            // Add sample data as fallback
            this.addSampleData();
        } finally {
            this.showLoading(false);
        }
    }

    addSampleData() {
        console.log(`[${new Date().toISOString()}] 📊 Adding sample data for testing`);
        
        // Only add sample workers if we don't have real workers
        if (this.workers.length === 0) {
            this.workers = [
                {
                    name: 'John Smith',
                    role: 'Stylist',
                    email: 'john@bangzsaloon.com',
                    phone: '+971501234567',
                    status: 'Active',
                    createdAt: new Date().toISOString()
                },
                {
                    name: 'Sarah Johnson',
                    role: 'Hair Colorist',
                    email: 'sarah@bangzsaloon.com',
                    phone: '+971501234568',
                    status: 'Active',
                    createdAt: new Date().toISOString()
                }
            ];
        }
        
        // Only add sample transactions if we don't have real ones
        if (this.transactions.length === 0) {
            this.transactions = [
            {
                id: 'SAMPLE-001',
                date: new Date().toISOString().split('T')[0],
                time: '10:00 AM',
                worker: 'John Smith',
                service: 'Haircut',
                customer: 'Ahmed Ali',
                amount: '150',
                paymentMethod: 'Cash',
                notes: 'Sample transaction',
                createdAt: new Date().toISOString()
            },
            {
                id: 'SAMPLE-002',
                date: new Date().toISOString().split('T')[0],
                time: '11:30 AM',
                worker: 'Sarah Johnson',
                service: 'Hair Coloring',
                customer: 'Fatima Hassan',
                amount: '300',
                paymentMethod: 'Card',
                notes: 'Sample transaction',
                createdAt: new Date().toISOString()
            },
            {
                id: 'SAMPLE-003',
                date: new Date().toISOString().split('T')[0],
                time: '2:00 PM',
                worker: 'John Smith',
                service: 'Beard Trim',
                customer: 'Omar Khalil',
                amount: '80',
                paymentMethod: 'Cash',
                notes: 'Sample transaction',
                createdAt: new Date().toISOString()
            }
        ];
        }
        
        // Update tables
        this.populateWorkersTable();
        this.populateTransactionsTable();
        
        console.log(`[${new Date().toISOString()}] ✅ Sample data added: ${this.workers.length} workers, ${this.transactions.length} transactions`);
    }

    formatTimeFromDate(dateString) {
        if (!dateString) return 'N/A';
        
        try {
            // If it's already a time string, return it
            if (dateString.includes(':')) {
                return dateString;
            }
            
            // If it's a date string, try to extract time or return a default
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'N/A';
            }
            
            // Return formatted time
            return date.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });
        } catch (error) {
            console.error('Error formatting time:', error);
            return 'N/A';
        }
    }

    async loadUsers() {
        try {
            console.log(`[${new Date().toISOString()}] 🔄 Loading users...`);
            const result = await this.googleIntegration.makeRequest('getUsers', {}, 'GET');
            console.log(`[${new Date().toISOString()}] 👤 User result:`, result);
            
            if (result && result.success) {
                this.users = result.data || result.users || [];
                this.populateUsersTable();
                console.log(`[${new Date().toISOString()}] ✅ Loaded ${this.users.length} users`);
                
                // Log first few users for debugging
                if (this.users.length > 0) {
                    console.log(`[${new Date().toISOString()}] 👤 Sample user:`, this.users[0]);
                }
            } else {
                console.log(`[${new Date().toISOString()}] ❌ Failed to load users:`, result?.error);
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error loading users:`, error);
        }
    }

    async loadWorkers() {
        try {
            console.log(`[${new Date().toISOString()}] 🔄 Loading workers...`);
            const result = await this.googleIntegration.makeRequest('getWorkers', {}, 'GET');
            console.log(`[${new Date().toISOString()}] 👥 Worker result:`, result);
            
            if (result && result.success) {
                this.workers = result.data || result.workers || [];
                this.populateWorkersTable();
                console.log(`[${new Date().toISOString()}] ✅ Loaded ${this.workers.length} workers`);
                
                // Log first few workers for debugging
                if (this.workers.length > 0) {
                    console.log(`[${new Date().toISOString()}] 👥 Sample worker:`, this.workers[0]);
                }
            } else {
                console.log(`[${new Date().toISOString()}] ❌ Failed to load workers:`, result?.error);
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error loading workers:`, error);
        }
    }

    async loadTransactions() {
        try {
            console.log(`[${new Date().toISOString()}] 🔄 Loading transactions...`);
            const result = await this.googleIntegration.makeRequest('getTransactions', {}, 'GET');
            console.log(`[${new Date().toISOString()}] 📊 Transaction result:`, result);
            
            if (result && result.success) {
                // Handle both 'data' and 'transactions' response formats
                const rawTransactions = result.data || result.transactions || [];
                
                // Transform the data to match the expected format
                this.transactions = rawTransactions.map(transaction => ({
                    id: transaction.id || transaction.ID || '',
                    date: transaction.date || '',
                    time: this.formatTimeFromDate(transaction.createdat || transaction.createdAt) || 'N/A',
                    worker: transaction.worker || '',
                    service: transaction.service || '',
                    customer: transaction.customerName || transaction.customer || '',
                    amount: transaction.amount || 0,
                    tip: transaction.tip || 0,
                    paymentMethod: transaction.paymentMethod || transaction.payment || '',
                    notes: transaction.notes || '',
                    category: transaction.category || '',
                    createdAt: transaction.createdat || transaction.createdAt || '',
                    updatedAt: transaction.updatedat || transaction.updatedAt || ''
                }));
                
                this.populateTransactionsTable();
                console.log(`[${new Date().toISOString()}] ✅ Loaded ${this.transactions.length} transactions`);
                
                // Log first few transactions for debugging
                if (this.transactions.length > 0) {
                    console.log(`[${new Date().toISOString()}] 📊 Sample transaction:`, this.transactions[0]);
                }
            } else {
                console.log(`[${new Date().toISOString()}] ❌ Failed to load transactions:`, result?.error);
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error loading transactions:`, error);
        }
    }

    populateWorkersTable() {
        const tbody = document.getElementById('workers-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.workers.forEach((worker, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${worker.name || 'N/A'}</td>
                <td>${worker.role || 'N/A'}</td>
                <td>${worker.email || 'N/A'}</td>
                <td>${worker.phone || 'N/A'}</td>
                <td><span class="status-badge ${worker.status?.toLowerCase() || 'active'}">${worker.status || 'Active'}</span></td>
                <td>${worker.createdAt ? new Date(worker.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td class="actions-cell">
                    <button class="btn btn-sm btn-primary edit-worker-btn" data-index="${index}">Edit</button>
                    <button class="btn btn-sm btn-danger delete-worker-btn" data-index="${index}">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    populateTransactionsTable() {
        const tbody = document.getElementById('transactions-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.transactions.forEach((transaction, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.date || 'N/A'}</td>
                <td>${transaction.time || 'N/A'}</td>
                <td>${transaction.worker || 'N/A'}</td>
                <td>${transaction.service || 'N/A'}</td>
                <td><span class="category-badge ${(transaction.category || '').toLowerCase()}">${transaction.category || 'N/A'}</span></td>
                <td>${transaction.customer || 'N/A'}</td>
                <td>
                    ${transaction.amount ? `${transaction.amount} AED` : 'N/A'}
                    ${transaction.tip && transaction.tip > 0 ? `<br><small style="color: #f39c12;">💝 Tip: ${transaction.tip} AED</small>` : ''}
                </td>
                <td>${transaction.paymentMethod || 'N/A'}</td>
                <td>
                    <!-- Delete option removed for transactions -->
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async handleCreateWorker() {
        console.log(`[${new Date().toISOString()}] 👤 Handling create worker form submission`);
        
        const formData = this.collectCreateWorkerFormData();
        
        if (!this.validateCreateWorkerFormData(formData)) {
            return;
        }

        this.setCreateWorkerButtonLoading(true);

        try {
            // Create the worker
            const workerResult = await this.googleIntegration.makeRequest('createWorker', formData);
            
            if (workerResult && workerResult.success) {
                console.log(`[${new Date().toISOString()}] ✅ Worker created successfully: ${formData.name}`);
                this.showMessage(`Worker "${formData.name}" created successfully!`, 'success', true);
                
                this.resetCreateWorkerForm();
                
                // Reload workers table
                await this.loadWorkers();
                
                // Notify main interface to refresh worker dropdown
                if (window.salonManager && window.salonManager.refreshWorkers) {
                    await window.salonManager.refreshWorkers();
                }
            } else {
                throw new Error(workerResult?.error || 'Failed to create worker');
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error creating worker:`, error);
            this.showMessage('Failed to create worker. Please try again.', 'error');
        } finally {
            this.setCreateWorkerButtonLoading(false);
        }
    }

    collectCreateWorkerFormData() {
        const form = document.getElementById('create-worker-form');
        const formData = new FormData(form);
        
        return {
            name: formData.get('name'),
            role: formData.get('role'),
            phone: formData.get('phone') || '',
            status: formData.get('status'),
            createdBy: this.currentUser?.name || 'System',
            createdAt: new Date().toISOString()
        };
    }

    validateCreateWorkerFormData(data) {
        const requiredFields = ['name', 'role', 'status'];
        
        for (const field of requiredFields) {
            if (!data[field]) {
                this.showMessage(`Please fill in the ${field.replace('_', ' ')} field`, 'error');
                return false;
            }
        }

        return true;
    }

    resetCreateWorkerForm() {
        const form = document.getElementById('create-worker-form');
        if (form) {
            form.reset();
        }
        console.log(`[${new Date().toISOString()}] ✅ Create worker form reset successfully`);
    }

    setCreateWorkerButtonLoading(loading) {
        const createBtn = document.getElementById('create-worker-btn');
        const btnText = createBtn?.querySelector('.btn-text');
        const btnLoading = createBtn?.querySelector('.btn-loading');
        
        if (!createBtn) return;

        if (loading) {
            createBtn.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (btnLoading) btnLoading.style.display = 'inline';
        } else {
            createBtn.disabled = false;
            if (btnText) btnText.style.display = 'inline';
            if (btnLoading) btnLoading.style.display = 'none';
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    editWorker(index) {
        const worker = this.workers[index];
        if (!worker) return;

        // Populate edit form
        document.getElementById('edit-worker-id').value = index;
        document.getElementById('edit-worker-name').value = worker.name || '';
        document.getElementById('edit-worker-role').value = worker.role || '';
        document.getElementById('edit-worker-email').value = worker.email || '';
        document.getElementById('edit-worker-phone').value = worker.phone || '';
        document.getElementById('edit-worker-password').value = worker.password || '';
        document.getElementById('edit-worker-status').value = worker.status || 'Active';

        // Show modal
        document.getElementById('edit-worker-modal').style.display = 'block';
    }

    async handleEditWorker() {
        const formData = new FormData(document.getElementById('edit-worker-form'));
        const workerIndex = parseInt(formData.get('id'));
        const worker = this.workers[workerIndex];

        if (!worker) {
            this.showMessage('Worker not found', 'error');
            return;
        }

        const updatedWorker = {
            ...worker,
            name: formData.get('name'),
            role: formData.get('role'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            password: formData.get('password'),
            status: formData.get('status'),
            updatedAt: new Date().toISOString()
        };

        try {
            // Send the worker data with email for backend to find the worker
            const updateData = {
                ...updatedWorker,
                email: worker.email // Use original email to find the worker
            };
            
            console.log(`[${new Date().toISOString()}] 🔄 Updating worker with email: ${worker.email}`);
            
            const result = await this.googleIntegration.makeRequest('updateWorker', updateData);

            if (result && result.success) {
                this.workers[workerIndex] = updatedWorker;
                this.populateWorkersTable();
                this.closeEditModal();
                this.showMessage('Worker updated successfully!', 'success');
            } else {
                throw new Error(result?.error || 'Failed to update worker');
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error updating worker:`, error);
            this.showMessage('Failed to update worker. Please try again.', 'error');
        }
    }

    async deleteWorker(index) {
        const worker = this.workers[index];
        if (!worker) return;

        if (!confirm(`Are you sure you want to delete worker "${worker.name}"?`)) {
            return;
        }

        try {
            // Send the worker's email to the backend for deletion
            const deleteData = { 
                email: worker.email,
                index: index // Keep index as fallback
            };
            
            console.log(`[${new Date().toISOString()}] 🗑️ Deleting worker with email: ${worker.email}`);
            
            const result = await this.googleIntegration.makeRequest('deleteWorker', deleteData);

            if (result && result.success) {
                this.workers.splice(index, 1);
                this.populateWorkersTable();
                this.showMessage('Worker deleted successfully!', 'success');
            } else {
                throw new Error(result?.error || 'Failed to delete worker');
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error deleting worker:`, error);
            this.showMessage('Failed to delete worker. Please try again.', 'error');
        }
    }

    // deleteTransaction function removed - transactions cannot be deleted

    closeEditModal() {
        document.getElementById('edit-worker-modal').style.display = 'none';
    }

    populateUsersTable() {
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.users.forEach((user, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name || 'N/A'}</td>
                <td>${user.email || 'N/A'}</td>
                <td><span class="status-badge ${user.role?.toLowerCase() || 'worker'}">${user.role || 'Worker'}</span></td>
                <td>${user.phone || 'N/A'}</td>
                <td><span class="status-badge ${user.status?.toLowerCase() || 'active'}">${user.status || 'Active'}</span></td>
                <td>${user.createdat ? new Date(user.createdat).toLocaleDateString() : 'N/A'}</td>
                <td class="actions-cell">
                    <button class="btn btn-sm btn-primary edit-user-btn" data-index="${index}">Edit</button>
                    <button class="btn btn-sm btn-danger delete-user-btn" data-index="${index}">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async handleCreateUser() {
        console.log(`[${new Date().toISOString()}] 👤 Handling create user form submission`);
        
        const formData = this.collectCreateUserFormData();
        
        if (!this.validateCreateUserFormData(formData)) {
            return;
        }

        this.setCreateUserButtonLoading(true);

        try {
            const result = await this.googleIntegration.makeRequest('createUser', formData);
            
            if (result && result.success) {
                console.log(`[${new Date().toISOString()}] ✅ User created successfully: ${formData.name}`);
                this.showMessage(`User "${formData.name}" created successfully!`, 'success', true);
                this.resetCreateUserForm();
                
                // Reload users table
                await this.loadUsers();
            } else {
                throw new Error(result?.error || 'Failed to create user');
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error creating user:`, error);
            this.showMessage('Failed to create user. Please try again.', 'error');
        } finally {
            this.setCreateUserButtonLoading(false);
        }
    }

    collectCreateUserFormData() {
        const form = document.getElementById('create-user-form');
        const formData = new FormData(form);
        
        return {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            role: formData.get('role'),
            phone: formData.get('phone') || '',
            status: formData.get('status'),
            createdBy: this.currentUser?.name || 'System',
            createdAt: new Date().toISOString()
        };
    }

    validateCreateUserFormData(data) {
        const requiredFields = ['name', 'email', 'password', 'role', 'status'];
        
        for (const field of requiredFields) {
            if (!data[field]) {
                this.showMessage(`Please fill in the ${field.replace('_', ' ')} field`, 'error');
                return false;
            }
        }

        if (!this.isValidEmail(data.email)) {
            this.showMessage('Please enter a valid email address', 'error');
            return false;
        }

        if (data.password.length < 6) {
            this.showMessage('Password must be at least 6 characters long', 'error');
            return false;
        }

        return true;
    }

    resetCreateUserForm() {
        const form = document.getElementById('create-user-form');
        if (form) {
            form.reset();
        }
        console.log(`[${new Date().toISOString()}] ✅ Create user form reset successfully`);
    }

    setCreateUserButtonLoading(loading) {
        const createBtn = document.getElementById('create-user-btn');
        const btnText = createBtn?.querySelector('.btn-text');
        const btnLoading = createBtn?.querySelector('.btn-loading');
        
        if (!createBtn) return;

        if (loading) {
            createBtn.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (btnLoading) btnLoading.style.display = 'inline';
        } else {
            createBtn.disabled = false;
            if (btnText) btnText.style.display = 'inline';
            if (btnLoading) btnLoading.style.display = 'none';
        }
    }

    editUser(index) {
        const user = this.users[index];
        if (!user) return;

        // Populate edit form
        document.getElementById('edit-user-id').value = index;
        document.getElementById('edit-user-name').value = user.name || '';
        document.getElementById('edit-user-email').value = user.email || '';
        document.getElementById('edit-user-password').value = ''; // Don't show existing password
        document.getElementById('edit-user-role').value = user.role || 'Worker';
        document.getElementById('edit-user-phone').value = user.phone || '';
        document.getElementById('edit-user-status').value = user.status || 'Active';

        // Show modal
        document.getElementById('edit-user-modal').style.display = 'block';
    }

    async handleEditUser() {
        const formData = new FormData(document.getElementById('edit-user-form'));
        const userIndex = parseInt(formData.get('id'));
        const user = this.users[userIndex];

        if (!user) {
            this.showMessage('User not found', 'error');
            return;
        }

        const updatedUser = {
            ...user,
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'), // Will be hashed on server
            role: formData.get('role'),
            phone: formData.get('phone'),
            status: formData.get('status'),
            updatedAt: new Date().toISOString()
        };

        try {
            // Send the user data with email for backend to find the user
            const updateData = {
                ...updatedUser,
                email: user.email // Use original email to find the user
            };
            
            console.log(`[${new Date().toISOString()}] 🔄 Updating user with email: ${user.email}`);
            
            const result = await this.googleIntegration.makeRequest('updateUser', updateData);

            if (result && result.success) {
                this.users[userIndex] = updatedUser;
                this.populateUsersTable();
                this.closeEditUserModal();
                this.showMessage('User updated successfully!', 'success');
            } else {
                throw new Error(result?.error || 'Failed to update user');
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error updating user:`, error);
            this.showMessage('Failed to update user. Please try again.', 'error');
        }
    }

    async deleteUser(index) {
        const user = this.users[index];
        if (!user) return;

        if (!confirm(`Are you sure you want to delete user "${user.name}"?`)) {
            return;
        }

        try {
            // Send the user's email to the backend for deletion
            const deleteData = { 
                email: user.email,
                index: index // Keep index as fallback
            };
            
            console.log(`[${new Date().toISOString()}] 🗑️ Deleting user with email: ${user.email}`);
            
            const result = await this.googleIntegration.makeRequest('deleteUser', deleteData);

            if (result && result.success) {
                this.users.splice(index, 1);
                this.populateUsersTable();
                this.showMessage('User deleted successfully!', 'success');
            } else {
                throw new Error(result?.error || 'Failed to delete user');
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error deleting user:`, error);
            this.showMessage('Failed to delete user. Please try again.', 'error');
        }
    }

    closeEditUserModal() {
        document.getElementById('edit-user-modal').style.display = 'none';
    }

    setupNavigation() {
        // Set active nav link based on current section
        const currentHash = window.location.hash.substring(1);
        if (currentHash) {
            this.navigateToSection(currentHash);
        } else {
            this.navigateToSection('dashboard');
        }
    }

    navigateToSection(sectionId) {
        console.log(`[${new Date().toISOString()}] 🧭 Navigating to section: ${sectionId}`);
        
        // Hide all sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });

        // Update URL hash
        window.location.hash = sectionId;

        // Handle specific section actions
        if (sectionId === 'calendar') {
            // Load Calendar data when navigating to the section
            this.loadAdminCalendarData();
        } else if (sectionId === 'manage-costings') {
            // Load costings data when navigating to the section
            this.loadCostingsData();
        }
    }

    setupUserInterface() {
        // Set current user info
        const sessionData = localStorage.getItem('bangz_saloon_session');
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                this.currentUser = session.user;
                
                const userNameElement = document.getElementById('user-name');
                if (userNameElement && this.currentUser) {
                    userNameElement.textContent = `Welcome, ${this.currentUser.name}`;
                }
            } catch (error) {
                console.error(`[${new Date().toISOString()}] ❌ Error parsing session data:`, error);
            }
        }
    }

    async updateDashboard() {
        console.log(`[${new Date().toISOString()}] 📊 Updating admin dashboard with ${this.transactions.length} transactions and ${this.workers.length} workers`);
        
        // Load today's sales data
        await this.loadTodaySalesData();
        
        // Update overall dashboard statistics
        const totalSales = this.transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
        const transactionCount = this.transactions.length;
        const activeWorkers = this.workers.filter(w => w.status === 'Active').length;
        const totalRevenue = totalSales; // Same as total sales for now

        console.log(`[${new Date().toISOString()}] 📊 Overall stats - Sales: ${totalSales}, Transactions: ${transactionCount}, Active Workers: ${activeWorkers}`);

        // Update overall dashboard elements
        const totalSalesEl = document.getElementById('total-sales');
        const transactionCountEl = document.getElementById('transaction-count');
        const activeWorkersEl = document.getElementById('active-workers');
        const totalRevenueEl = document.getElementById('total-revenue');

        if (totalSalesEl) {
            totalSalesEl.textContent = `${totalSales.toFixed(2)} AED`;
            console.log(`[${new Date().toISOString()}] ✅ Updated total sales element`);
        } else {
            console.log(`[${new Date().toISOString()}] ❌ Total sales element not found`);
        }
        
        if (transactionCountEl) {
            transactionCountEl.textContent = transactionCount;
            console.log(`[${new Date().toISOString()}] ✅ Updated transaction count element`);
        } else {
            console.log(`[${new Date().toISOString()}] ❌ Transaction count element not found`);
        }
        
        if (activeWorkersEl) {
            activeWorkersEl.textContent = activeWorkers;
            console.log(`[${new Date().toISOString()}] ✅ Updated active workers element`);
        } else {
            console.log(`[${new Date().toISOString()}] ❌ Active workers element not found`);
        }
        
        if (totalRevenueEl) {
            totalRevenueEl.textContent = `${totalRevenue.toFixed(2)} AED`;
            console.log(`[${new Date().toISOString()}] ✅ Updated total revenue element`);
        } else {
            console.log(`[${new Date().toISOString()}] ❌ Total revenue element not found`);
        }

        // Update monthly stats
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyTransactions = this.transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
        });
        const monthlySales = monthlyTransactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

        const monthlySalesEl = document.getElementById('monthly-sales');
        const monthlyTransactionsEl = document.getElementById('monthly-transactions');

        if (monthlySalesEl) {
            monthlySalesEl.textContent = `${monthlySales.toFixed(2)} AED`;
            console.log(`[${new Date().toISOString()}] ✅ Updated monthly sales element`);
        } else {
            console.log(`[${new Date().toISOString()}] ❌ Monthly sales element not found`);
        }
        
        if (monthlyTransactionsEl) {
            monthlyTransactionsEl.textContent = monthlyTransactions.length;
            console.log(`[${new Date().toISOString()}] ✅ Updated monthly transactions element`);
        } else {
            console.log(`[${new Date().toISOString()}] ❌ Monthly transactions element not found`);
        }
    }

    async loadTodaySalesData() {
        try {
            const today = new Date().toLocaleDateString('en-GB');
            console.log(`[${new Date().toISOString()}] 🔄 Loading today's sales data for admin dashboard: ${today}`);
            
            const todayDataResult = await this.googleIntegration.getDailyData({ date: today });
            console.log(`[${new Date().toISOString()}] 📊 Today's data loaded:`, todayDataResult);
            
            // Extract data from response
            const todayData = todayDataResult && todayDataResult.success ? todayDataResult.data : {
                totalSales: 0,
                transactionCount: 0,
                cashTotal: 0,
                cardTotal: 0
            };
            
            // Update today's sales elements
            const todayTotalSalesEl = document.getElementById('admin-today-total-sales');
            const todayTransactionsEl = document.getElementById('admin-today-transactions');
            const todayCashEl = document.getElementById('admin-today-cash');
            const todayCardEl = document.getElementById('admin-today-card');

            if (todayTotalSalesEl) {
                todayTotalSalesEl.textContent = `${(todayData.totalSales || 0).toFixed(2)} AED`;
                console.log(`[${new Date().toISOString()}] ✅ Updated today's total sales: ${todayData.totalSales}`);
            }
            
            if (todayTransactionsEl) {
                todayTransactionsEl.textContent = (todayData.transactionCount || 0).toString();
                console.log(`[${new Date().toISOString()}] ✅ Updated today's transactions: ${todayData.transactionCount}`);
            }
            
            if (todayCashEl) {
                todayCashEl.textContent = `${(todayData.cashTotal || 0).toFixed(2)} AED`;
                console.log(`[${new Date().toISOString()}] ✅ Updated today's cash: ${todayData.cashTotal}`);
            }
            
            if (todayCardEl) {
                todayCardEl.textContent = `${(todayData.cardTotal || 0).toFixed(2)} AED`;
                console.log(`[${new Date().toISOString()}] ✅ Updated today's card: ${todayData.cardTotal}`);
            }
            
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error loading today's sales data:`, error);
            
            // Set default values if loading fails
            const todayTotalSalesEl = document.getElementById('admin-today-total-sales');
            const todayTransactionsEl = document.getElementById('admin-today-transactions');
            const todayCashEl = document.getElementById('admin-today-cash');
            const todayCardEl = document.getElementById('admin-today-card');

            if (todayTotalSalesEl) todayTotalSalesEl.textContent = '0.00 AED';
            if (todayTransactionsEl) todayTransactionsEl.textContent = '0';
            if (todayCashEl) todayCashEl.textContent = '0.00 AED';
            if (todayCardEl) todayCardEl.textContent = '0.00 AED';
        }
    }

    showLoading(show) {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = show ? 'flex' : 'none';
        }
    }

    showMessage(message, type = 'info', isNewEntry = false) {
        const messageContainer = document.getElementById('message-container');
        if (!messageContainer) return;

        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}${isNewEntry ? ' new-entry-popup' : ''}`;
        
        // Enhanced message content for new entries
        if (isNewEntry && type === 'success') {
            messageEl.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 15px; text-align: center;">
                    <div style="font-size: 48px; animation: bounce 1s ease-in-out;">✨</div>
                    <div>
                        <div style="font-weight: 700; margin-bottom: 8px; font-size: 20px;">New Entry Added!</div>
                        <div style="font-size: 16px; opacity: 0.9; line-height: 1.4;">${message}</div>
                        <div style="font-size: 14px; opacity: 0.7; margin-top: 8px;">Redirecting to dashboard...</div>
                    </div>
                </div>
            `;
        } else {
            messageEl.textContent = message;
        }

        messageContainer.appendChild(messageEl);

        // Add entrance animation
        messageEl.style.opacity = '0';
        messageEl.style.transform = 'translate(-50%, -50%) scale(0.8)';
        
        // Trigger animation
        setTimeout(() => {
            messageEl.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            messageEl.style.opacity = '1';
            messageEl.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 10);

        // Auto-remove after duration based on type
        const duration = isNewEntry ? 3000 : (type === 'error' ? 7000 : 5000);
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.style.transition = 'all 0.3s ease';
                messageEl.style.opacity = '0';
                messageEl.style.transform = 'translate(-50%, -50%) scale(0.8)';
                
                setTimeout(() => {
                    if (messageEl.parentNode) {
                        messageEl.parentNode.removeChild(messageEl);
                    }
                    
                    // Redirect to dashboard after successful new entry
                    if (isNewEntry && type === 'success') {
                        this.redirectToDashboard();
                    }
                }, 300);
            }
        }, duration);
    }

    redirectToDashboard() {
        console.log(`[${new Date().toISOString()}] 🔄 Redirecting to dashboard after successful entry`);
        
        // Find dashboard link and click it
        const dashboardLink = document.querySelector('a[href="#dashboard"]');
        if (dashboardLink) {
            dashboardLink.click();
        } else {
            // Fallback: manually switch to dashboard section
            this.switchSection('dashboard');
        }
    }

    // Admin Calendar Functions
    async loadAdminCalendarData(showAll = false) {
        console.log(`[${new Date().toISOString()}] 📅 Loading Admin Calendar data`);
        this.showLoading(true);

        try {
            // Get all sales data to populate calendar
            const salesData = await this.googleIntegration.getAllSales();
            
            if (salesData && salesData.success) {
                this.calendarData = this.processAdminCalendarData(salesData.data);
                this.renderAdminCalendar();
            } else {
                console.error(`[${new Date().toISOString()}] ❌ Failed to load calendar data:`, salesData);
                this.showMessage('Failed to load calendar data. Please try again.', 'error');
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error loading calendar data:`, error);
            this.showMessage('Failed to load calendar data. Please check your connection.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    processAdminCalendarData(salesData) {
        const calendarData = {};
        
        if (salesData && salesData.transactions) {
            salesData.transactions.forEach(transaction => {
                const date = transaction.date;
                if (!calendarData[date]) {
                    calendarData[date] = {
                        totalSales: 0,
                        transactionCount: 0,
                        transactions: []
                    };
                }
                
                calendarData[date].totalSales += parseFloat(transaction.amount) || 0;
                calendarData[date].transactionCount += 1;
                calendarData[date].transactions.push(transaction);
            });
        }
        
        return calendarData;
    }

    renderAdminCalendar() {
        const calendarPicker = document.getElementById('admin-calendar-picker');
        if (!calendarPicker) return;

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
        
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Create calendar header
        const headerControls = document.createElement('div');
        headerControls.className = 'calendar-header-controls';
        
        const prevBtn = document.createElement('button');
        prevBtn.className = 'calendar-nav-btn';
        prevBtn.innerHTML = '‹';
        prevBtn.addEventListener('click', () => {
            this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() - 1);
            this.renderAdminCalendar();
        });

        const monthYear = document.createElement('div');
        monthYear.className = 'calendar-month-year';
        monthYear.textContent = `${monthNames[this.currentCalendarDate.getMonth()]} ${this.currentCalendarDate.getFullYear()}`;

        const nextBtn = document.createElement('button');
        nextBtn.className = 'calendar-nav-btn';
        nextBtn.innerHTML = '›';
        nextBtn.addEventListener('click', () => {
            this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + 1);
            this.renderAdminCalendar();
        });

        headerControls.appendChild(prevBtn);
        headerControls.appendChild(monthYear);
        headerControls.appendChild(nextBtn);

        // Create calendar grid
        const grid = document.createElement('div');
        grid.className = 'calendar-grid';

        // Add day headers
        dayNames.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            grid.appendChild(dayHeader);
        });

        // Get first day of month and number of days
        const firstDay = new Date(this.currentCalendarDate.getFullYear(), this.currentCalendarDate.getMonth(), 1);
        const lastDay = new Date(this.currentCalendarDate.getFullYear(), this.currentCalendarDate.getMonth() + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day other-month';
            grid.appendChild(emptyDay);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;

            const today = new Date();
            const isToday = day === today.getDate() && 
                           this.currentCalendarDate.getMonth() === today.getMonth() && 
                           this.currentCalendarDate.getFullYear() === today.getFullYear();

            if (isToday) {
                dayElement.classList.add('today');
            }

            // Check if this date has sales data
            const dateString = `${day.toString().padStart(2, '0')}/${(this.currentCalendarDate.getMonth() + 1).toString().padStart(2, '0')}/${this.currentCalendarDate.getFullYear()}`;
            const dayData = this.calendarData[dateString];

            if (dayData && dayData.totalSales > 0) {
                dayElement.classList.add('has-data');
                dayElement.title = `Sales: ${dayData.totalSales.toFixed(2)} AED (${dayData.transactionCount} transactions)`;
            }

            // Check if this date is selected
            if (this.selectedDate === dateString) {
                dayElement.classList.add('selected');
            }

            dayElement.addEventListener('click', () => {
                this.selectAdminDate(dateString, dayData);
            });

            grid.appendChild(dayElement);
        }

        // Clear and populate calendar
        calendarPicker.innerHTML = '';
        calendarPicker.appendChild(headerControls);
        calendarPicker.appendChild(grid);
    }

    selectAdminDate(dateString, dayData) {
        console.log(`[${new Date().toISOString()}] 📅 Admin date selected: ${dateString}`);
        
        // Update selected date
        this.selectedDate = dateString;
        
        // Update calendar display
        this.renderAdminCalendar();
        
        // Update selected date display
        const selectedDateDisplay = document.getElementById('admin-selected-date-display');
        if (selectedDateDisplay) {
            if (dayData && dayData.totalSales > 0) {
                selectedDateDisplay.textContent = `${dateString} - Sales: ${dayData.totalSales.toFixed(2)} AED (${dayData.transactionCount} transactions)`;
            } else {
                selectedDateDisplay.textContent = `${dateString} - No sales data`;
            }
        }
        
        // Load and display sales data for selected date
        this.loadAdminSalesDataForDate(dateString);
    }

    async loadAdminSalesDataForDate(dateString) {
        console.log(`[${new Date().toISOString()}] 📊 Loading admin sales data for ${dateString}`);
        this.showLoading(true);

        try {
            const salesData = await this.googleIntegration.getAllSales({ date: dateString });
            
            if (salesData && salesData.success) {
                this.displayAdminSalesData(salesData.data);
            } else {
                console.error(`[${new Date().toISOString()}] ❌ Failed to load sales data for ${dateString}:`, salesData);
                this.showMessage('Failed to load sales data for selected date.', 'error');
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error loading sales data for ${dateString}:`, error);
            this.showMessage('Failed to load sales data. Please check your connection.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    displayAdminSalesData(data) {
        // Update summary cards
        this.updateAdminSummaryCards(data);
        
        // Display worker sales
        this.displayAdminWorkerSales(data.workerStats);
        
        // Display sales table
        this.displayAdminSalesTable(data.transactions);
    }

    updateAdminSummaryCards(data) {
        const totalSalesElement = document.getElementById('admin-total-sales-today');
        const totalTransactionsElement = document.getElementById('admin-total-transactions-today');
        const activeWorkersElement = document.getElementById('admin-active-workers-today');

        if (totalSalesElement) {
            totalSalesElement.textContent = `${data.totalSales.toFixed(2)} AED`;
        }
        if (totalTransactionsElement) {
            totalTransactionsElement.textContent = data.totalTransactions.toString();
        }
        if (activeWorkersElement) {
            activeWorkersElement.textContent = Object.keys(data.workerStats).length.toString();
        }
    }

    displayAdminWorkerSales(workerStats) {
        const workerSalesList = document.getElementById('admin-worker-sales-list');
        if (!workerSalesList) return;

        workerSalesList.innerHTML = '';

        Object.entries(workerStats).forEach(([workerName, stats]) => {
            const workerCard = document.createElement('div');
            workerCard.className = 'worker-sales-card';
            workerCard.innerHTML = `
                <div class="worker-sales-header">
                    <span class="worker-name">${workerName}</span>
                    <div class="worker-total">
                        <span class="worker-total-label">Total</span>
                        <span>${stats.totalSales.toFixed(2)} AED</span>
                    </div>
                </div>
                <div class="worker-sales-details">
                    <div class="sales-stat">
                        <span class="stat-label">Transactions:</span>
                        <span class="stat-value">${stats.transactionCount}</span>
                    </div>
                    <div class="sales-stat">
                        <span class="stat-label">Cash:</span>
                        <span class="stat-value cash-card">${stats.cashTotal.toFixed(2)} AED</span>
                    </div>
                    <div class="sales-stat">
                        <span class="stat-label">Card:</span>
                        <span class="stat-value cash-card">${stats.cardTotal.toFixed(2)} AED</span>
                    </div>
                </div>
            `;
            workerSalesList.appendChild(workerCard);
        });
    }

    displayAdminSalesTable(transactions) {
        const tableBody = document.getElementById('admin-daily-sales-table-body');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        if (transactions && transactions.length > 0) {
            transactions.forEach(transaction => {
                const row = document.createElement('tr');
                const time = this.formatTimeFromDate(transaction.created_at);
                
                row.innerHTML = `
                    <td>${transaction.date || ''}</td>
                    <td>${transaction.worker || 'Unknown'}</td>
                    <td>${transaction.service || 'Unknown'}</td>
                    <td><span class="category-badge ${(transaction.category || '').toLowerCase()}">${transaction.category || 'N/A'}</span></td>
                    <td>${transaction.customer_name || 'Unknown'}</td>
                    <td>
                        ${(transaction.amount || 0).toFixed(2)} AED
                        ${transaction.tip && transaction.tip > 0 ? `<br><small style="color: #f39c12;">💝 Tip: ${transaction.tip.toFixed(2)} AED</small>` : ''}
                    </td>
                    <td>${transaction.payment_method || 'Unknown'}</td>
                    <td>${time || ''}</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="8" style="text-align: center; color: #666;">No transactions found for selected date</td>';
            tableBody.appendChild(row);
        }
    }

    // Admin All Sales Functions
    async loadAdminAllSalesData(showAll = false) {
        console.log(`[${new Date().toISOString()}] 🔄 Loading Admin All Sales data`);
        this.showLoading(true);

        try {
            const dateFilter = document.getElementById('admin-sales-date-filter');
            const filterDate = showAll ? null : (dateFilter ? dateFilter.value : null);

            // Get all sales data
            const salesData = await this.googleIntegration.getAllSales(filterDate);
            
            if (salesData && salesData.success) {
                this.displayAdminAllSalesData(salesData.data);
            } else {
                console.error(`[${new Date().toISOString()}] ❌ Failed to load sales data:`, salesData);
                this.showMessage('Failed to load sales data. Please try again.', 'error');
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error loading Admin All Sales data:`, error);
            this.showMessage('Failed to load sales data. Please check your connection.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    displayAdminAllSalesData(data) {
        console.log(`[${new Date().toISOString()}] 📊 Displaying Admin All Sales data:`, data);

        // Update summary cards
        this.updateAdminSummaryCards(data);

        // Display worker sales breakdown
        this.displayAdminWorkerSales(data.workerStats);

        // Display detailed sales table
        this.displayAdminSalesTable(data.transactions);
    }

    updateAdminSummaryCards(data) {
        const totalSalesElement = document.getElementById('admin-total-sales-today');
        const totalTransactionsElement = document.getElementById('admin-total-transactions-today');
        const activeWorkersElement = document.getElementById('admin-active-workers-today');

        if (totalSalesElement) {
            totalSalesElement.textContent = `${data.totalSales.toFixed(2)} AED`;
        }

        if (totalTransactionsElement) {
            totalTransactionsElement.textContent = data.totalTransactions.toString();
        }

        if (activeWorkersElement) {
            const activeWorkers = Object.keys(data.workerStats).length;
            activeWorkersElement.textContent = activeWorkers.toString();
        }
    }

    displayAdminWorkerSales(workerStats) {
        const workerSalesList = document.getElementById('admin-worker-sales-list');
        if (!workerSalesList) return;

        workerSalesList.innerHTML = '';

        Object.keys(workerStats).forEach(worker => {
            const stats = workerStats[worker];
            const workerCard = document.createElement('div');
            workerCard.className = 'worker-sales-card';
            workerCard.innerHTML = `
                <div class="worker-sales-header">
                    <h4>${worker}</h4>
                    <span class="worker-total">${stats.total.toFixed(2)} AED</span>
                </div>
                <div class="worker-sales-details">
                    <div class="sales-stat">
                        <span class="stat-label">Transactions:</span>
                        <span class="stat-value">${stats.count}</span>
                    </div>
                    <div class="sales-stat">
                        <span class="stat-label">Cash:</span>
                        <span class="stat-value">${stats.cashTotal.toFixed(2)} AED</span>
                    </div>
                    <div class="sales-stat">
                        <span class="stat-label">Card:</span>
                        <span class="stat-value">${stats.cardTotal.toFixed(2)} AED</span>
                    </div>
                </div>
            `;
            workerSalesList.appendChild(workerCard);
        });
    }

    displayAdminSalesTable(transactions) {
        const tableBody = document.getElementById('admin-daily-sales-table-body');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        transactions.forEach(transaction => {
            const row = document.createElement('tr');
            const time = this.formatTimeFromDate(transaction.created_at);
            
            row.innerHTML = `
                <td>${transaction.date}</td>
                <td>${transaction.worker}</td>
                <td>${transaction.service}</td>
                <td><span class="category-badge ${(transaction.category || '').toLowerCase()}">${transaction.category || 'N/A'}</span></td>
                <td>${transaction.customer_name}</td>
                <td>
                    ${transaction.amount.toFixed(2)} AED
                    ${transaction.tip && transaction.tip > 0 ? `<br><small style="color: #f39c12;">💝 Tip: ${transaction.tip.toFixed(2)} AED</small>` : ''}
                </td>
                <td>${transaction.payment_method}</td>
                <td>${time}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    formatTimeFromDate(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
        } catch (error) {
            return '';
        }
    }

    async downloadSelectedDateExcel() {
        console.log(`[${new Date().toISOString()}] 📊 Downloading Selected Date Excel`);
        
        if (!this.selectedDate) {
            this.showMessage('Please select a date from the calendar first.', 'warning');
            return;
        }

        try {
            // Get daily data for the selected date
            const result = await this.googleIntegration.getDailyData(this.selectedDate);
            
            if (!result || !result.success || !result.data) {
                this.showMessage('Failed to load transaction data for the selected date.', 'error');
                return;
            }

            const dailyData = result.data;
            const transactions = dailyData.recentTransactions || [];
            
            if (transactions.length === 0) {
                this.showMessage(`No transaction data available for ${this.selectedDate}.`, 'warning');
                return;
            }

            // Create CSV content with proper headers
            let csvContent = 'Transaction ID,Date,Time,Worker,Service,Category,Customer,Amount,Tip,Payment Method,Phone,Notes,Created At,Updated At\n';
            
            // Process each transaction
            transactions.forEach(transaction => {
            const rowData = [
                    `"${transaction.id || ''}"`,
                    `"${transaction.date || ''}"`,
                    `"${transaction.time || ''}"`,
                    `"${transaction.worker || ''}"`,
                    `"${transaction.service || ''}"`,
                    `"${transaction.category || ''}"`,
                    `"${transaction.customer || transaction.customerName || ''}"`,
                    `"${transaction.amount || 0}"`,
                    `"${transaction.tip || 0}"`,
                    `"${transaction.paymentMethod || ''}"`,
                    `"${transaction.phone || ''}"`,
                    `"${transaction.notes || ''}"`,
                    `"${transaction.createdAt || transaction.createdat || ''}"`,
                    `"${transaction.updatedAt || transaction.updatedat || ''}"`
            ];
            csvContent += rowData.join(',') + '\n';
        });

            // Create and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
            
            // Generate filename with selected date
            const dateStr = this.selectedDate.replace(/\//g, '-');
            const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
            
        link.setAttribute('href', url);
            link.setAttribute('download', `BANGZ_SALOON_${dateStr}_Transactions_${timeStr}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
            this.showMessage(`Selected date transactions downloaded successfully! (${transactions.length} transactions for ${this.selectedDate})`, 'success');
            
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error downloading selected date data:`, error);
            this.showMessage('Failed to download selected date data. Please try again.', 'error');
        }
    }

    async downloadAllTransactionsExcel() {
        console.log(`[${new Date().toISOString()}] 📊 Downloading All Transactions Excel`);
        
        try {
            // Get all transactions data from the API
            const result = await this.googleIntegration.makeRequest('getTransactions');
            
            if (!result || !result.success || !result.data) {
                this.showMessage('Failed to load transaction data for download.', 'error');
                return;
            }

            const transactions = result.data;
            
            if (transactions.length === 0) {
                this.showMessage('No transaction data available to download.', 'warning');
                return;
            }

            // Create CSV content with proper headers
            let csvContent = 'Transaction ID,Date,Time,Worker,Service,Category,Customer,Amount,Tip,Payment Method,Phone,Notes,Created At,Updated At\n';
            
            // Process each transaction
            transactions.forEach(transaction => {
                const rowData = [
                    `"${transaction.id || ''}"`,
                    `"${transaction.date || ''}"`,
                    `"${transaction.time || ''}"`,
                    `"${transaction.worker || ''}"`,
                    `"${transaction.service || ''}"`,
                    `"${transaction.category || ''}"`,
                    `"${transaction.customer || transaction.customerName || ''}"`,
                    `"${transaction.amount || 0}"`,
                    `"${transaction.tip || 0}"`,
                    `"${transaction.paymentMethod || ''}"`,
                    `"${transaction.phone || ''}"`,
                    `"${transaction.notes || ''}"`,
                    `"${transaction.createdAt || transaction.createdat || ''}"`,
                    `"${transaction.updatedAt || transaction.updatedat || ''}"`
                ];
                csvContent += rowData.join(',') + '\n';
            });

            // Create and download the file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            // Generate filename with current date
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
            
            link.setAttribute('href', url);
            link.setAttribute('download', `BANGZ_SALOON_All_Transactions_${dateStr}_${timeStr}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showMessage(`All transactions downloaded successfully! (${transactions.length} transactions)`, 'success');
            
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error downloading all transactions:`, error);
            this.showMessage('Failed to download all transactions. Please try again.', 'error');
        }
    }

    // Costings Management Functions
    async loadCostingsData() {
        console.log(`[${new Date().toISOString()}] 📊 Loading costings data`);
        this.showLoading(true);

        try {
            const result = await this.googleIntegration.makeRequest('getServices');
            
            if (result && result.success && result.data) {
                this.displayCostingsTable(result.data);
                this.updateCostingsSummary(result.data);
            } else {
                console.error(`[${new Date().toISOString()}] ❌ Failed to load costings data:`, result);
                this.showMessage('Failed to load costings data. Please try again.', 'error');
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error loading costings data:`, error);
            this.showMessage('Failed to load costings data. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    displayCostingsTable(servicesData) {
        const tableBody = document.getElementById('costings-table-body');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        // Flatten the services data into a single array
        const allServices = [];
        Object.keys(servicesData).forEach(category => {
            Object.keys(servicesData[category]).forEach(serviceName => {
                allServices.push({
                    category: category,
                    serviceName: serviceName,
                    cost: servicesData[category][serviceName]
                });
            });
        });

        // Sort by category, then by service name
        allServices.sort((a, b) => {
            if (a.category !== b.category) {
                return a.category.localeCompare(b.category);
            }
            return a.serviceName.localeCompare(b.serviceName);
        });

        allServices.forEach(service => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="category-badge ${service.category.toLowerCase()}">${service.category}</span></td>
                <td>${service.serviceName}</td>
                <td>${service.cost} AED</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-service-btn" 
                            data-category="${service.category}" 
                            data-service="${service.serviceName}" 
                            data-cost="${service.cost}">
                        Edit
                    </button>
                    <button class="btn btn-sm btn-danger delete-service-btn" 
                            data-category="${service.category}" 
                            data-service="${service.serviceName}">
                        Delete
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Add event listeners for edit and delete buttons
        this.setupCostingsEventListeners();
    }

    setupCostingsEventListeners() {
        // Edit buttons
        const editButtons = document.querySelectorAll('.edit-service-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                const serviceName = e.target.dataset.service;
                const cost = e.target.dataset.cost;
                this.editService(category, serviceName, cost);
            });
        });

        // Delete buttons
        const deleteButtons = document.querySelectorAll('.delete-service-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                const serviceName = e.target.dataset.service;
                this.deleteService(category, serviceName);
            });
        });
    }

    updateCostingsSummary(servicesData) {
        let totalServices = 0;
        let promotionalCount = 0;
        let normalCount = 0;
        let totalCost = 0;

        Object.keys(servicesData).forEach(category => {
            const services = servicesData[category];
            const categoryCount = Object.keys(services).length;
            totalServices += categoryCount;

            if (category === 'Promotional') {
                promotionalCount = categoryCount;
            } else if (category === 'Normal') {
                normalCount = categoryCount;
            }

            Object.values(services).forEach(cost => {
                totalCost += cost;
            });
        });

        const averageCost = totalServices > 0 ? (totalCost / totalServices).toFixed(2) : 0;

        // Update summary cards
        const totalServicesEl = document.getElementById('total-services-count');
        const promotionalServicesEl = document.getElementById('promotional-services-count');
        const normalServicesEl = document.getElementById('normal-services-count');
        const averageCostEl = document.getElementById('average-cost');

        if (totalServicesEl) totalServicesEl.textContent = totalServices;
        if (promotionalServicesEl) promotionalServicesEl.textContent = promotionalCount;
        if (normalServicesEl) normalServicesEl.textContent = normalCount;
        if (averageCostEl) averageCostEl.textContent = `${averageCost} AED`;
    }

    openServiceModal(editData = null) {
        const modal = document.getElementById('service-modal');
        const modalTitle = document.getElementById('modal-title');
        const form = document.getElementById('service-form');
        
        if (editData) {
            modalTitle.textContent = 'Edit Service';
            document.getElementById('service-category').value = editData.category;
            document.getElementById('service-name').value = editData.serviceName;
            document.getElementById('service-cost').value = editData.cost;
            
            // Store original data for update
            form.dataset.originalCategory = editData.category;
            form.dataset.originalServiceName = editData.serviceName;
        } else {
            modalTitle.textContent = 'Add New Service';
            form.reset();
            delete form.dataset.originalCategory;
            delete form.dataset.originalServiceName;
        }
        
        modal.style.display = 'block';
    }

    closeServiceModal() {
        const modal = document.getElementById('service-modal');
        modal.style.display = 'none';
    }

    async handleServiceFormSubmit() {
        const form = document.getElementById('service-form');
        const formData = new FormData(form);
        
        const serviceData = {
            category: formData.get('category'),
            serviceName: formData.get('serviceName'),
            cost: parseFloat(formData.get('cost'))
        };

        // Check if this is an edit operation
        const isEdit = form.dataset.originalCategory && form.dataset.originalServiceName;
        
        try {
            let result;
            if (isEdit) {
                // Update existing service
                result = await this.googleIntegration.makeRequest('updateService', {
                    oldCategory: form.dataset.originalCategory,
                    oldServiceName: form.dataset.originalServiceName,
                    ...serviceData
                });
            } else {
                // Add new service
                result = await this.googleIntegration.makeRequest('addService', serviceData);
            }

            if (result && result.success) {
                this.showMessage(result.message, 'success', true);
                this.closeServiceModal();
                this.loadCostingsData(); // Refresh the table
            } else {
                this.showMessage(result?.error || 'Failed to save service', 'error');
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error saving service:`, error);
            this.showMessage('Failed to save service. Please try again.', 'error');
        }
    }

    editService(category, serviceName, cost) {
        this.openServiceModal({
            category: category,
            serviceName: serviceName,
            cost: cost
        });
    }

    async deleteService(category, serviceName) {
        if (!confirm(`Are you sure you want to delete "${serviceName}" from ${category} category?`)) {
            return;
        }

        try {
            const result = await this.googleIntegration.makeRequest('deleteService', {
                category: category,
                serviceName: serviceName
            });

            if (result && result.success) {
                this.showMessage(result.message, 'success');
                this.loadCostingsData(); // Refresh the table
            } else {
                this.showMessage(result?.error || 'Failed to delete service', 'error');
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error deleting service:`, error);
            this.showMessage('Failed to delete service. Please try again.', 'error');
        }
    }

}

// Initialize admin manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
    
    // Make test functions available globally for debugging
    window.testAdminTodaySales = () => window.adminManager.testTodaySales();
});

// Test function for admin today's sales
window.testAdminTodaySales = async function() {
    console.log(`[${new Date().toISOString()}] 🧪 Testing admin today's sales functionality`);
    
    try {
        const today = new Date().toLocaleDateString('en-GB');
        console.log(`[${new Date().toISOString()}] 📅 Testing for date: ${today}`);
        
        // Test loading today's sales data
        await window.adminManager.loadTodaySalesData();
        
        // Check if elements are updated
        const todayTotalSales = document.getElementById('admin-today-total-sales')?.textContent;
        const todayTransactions = document.getElementById('admin-today-transactions')?.textContent;
        const todayCash = document.getElementById('admin-today-cash')?.textContent;
        const todayCard = document.getElementById('admin-today-card')?.textContent;
        
        console.log(`[${new Date().toISOString()}] 📊 Today's Sales Results:`);
        console.log(`[${new Date().toISOString()}] 💰 Total Sales: ${todayTotalSales}`);
        console.log(`[${new Date().toISOString()}] 📝 Transactions: ${todayTransactions}`);
        console.log(`[${new Date().toISOString()}] 💵 Cash: ${todayCash}`);
        console.log(`[${new Date().toISOString()}] 💳 Card: ${todayCard}`);
        
        return {
            todayTotalSales,
            todayTransactions,
            todayCash,
            todayCard
        };
        } catch (error) {
        console.error(`[${new Date().toISOString()}] ❌ Error testing admin today's sales:`, error);
        return null;
    }
};
