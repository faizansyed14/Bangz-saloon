/**
 * Salon Management System - Main Application Logic
 * Handles UI interactions, form management, and data flow
 */

class SalonManager {
    constructor() {
        this.workers = [];
        this.services = {};
        this.currentEntry = {};
        this.googleIntegration = new GoogleIntegration();
        this.servicesManager = new ServicesManager();
        
        this.init();
    }

    async init() {
        console.log(`[${new Date().toISOString()}] 🚀 Initializing Salon Management System`);
        
        try {
            this.setupEventListeners();
            await this.loadInitialData();
            this.setupNavigation();
            this.updateDashboard();
            
            console.log(`[${new Date().toISOString()}] ✅ Salon Management System initialized successfully`);
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error initializing system:`, error);
            this.showMessage('Failed to initialize system. Please refresh the page.', 'error');
        }
    }

    setupEventListeners() {
        console.log(`[${new Date().toISOString()}] 🔧 Setting up event listeners`);
        
        // Navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToSection(link.getAttribute('href').substring(1));
            });
        });

        // Mobile navigation toggle
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }

        // Service form
        const serviceForm = document.getElementById('service-form');
        if (serviceForm) {
            serviceForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission();
            });
        }

        // Service category change
        const serviceCategory = document.getElementById('service-category');
        if (serviceCategory) {
            serviceCategory.addEventListener('change', (e) => {
                this.updateServiceOptions(e.target.value);
            });
        }

        // Service type change
        const serviceType = document.getElementById('service-type');
        if (serviceType) {
            serviceType.addEventListener('change', (e) => {
                this.updateServiceCost(e.target.value);
            });
        }

        console.log(`[${new Date().toISOString()}] ✅ Event listeners setup complete`);
    }

    async loadInitialData() {
        console.log(`[${new Date().toISOString()}] 🔄 Loading initial data`);
        this.showLoading(true);

        try {
            // Load workers
            this.workers = await this.googleIntegration.getWorkers();
            this.populateWorkerDropdown();
            console.log(`[${new Date().toISOString()}] ✅ Worker data loaded successfully`);

            // Load services
            this.services = await this.googleIntegration.getServices();
            console.log(`[${new Date().toISOString()}] ✅ Service data loaded successfully`);

            // Load today's data for dashboard
            await this.loadDashboardData();

        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error loading initial data:`, error);
            this.showMessage('Failed to load data. Please check your connection.', 'error');
            
            // Fallback to default data
            this.loadFallbackData();
        } finally {
            this.showLoading(false);
        }
    }

    loadFallbackData() {
        console.log(`[${new Date().toISOString()}] 🔄 Loading fallback data`);
        
        // Default workers
        this.workers = ["Maria", "Ahmed", "Sarah", "John", "Lisa"];
        this.populateWorkerDropdown();

        // Default services
        this.services = {
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

        console.log(`[${new Date().toISOString()}] ✅ Fallback data loaded`);
    }

    populateWorkerDropdown() {
        const workerSelect = document.getElementById('worker-select');
        if (!workerSelect) return;

        // Clear existing options except the first one
        workerSelect.innerHTML = '<option value="">Select Worker</option>';
        
        this.workers.forEach(worker => {
            const option = document.createElement('option');
            option.value = worker;
            option.textContent = worker;
            workerSelect.appendChild(option);
        });

        console.log(`[${new Date().toISOString()}] ✅ Worker dropdown populated with ${this.workers.length} workers`);
    }

    updateServiceOptions(category) {
        const serviceTypeSelect = document.getElementById('service-type');
        if (!serviceTypeSelect) return;

        // Clear existing options
        serviceTypeSelect.innerHTML = '<option value="">Select Service</option>';
        
        if (category && this.services[category]) {
            Object.keys(this.services[category]).forEach(service => {
                const option = document.createElement('option');
                option.value = service;
                option.textContent = service;
                serviceTypeSelect.appendChild(option);
            });
        }

        // Reset cost
        this.updateServiceCost('');
        console.log(`[${new Date().toISOString()}] ✅ Service options updated for category: ${category}`);
    }

    updateServiceCost(serviceType) {
        const costInput = document.getElementById('service-cost');
        const categorySelect = document.getElementById('service-category');
        
        if (!costInput || !categorySelect) return;

        const category = categorySelect.value;
        
        if (category && serviceType && this.services[category] && this.services[category][serviceType]) {
            costInput.value = this.services[category][serviceType];
            console.log(`[${new Date().toISOString()}] 💰 Service cost updated: ${serviceType} = $${this.services[category][serviceType]}`);
        } else {
            costInput.value = '';
        }
    }

    async handleFormSubmission() {
        console.log(`[${new Date().toISOString()}] 📝 Handling form submission`);
        
        const formData = this.collectFormData();
        
        if (!this.validateFormData(formData)) {
            return;
        }

        this.setSubmitButtonLoading(true);

        try {
            const result = await this.googleIntegration.submitServiceEntry(formData);
            
            if (result.success) {
                console.log(`[${new Date().toISOString()}] ✅ Service entry submitted successfully`);
                this.showMessage('Service entry added successfully!', 'success');
                this.resetForm();
                await this.updateDashboard();
            } else {
                throw new Error(result.error || 'Unknown error occurred');
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error submitting service entry:`, error);
            this.showMessage('Failed to submit entry. Please try again.', 'error');
        } finally {
            this.setSubmitButtonLoading(false);
        }
    }

    collectFormData() {
        const form = document.getElementById('service-form');
        const formData = new FormData(form);
        
        return {
            worker: formData.get('worker'),
            category: formData.get('category'),
            service: formData.get('service'),
            cost: parseFloat(formData.get('cost')) || 0,
            payment: formData.get('payment'),
            customer: formData.get('customer') || '',
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString(),
            monthYear: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        };
    }

    validateFormData(data) {
        const requiredFields = ['worker', 'category', 'service', 'payment'];
        
        for (const field of requiredFields) {
            if (!data[field]) {
                this.showMessage(`Please select a ${field.replace('_', ' ')}`, 'error');
                return false;
            }
        }

        if (data.cost <= 0) {
            this.showMessage('Please select a valid service', 'error');
            return false;
        }

        return true;
    }

    resetForm() {
        const form = document.getElementById('service-form');
        if (form) {
            form.reset();
            this.updateServiceOptions('');
            this.updateServiceCost('');
        }
        console.log(`[${new Date().toISOString()}] ✅ Form reset successfully`);
    }

    setSubmitButtonLoading(loading) {
        const submitBtn = document.getElementById('submit-btn');
        if (!submitBtn) return;

        if (loading) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
        } else {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }

    setupNavigation() {
        // Set active nav link based on current section
        const sections = document.querySelectorAll('.section');
        const navLinks = document.querySelectorAll('.nav-link');
        
        // Default to dashboard
        this.navigateToSection('dashboard');
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

        // Close mobile menu
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            navMenu.classList.remove('active');
        }

        // Update dashboard if navigating to it
        if (sectionId === 'dashboard') {
            this.updateDashboard();
        }
    }

    async updateDashboard() {
        console.log(`[${new Date().toISOString()}] 📊 Updating dashboard`);
        
        try {
            await this.loadDashboardData();
            this.displayDashboardData();
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error updating dashboard:`, error);
        }
    }

    async loadDashboardData() {
        const today = new Date().toLocaleDateString();
        
        try {
            this.dashboardData = await this.googleIntegration.getDailyData(today);
            console.log(`[${new Date().toISOString()}] ✅ Dashboard data loaded for ${today}`);
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error loading dashboard data:`, error);
            this.dashboardData = {
                totalSales: 0,
                transactionCount: 0,
                cashTotal: 0,
                cardTotal: 0,
                workerStats: {},
                recentTransactions: []
            };
        }
    }

    displayDashboardData() {
        const data = this.dashboardData || {
            totalSales: 0,
            transactionCount: 0,
            cashTotal: 0,
            cardTotal: 0,
            workerStats: {},
            recentTransactions: []
        };

        // Update stat cards
        this.updateElement('total-sales', `$${data.totalSales.toFixed(2)}`);
        this.updateElement('transaction-count', data.transactionCount.toString());
        this.updateElement('cash-total', `$${data.cashTotal.toFixed(2)}`);
        this.updateElement('card-total', `$${data.cardTotal.toFixed(2)}`);

        // Update worker performance
        this.displayWorkerStats(data.workerStats);

        // Update recent transactions
        this.displayRecentTransactions(data.recentTransactions);

        console.log(`[${new Date().toISOString()}] 💰 Daily total calculated: $${data.totalSales.toFixed(2)}`);
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    displayWorkerStats(workerStats) {
        const container = document.getElementById('worker-performance');
        if (!container) return;

        container.innerHTML = '';

        if (Object.keys(workerStats).length === 0) {
            container.innerHTML = '<p class="text-secondary">No transactions today</p>';
            return;
        }

        Object.entries(workerStats).forEach(([worker, stats]) => {
            const workerItem = document.createElement('div');
            workerItem.className = 'worker-item';
            workerItem.innerHTML = `
                <span class="worker-name">${worker}</span>
                <span class="worker-total">$${stats.total.toFixed(2)} (${stats.count} transactions)</span>
            `;
            container.appendChild(workerItem);
        });
    }

    displayRecentTransactions(transactions) {
        const container = document.getElementById('recent-transactions');
        if (!container) return;

        container.innerHTML = '';

        if (transactions.length === 0) {
            container.innerHTML = '<p class="text-secondary">No recent transactions</p>';
            return;
        }

        transactions.slice(0, 5).forEach(transaction => {
            const transactionItem = document.createElement('div');
            transactionItem.className = 'transaction-item';
            transactionItem.innerHTML = `
                <div class="transaction-details">
                    <div class="transaction-service">${transaction.service}</div>
                    <div class="transaction-worker">${transaction.worker} • ${transaction.payment}</div>
                </div>
                <div class="transaction-amount">$${transaction.cost.toFixed(2)}</div>
            `;
            container.appendChild(transactionItem);
        });
    }

    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
        }
    }

    showMessage(message, type = 'info') {
        const container = document.getElementById('message-container');
        if (!container) return;

        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;

        container.appendChild(messageEl);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 5000);

        console.log(`[${new Date().toISOString()}] 📢 Message shown: ${message} (${type})`);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log(`[${new Date().toISOString()}] 🎯 DOM loaded, initializing Salon Manager`);
    window.salonManager = new SalonManager();
});

// Handle page visibility changes for data refresh
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.salonManager) {
        console.log(`[${new Date().toISOString()}] 👁️ Page visible, refreshing data`);
        window.salonManager.updateDashboard();
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    console.log(`[${new Date().toISOString()}] 🌐 Connection restored`);
    if (window.salonManager) {
        window.salonManager.showMessage('Connection restored', 'success');
        window.salonManager.updateDashboard();
    }
});

window.addEventListener('offline', () => {
    console.log(`[${new Date().toISOString()}] 📴 Connection lost`);
    if (window.salonManager) {
        window.salonManager.showMessage('Connection lost - working offline', 'warning');
    }
});
