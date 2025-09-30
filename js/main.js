/**
 * BANGZ SALOON - Professional Salon Management System
 * Handles UI interactions, form management, and data flow
 */

class SalonManager {
    constructor() {
        this.workers = [];
        this.services = {};
        this.currentEntry = {};
        this.googleIntegration = new SupabaseIntegration();
        this.currentCalendarDate = new Date();
        this.selectedDate = null;
        this.calendarData = {};
        
        this.init();
    }

    async init() {
        console.log(`[${new Date().toISOString()}] 🚀 Initializing BANGZ SALOON Management System`);
        
        try {
            // Wait for admin manager to be ready
            
            // Check if user is authenticated
            if (!this.checkAuthentication()) {
                return;
            }
            
            this.setupEventListeners();
            await this.loadInitialData();
            this.setupNavigation();
            this.setupUserInterface();
            this.updateDashboard();
            
            console.log(`[${new Date().toISOString()}] ✅ BANGZ SALOON Management System initialized successfully`);
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error initializing system:`, error);
            this.showMessage('Failed to initialize system. Please refresh the page.', 'error');
        }
    }


    checkAuthentication() {
        // Check if user is authenticated via the auth system
        const sessionData = localStorage.getItem('bangz_saloon_session');
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                const now = new Date().getTime();
                
                if (session.expiresAt > now) {
                    // Check if user is admin and redirect to admin page
                    if (session.user.role === 'Admin') {
                        console.log(`[${new Date().toISOString()}] 🔐 Admin user detected, redirecting to admin page`);
                        window.location.href = 'admin.html';
                        return false;
                    }
                    
                    // User is authenticated worker, show main content
                    const mainContent = document.getElementById('main-content');
                    const userInfo = document.getElementById('user-info');
                    
                    if (mainContent) mainContent.style.display = 'block';
                    if (userInfo) userInfo.style.display = 'flex';
                    
                    // Set current user for the system
                    this.currentUser = session.user;
                    
                    // Make sure we start on dashboard
                    this.navigateToSection('dashboard');
                    
                    return true;
                } else {
                    // Session expired
                    localStorage.removeItem('bangz_saloon_session');
                }
            } catch (error) {
                // Invalid session data
                localStorage.removeItem('bangz_saloon_session');
            }
        }
        
        // If no valid authentication, redirect to login
        window.location.href = 'login.html';
        return false;
    }

    setupEventListeners() {
        console.log(`[${new Date().toISOString()}] 🔧 Setting up event listeners`);
        
        // Navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href === 'index.html') {
                    // Refresh workers when navigating to main page
                    this.refreshWorkers();
                }
                this.navigateToSection(href.substring(1));
            });
        });

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

        // Hash change listener
        window.addEventListener('hashchange', () => {
            const currentHash = window.location.hash.substring(1);
            if (currentHash === 'admin') {
                this.navigateToSection('admin');
            }
        });

        // Service form
        const serviceForm = document.getElementById('service-form');
        if (serviceForm) {
            serviceForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission();
            });
        }

        // Service box selection
        this.initializeServiceSelection();

        // Service category change
        const serviceCategory = document.getElementById('service-category');
        if (serviceCategory) {
            serviceCategory.addEventListener('change', (e) => {
                this.loadServicesForCategory(e.target.value);
            });
        }


        // Refresh data button
        const refreshBtn = document.getElementById('refresh-data');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                await this.refreshWorkers();
                await this.refreshServices();
                await this.updateDashboard();
                this.showMessage('Data refreshed successfully!', 'success');
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                // Clear session and redirect to login
                localStorage.removeItem('bangz_saloon_session');
                window.location.href = 'login.html';
            });
        }

        // All Sales event listeners
        const filterSalesBtn = document.getElementById('filter-sales-btn');
        if (filterSalesBtn) {
            filterSalesBtn.addEventListener('click', () => {
                this.loadAllSalesData();
            });
        }

        const showAllSalesBtn = document.getElementById('show-all-sales-btn');
        if (showAllSalesBtn) {
            showAllSalesBtn.addEventListener('click', () => {
                this.loadAllSalesData(true);
            });
        }

        console.log(`[${new Date().toISOString()}] ✅ Event listeners setup complete`);
    }

    setupUserInterface() {
        // Display current user information
        const userNameElement = document.getElementById('user-name');
        
        if (this.currentUser && userNameElement) {
            userNameElement.textContent = `Welcome, ${this.currentUser.name}`;
            
            // Update navigation based on user role
            this.updateNavigationForRole(this.currentUser.role);
        } else if (userNameElement) {
            userNameElement.textContent = 'Welcome to BANGZ SALOON';
        }
    }

    updateNavigationForRole(role) {
        const adminLink = document.getElementById('admin-link');
        const logoutBtn = document.getElementById('logout-btn');
        
        console.log(`[${new Date().toISOString()}] 🔐 Updating navigation for role: ${role}`);
        
        if (role === 'Admin') {
            // Show admin panel link for admins
            if (adminLink) {
                adminLink.style.display = 'flex';
                console.log(`[${new Date().toISOString()}] ✅ Admin panel link shown`);
            }
            // Position logout button after admin panel link
            if (logoutBtn) {
                logoutBtn.parentElement.style.order = '6'; // After admin panel (order 1)
            }
        } else {
            // Hide admin panel link for workers
            if (adminLink) {
                adminLink.style.display = 'none';
                console.log(`[${new Date().toISOString()}] ❌ Admin panel link hidden for worker`);
            }
            // Position logout button after reports link
            if (logoutBtn) {
                logoutBtn.parentElement.style.order = '6'; // After reports (order 5)
            }
        }
    }

    async loadInitialData() {
        console.log(`[${new Date().toISOString()}] 🔄 Loading initial data`);
        this.showLoading(true);

        try {
            // Load workers from database
            const workersResult = await this.googleIntegration.makeRequest('getWorkers');
            if (workersResult && workersResult.success) {
                this.workers = workersResult.workers || workersResult.data || [];
                console.log(`[${new Date().toISOString()}] ✅ Worker data loaded successfully: ${this.workers.length} workers`);
            } else {
                console.log(`[${new Date().toISOString()}] ⚠️ Failed to load workers from database, using fallback`);
                this.workers = [];
            }
            this.populateWorkerDropdown();

            // Load services
            this.services = await this.googleIntegration.getServices();
            console.log(`[${new Date().toISOString()}] ✅ Service data loaded successfully`);
            console.log(`[${new Date().toISOString()}] 🛠️ Services data:`, this.services);

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
        
        // Default workers (fallback when database is not available)
        this.workers = [
            { name: "Maria", email: "maria@bangzsaloon.com", role: "Stylist", status: "Active" },
            { name: "Ahmed", email: "ahmed@bangzsaloon.com", role: "Barber", status: "Active" },
            { name: "Sarah", email: "sarah@bangzsaloon.com", role: "Hair Colorist", status: "Active" },
            { name: "John", email: "john@bangzsaloon.com", role: "Stylist", status: "Active" },
            { name: "Lisa", email: "lisa@bangzsaloon.com", role: "Receptionist", status: "Active" }
        ];
        this.populateWorkerDropdown();

        // Default services (empty - prices come from spreadsheet)
        this.services = {};

        console.log(`[${new Date().toISOString()}] ✅ Fallback data loaded`);
    }

    async refreshWorkers() {
        console.log(`[${new Date().toISOString()}] 🔄 Refreshing workers data`);
        try {
            const workersResult = await this.googleIntegration.makeRequest('getWorkers');
            console.log(`[${new Date().toISOString()}] 📊 Workers API response:`, workersResult);
            
            if (workersResult && workersResult.success) {
                this.workers = workersResult.workers || workersResult.data || [];
                console.log(`[${new Date().toISOString()}] ✅ Workers refreshed: ${this.workers.length} workers`);
                console.log(`[${new Date().toISOString()}] 👥 Workers data:`, this.workers);
            } else {
                console.log(`[${new Date().toISOString()}] ⚠️ Failed to refresh workers from database:`, workersResult?.error);
            }
            this.populateWorkerDropdown();
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error refreshing workers:`, error);
        }
    }

    async refreshServices() {
        console.log(`[${new Date().toISOString()}] 🔄 Refreshing services data`);
        try {
            this.services = await this.googleIntegration.getServices();
            console.log(`[${new Date().toISOString()}] ✅ Services refreshed:`, this.services);
            
            // Update service options if a category is already selected
            const categorySelect = document.getElementById('service-category');
            if (categorySelect && categorySelect.value) {
                this.updateServiceOptions(categorySelect.value);
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error refreshing services:`, error);
        }
    }

    // Test function to debug services
    testServices() {
        console.log(`[${new Date().toISOString()}] 🧪 Testing services functionality`);
        console.log(`[${new Date().toISOString()}] 🛠️ Current services:`, this.services);
        
        // Test each category
        Object.keys(this.services).forEach(category => {
            console.log(`[${new Date().toISOString()}] 📋 Category: ${category}`);
            console.log(`[${new Date().toISOString()}] 🛠️ Services:`, this.services[category]);
        });
        
        // Test service options update
        this.updateServiceOptions('Hair Services');
        
        return this.services;
    }

    // Test function to debug transactions
    async testTransactions() {
        console.log(`[${new Date().toISOString()}] 🧪 Testing transactions functionality`);
        
        try {
            const result = await this.googleIntegration.makeRequest('getTransactions');
            console.log(`[${new Date().toISOString()}] 📊 All transactions:`, result);
            
            if (result && result.success && result.transactions) {
                console.log(`[${new Date().toISOString()}] 📋 Total transactions found: ${result.transactions.length}`);
                result.transactions.forEach((transaction, index) => {
                    console.log(`[${new Date().toISOString()}] 📝 Transaction ${index + 1}:`, transaction);
                });
            }
            
            return result;
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error testing transactions:`, error);
            return null;
        }
    }


    populateWorkerDropdown() {
        const workerSelect = document.getElementById('worker-select');
        if (!workerSelect) {
            console.log(`[${new Date().toISOString()}] ❌ Worker select element not found`);
            return;
        }

        console.log(`[${new Date().toISOString()}] 🔄 Populating worker dropdown with ${this.workers.length} workers`);
        console.log(`[${new Date().toISOString()}] 👥 Workers to populate:`, this.workers);

        // Clear existing options except the first one
        workerSelect.innerHTML = '<option value="">Select Worker</option>';
        
        this.workers.forEach((worker, index) => {
            const option = document.createElement('option');
            // Handle both string names (fallback) and worker objects (from database)
            if (typeof worker === 'string') {
                option.value = worker;
                option.textContent = worker;
                console.log(`[${new Date().toISOString()}] ➕ Added worker (string): ${worker}`);
            } else {
                const workerName = worker.name || worker.email || '';
                option.value = workerName;
                option.textContent = workerName;
                console.log(`[${new Date().toISOString()}] ➕ Added worker (object): ${workerName}`, worker);
            }
            workerSelect.appendChild(option);
        });

        console.log(`[${new Date().toISOString()}] ✅ Worker dropdown populated with ${this.workers.length} workers`);
        console.log(`[${new Date().toISOString()}] 📋 Final dropdown options:`, Array.from(workerSelect.options).map(opt => opt.textContent));
    }

    async loadServicesForCategory(category) {
        console.log(`[${new Date().toISOString()}] 🔄 Loading services for category: ${category}`);
        
        if (!category) {
            this.clearServiceCategories();
            return;
        }

        try {
            // Get all services and filter by category
            const allServices = await this.googleIntegration.getServices();
            console.log(`[${new Date().toISOString()}] 📊 All services:`, allServices);
            
            if (allServices && allServices[category]) {
                this.displayServicesForCategory(category, allServices[category]);
            } else {
                console.log(`[${new Date().toISOString()}] ⚠️ No services found for category: ${category}`);
                this.clearServiceCategories();
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error loading services for category ${category}:`, error);
            this.showMessage('Failed to load services. Please try again.', 'error');
        }
    }

    displayServicesForCategory(category, services) {
        const container = document.getElementById('service-categories');
        if (!container) {
            console.log(`[${new Date().toISOString()}] ❌ Service categories container not found`);
            return;
        }

        // Clear existing content
        container.innerHTML = '';

        if (!services || Object.keys(services).length === 0) {
            container.innerHTML = `<p class="no-services">No services available for ${category} category</p>`;
            return;
        }

        // Create service boxes for each service
        const serviceBoxes = document.createElement('div');
        serviceBoxes.className = 'service-boxes';
        serviceBoxes.setAttribute('data-category', category);

        Object.entries(services).forEach(([serviceName, cost]) => {
            const serviceBox = document.createElement('div');
            serviceBox.className = 'service-box';
            serviceBox.setAttribute('data-service', serviceName);
            serviceBox.setAttribute('data-cost', cost);
            serviceBox.setAttribute('data-category', category);
            
            serviceBox.innerHTML = `
                <div class="service-name">${serviceName}</div>
                <div class="service-price">${cost} AED</div>
            `;
            
            serviceBoxes.appendChild(serviceBox);
        });

        container.appendChild(serviceBoxes);

        // Re-initialize service selection for the new boxes
        this.initializeServiceSelection();

        console.log(`[${new Date().toISOString()}] ✅ Services displayed for category: ${category}`);
    }

    clearServiceCategories() {
        const container = document.getElementById('service-categories');
        if (container) {
            container.innerHTML = '<p class="no-category-selected">Please select a service category first</p>';
        }
        
        // Clear selected services
        this.selectedServices = [];
        this.updateSelectedServicesDisplay();
        this.updateTotalCost();
    }

    initializeServiceSelection() {
        console.log(`[${new Date().toISOString()}] 🎯 Initializing service selection`);
        
        // Initialize selected services array
        this.selectedServices = [];
        
        // Add click event listeners to all service boxes
        const serviceBoxes = document.querySelectorAll('.service-box');
        serviceBoxes.forEach(box => {
            box.addEventListener('click', () => {
                this.toggleServiceSelection(box);
            });
        });
        
        // Update display
        this.updateSelectedServicesDisplay();
    }

    toggleServiceSelection(serviceBox) {
        const serviceName = serviceBox.dataset.service;
        const serviceCost = parseFloat(serviceBox.dataset.cost);
        const serviceCategory = serviceBox.closest('.service-boxes').dataset.category;
        
        console.log(`[${new Date().toISOString()}] 🎯 Toggling service: ${serviceName} (${serviceCost} AED)`);
        
        // Check if service is already selected
        const existingIndex = this.selectedServices.findIndex(service => service.name === serviceName);
        
        if (existingIndex > -1) {
            // Remove service
            this.selectedServices.splice(existingIndex, 1);
            serviceBox.classList.remove('selected');
        } else {
            // Add service
            this.selectedServices.push({
                name: serviceName,
                cost: serviceCost,
                category: serviceCategory
            });
            serviceBox.classList.add('selected');
        }
        
        // Update display and total
        this.updateSelectedServicesDisplay();
        this.updateTotalCost();
    }

    updateSelectedServicesDisplay() {
        const selectedServicesContainer = document.getElementById('selected-services');
        if (!selectedServicesContainer) return;
        
        if (this.selectedServices.length === 0) {
            selectedServicesContainer.innerHTML = '<p class="no-services">No services selected</p>';
            return;
        }
        
        const servicesHTML = this.selectedServices.map(service => `
            <div class="selected-service-item">
                <span class="selected-service-name">${service.name}</span>
                <span class="selected-service-price">${service.cost} AED</span>
                <button type="button" class="remove-service" data-service="${service.name}">×</button>
            </div>
        `).join('');
        
        selectedServicesContainer.innerHTML = servicesHTML;
        
        // Add remove button event listeners
        const removeButtons = selectedServicesContainer.querySelectorAll('.remove-service');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const serviceName = button.dataset.service;
                this.removeService(serviceName);
            });
        });
    }

    removeService(serviceName) {
        console.log(`[${new Date().toISOString()}] 🗑️ Removing service: ${serviceName}`);
        
        // Remove from selected services array
        this.selectedServices = this.selectedServices.filter(service => service.name !== serviceName);
        
        // Remove visual selection from service box
        const serviceBoxes = document.querySelectorAll('.service-box');
        serviceBoxes.forEach(box => {
            if (box.dataset.service === serviceName) {
                box.classList.remove('selected');
            }
        });
        
        // Update display and total
        this.updateSelectedServicesDisplay();
        this.updateTotalCost();
    }

    updateTotalCost() {
        const totalCost = this.selectedServices.reduce((sum, service) => sum + service.cost, 0);
        const totalCostInput = document.getElementById('total-cost');
        if (totalCostInput) {
            totalCostInput.value = totalCost;
        }
        console.log(`[${new Date().toISOString()}] 💰 Total cost updated: ${totalCost} AED`);
    }

    async handleFormSubmission() {
        console.log(`[${new Date().toISOString()}] 📝 Handling form submission`);
        
        const formData = this.collectFormData();
        
        if (!this.validateFormData(formData)) {
            return;
        }

        this.setSubmitButtonLoading(true);

        try {
            // Create a single transaction with all selected services
            const totalCost = this.selectedServices.reduce((sum, service) => sum + service.cost, 0);
            const servicesList = this.selectedServices.map(service => service.name).join(', ');
            const categoriesList = [...new Set(this.selectedServices.map(service => service.category))].join(', ');
            
            const combinedFormData = {
                ...formData,
                service: servicesList, // All services combined
                cost: totalCost, // Total cost of all services
                category: categoriesList, // All categories combined
                services: this.selectedServices // Keep individual services for WhatsApp
            };
            
            console.log(`[${new Date().toISOString()}] 📤 Sending transaction data:`, combinedFormData);
            console.log(`[${new Date().toISOString()}] 🏷️ Category being sent: "${categoriesList}"`);
            console.log(`[${new Date().toISOString()}] 👤 Customer being sent: "${combinedFormData.customer}"`);
            
            const result = await this.googleIntegration.submitServiceEntry(combinedFormData);
            
            if (result && result.success) {
                console.log(`[${new Date().toISOString()}] ✅ Combined transaction created successfully for ${this.selectedServices.length} services`);
                this.showMessage(`${this.selectedServices.length} service(s) submitted successfully! Total: ${totalCost} AED`, 'success', true);
                this.resetForm();
                await this.updateDashboard();
            } else {
                throw new Error(result?.error || 'Failed to create transaction');
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error submitting form:`, error);
            this.showMessage('Failed to submit service entry. Please try again.', 'error');
        } finally {
            this.setSubmitButtonLoading(false);
        }
    }

    collectFormData() {
        const form = document.getElementById('service-form');
        const formData = new FormData(form);
        
        const now = new Date();
        const dubaiTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Dubai"}));
        
        const data = {
            worker: formData.get('worker'),
            service: formData.get('service'),
            cost: parseFloat(formData.get('cost')) || 0,
            amount: parseFloat(formData.get('cost')) || 0, // Also send as amount
            tip: parseFloat(formData.get('tip')) || 0,
            payment: formData.get('payment'),
            paymentMethod: formData.get('payment'), // Also send as paymentMethod
            customer: formData.get('customer') || '',
            customerName: formData.get('customer') || '', // Also send as customerName
            phone: formData.get('phone') || '',
            notes: formData.get('notes') || '',
            timestamp: dubaiTime.toISOString(),
            date: dubaiTime.toLocaleDateString('en-GB'),
            time: dubaiTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            monthYear: dubaiTime.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            year: dubaiTime.getFullYear(),
            month: dubaiTime.getMonth() + 1,
            day: dubaiTime.getDate(),
            location: "Dubai, UAE"
        };
        
        console.log(`[${new Date().toISOString()}] 📝 Form data collected:`, data);
        console.log(`[${new Date().toISOString()}] 📅 Date being sent: "${data.date}"`);
        console.log(`[${new Date().toISOString()}] 💝 Tip amount being sent: "${data.tip}"`);
        
        return data;
    }

    validateFormData(data) {
        const requiredFields = ['worker', 'payment'];
        
        for (const field of requiredFields) {
            if (!data[field]) {
                this.showMessage(`Please select a ${field.replace('_', ' ')}`, 'error');
                return false;
            }
        }

        // Check if at least one service is selected
        if (!this.selectedServices || this.selectedServices.length === 0) {
            this.showMessage('Please select at least one service', 'error');
            return false;
        }

        // Check if services have categories (this validates that a category was selected)
        const hasValidCategories = this.selectedServices.every(service => service.category);
        if (!hasValidCategories) {
            this.showMessage('Please select a service category first', 'error');
            return false;
        }

        return true;
    }

    resetForm() {
        const form = document.getElementById('service-form');
        if (form) {
            form.reset();
        }
        
        // Clear service categories
        this.clearServiceCategories();
        
        // Reset total cost
        const totalCostInput = document.getElementById('total-cost');
        if (totalCostInput) {
            totalCostInput.value = '0';
        }
        
        // Reset tip amount
        const tipInput = document.getElementById('tip-amount');
        if (tipInput) {
            tipInput.value = '0';
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
        
        // Check if we're on admin page, otherwise default to dashboard
        const currentHash = window.location.hash.substring(1);
        if (currentHash === 'admin') {
            this.navigateToSection('admin');
        } else {
            // Default to dashboard and make sure admin section is hidden
            this.navigateToSection('dashboard');
        }
        
        // Update navigation based on current user role and section
        if (this.currentUser) {
            this.updateNavigationForRole(this.currentUser.role);
        }
    }

    navigateToSection(sectionId) {
        console.log(`[${new Date().toISOString()}] 🧭 Navigating to section: ${sectionId}`);
        
        // Hide all sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Show main content for all sections
        const mainContent = document.getElementById('main-content');
        
        if (mainContent) {
            mainContent.style.display = 'block';
        }
        
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

        // Handle specific section actions
        if (sectionId === 'calendar') {
            // Load Calendar data when navigating to the section
            this.loadCalendarData();
        }

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
        const today = new Date().toLocaleDateString('en-GB');
        
        try {
            console.log(`[${new Date().toISOString()}] 🔄 Loading dashboard data for ${today}`);
            this.dashboardData = await this.googleIntegration.getDailyData(today);
            console.log(`[${new Date().toISOString()}] ✅ Dashboard data loaded:`, this.dashboardData);
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

        console.log(`[${new Date().toISOString()}] 📊 Displaying dashboard data:`, data);

        // Update stat cards
        this.updateElement('total-sales', `${data.totalSales.toFixed(2)} AED`);
        this.updateElement('transaction-count', data.transactionCount.toString());
        this.updateElement('cash-total', `${data.cashTotal.toFixed(2)} AED`);
        this.updateElement('card-total', `${data.cardTotal.toFixed(2)} AED`);

        console.log(`[${new Date().toISOString()}] 💰 Updated dashboard stats - Sales: ${data.totalSales}, Transactions: ${data.transactionCount}, Cash: ${data.cashTotal}, Card: ${data.cardTotal}`);

        // Update worker performance
        this.displayWorkerStats(data.workerStats);

        // Update recent transactions
        this.displayRecentTransactions(data.recentTransactions);
        
        // Update monthly stats
        this.updateMonthlyStats();

        console.log(`[${new Date().toISOString()}] ✅ Dashboard display completed`);
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
            
            // Create detailed transaction list for this worker
            let transactionDetails = '';
            if (stats.transactions && stats.transactions.length > 0) {
                transactionDetails = '<div class="worker-transactions">';
                stats.transactions.forEach(transaction => {
                    const transactionTime = new Date(transaction.createdat || transaction.timestamp || new Date());
                    const timeString = transactionTime.toLocaleTimeString('en-GB', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        timeZone: 'Asia/Dubai'
                    });
                    const dateString = transactionTime.toLocaleDateString('en-GB', {
                        timeZone: 'Asia/Dubai'
                    });
                    
                    transactionDetails += `
                        <div class="transaction-detail">
                            <span class="transaction-service">${transaction.service}</span>
                            <span class="transaction-amount">${(transaction.amount || transaction.cost || 0).toFixed(2)} AED</span>
                            <span class="transaction-time">${dateString} at ${timeString}</span>
                        </div>
                    `;
                });
                transactionDetails += '</div>';
            }
            
            workerItem.innerHTML = `
                <div class="worker-header">
                    <span class="worker-name">${worker}</span>
                    <span class="worker-total">${stats.total.toFixed(2)} AED</span>
                </div>
                ${transactionDetails}
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
            console.log('Processing transaction for recent display:', transaction);
            
            const transactionItem = document.createElement('div');
            transactionItem.className = 'transaction-item';
            
            // Handle undefined worker name
            const workerName = transaction.worker || 'Unknown Worker';
            const paymentMethod = transaction.payment || transaction.paymentMethod || 'N/A';
            
            // Format the time properly
            let time = 'N/A';
            console.log('Transaction createdAt:', transaction.createdAt);
            console.log('Transaction createdat:', transaction.createdat);
            console.log('Transaction updatedAt:', transaction.updatedAt);
            console.log('Transaction updatedat:', transaction.updatedat);
            console.log('Transaction date:', transaction.date);
            
            // Try different field names for timestamp
            const timestamp = transaction.createdAt || transaction.createdat || transaction.updatedAt || transaction.updatedat;
            
            if (timestamp) {
                try {
                    const date = new Date(timestamp);
                    console.log('Parsed date:', date);
                    if (!isNaN(date.getTime())) {
                        time = date.toLocaleString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                        console.log('Formatted time:', time);
                    }
                } catch (e) {
                    console.log('Error parsing date:', timestamp, e);
                }
            } else if (transaction.time) {
                time = transaction.time;
            } else if (transaction.date) {
                // If we only have date, show just the date
                time = transaction.date;
            }
            
            console.log('Final time value:', time);
            
            // Calculate total amount including tip
            const serviceAmount = transaction.amount || transaction.cost || 0;
            const tipAmount = transaction.tip || 0;
            const totalAmount = serviceAmount + tipAmount;
            
            // Create tip display if tip exists
            let tipDisplay = '';
            if (tipAmount > 0) {
                tipDisplay = `<div class="transaction-tip">💝 Tip: ${tipAmount.toFixed(2)} AED</div>`;
            }
            
            transactionItem.innerHTML = `
                <div class="transaction-details">
                    <div class="transaction-service">${transaction.service}</div>
                    <div class="transaction-worker">${workerName} • ${paymentMethod}</div>
                    <div class="transaction-time">${time}</div>
                    ${tipDisplay}
                </div>
                <div class="transaction-amount">
                    <div class="service-amount">${serviceAmount.toFixed(2)} AED</div>
                    ${tipAmount > 0 ? `<div class="total-amount">Total: ${totalAmount.toFixed(2)} AED</div>` : ''}
                </div>
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

    showMessage(message, type = 'info', isNewEntry = false) {
        // Use new popup system for new entries
        if (isNewEntry && type === 'success') {
            this.showNewEntryPopup(message);
            return;
        }

        // For other messages, use a simple alert for now
        // You can implement a different notification system later if needed
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    showNewEntryPopup(message) {
        const popup = document.getElementById('success-popup');
        const popupMessage = popup.querySelector('.popup-message');
        const popupDetails = popup.querySelector('.popup-details');
        
        if (!popup || !popupMessage || !popupDetails) {
            console.error('Popup elements not found');
            return;
        }

        // Extract total cost from message
        const totalMatch = message.match(/Total: ([\d.]+) AED/);
        const totalCost = totalMatch ? totalMatch[1] : '0';
        
        // Extract service count from message
        const serviceMatch = message.match(/(\d+) service\(s\)/);
        const serviceCount = serviceMatch ? serviceMatch[1] : '1';

        // Update popup content
        popupMessage.textContent = `${serviceCount} service(s) submitted successfully!`;
        popupDetails.textContent = `Total: ${totalCost} AED - Redirecting to dashboard...`;

        // Show popup
        popup.classList.add('show');

        // Auto-hide after 3 seconds and redirect
        setTimeout(() => {
            popup.classList.remove('show');
            
            // Redirect to dashboard after popup hides
            setTimeout(() => {
                this.redirectToDashboard();
            }, 300);
        }, 3000);

        console.log(`[${new Date().toISOString()}] 📢 Message shown: ${message} (${type})${isNewEntry ? ' - NEW ENTRY' : ''}`);
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

    async updateMonthlyStats() {
        try {
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1;
            const currentYear = currentDate.getFullYear();
            
            // Get monthly data (this would typically come from Google Sheets)
            const monthlyData = await this.getMonthlyData(currentMonth, currentYear);
            
            this.updateElement('monthly-sales', `${monthlyData.totalSales.toFixed(2)} AED`);
            this.updateElement('monthly-transactions', monthlyData.transactionCount.toString());
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error updating monthly stats:`, error);
            this.updateElement('monthly-sales', '0.00 AED');
            this.updateElement('monthly-transactions', '0');
        }
    }

    async getMonthlyData(month, year) {
        // This would typically fetch from Google Sheets
        // For now, we'll calculate from local data
        const monthlyEntries = this.offlineData ? this.offlineData.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            return entryDate.getMonth() + 1 === month && entryDate.getFullYear() === year;
        }) : [];

        const totalSales = monthlyEntries.reduce((sum, entry) => sum + (parseFloat(entry.cost) || 0), 0);
        const transactionCount = monthlyEntries.length;

        return {
            totalSales,
            transactionCount,
            entries: monthlyEntries
        };
    }




    renderCalendar() {
        const calendarGrid = document.getElementById('calendar-grid');
        const currentMonthYear = document.getElementById('current-month-year');
        
        if (!calendarGrid || !currentMonthYear) return;

        // Update month/year header
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        currentMonthYear.textContent = `${monthNames[this.currentCalendarDate.getMonth()]} ${this.currentCalendarDate.getFullYear()}`;

        // Clear calendar grid
        calendarGrid.innerHTML = '';

        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            dayHeader.style.fontWeight = '600';
            dayHeader.style.color = 'var(--text-secondary)';
            dayHeader.style.textAlign = 'center';
            dayHeader.style.padding = 'var(--spacing-2)';
            calendarGrid.appendChild(dayHeader);
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
            calendarGrid.appendChild(emptyDay);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            const dayData = this.calendarData[day];
            const today = new Date();
            const isToday = day === today.getDate() && 
                           this.currentCalendarDate.getMonth() === today.getMonth() && 
                           this.currentCalendarDate.getFullYear() === today.getFullYear();

            if (isToday) {
                dayElement.classList.add('today');
            }

            if (dayData && dayData.totalSales > 0) {
                dayElement.classList.add('has-sales');
                
                // Add sales level class
                if (dayData.totalSales < 500) {
                    dayElement.classList.add('sales-low');
                } else if (dayData.totalSales < 1500) {
                    dayElement.classList.add('sales-medium');
                } else {
                    dayElement.classList.add('sales-high');
                }

                dayElement.innerHTML = `
                    <div class="calendar-day-number">${day}</div>
                    <div class="calendar-day-amount">${dayData.totalSales.toFixed(0)} AED</div>
                `;
            } else {
                dayElement.innerHTML = `<div class="calendar-day-number">${day}</div>`;
            }

            // Add click event
            dayElement.addEventListener('click', () => {
                this.showDayDetails(day, dayData);
            });

            calendarGrid.appendChild(dayElement);
        }

        // Add empty cells for days after the last day of the month
        const totalCells = startingDayOfWeek + daysInMonth;
        const remainingCells = 42 - totalCells; // 6 weeks * 7 days
        for (let i = 0; i < remainingCells; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day other-month';
            calendarGrid.appendChild(emptyDay);
        }
    }

    showDayDetails(day, dayData) {
        if (!dayData || dayData.totalSales === 0) {
            this.showMessage(`No sales recorded for ${day}`, 'info');
            return;
        }

        const details = `
            Day ${day} Sales:
            Total: ${dayData.totalSales.toFixed(2)} AED
            Transactions: ${dayData.transactionCount}
        `;
        
        this.showMessage(details, 'info');
    }

    // Calendar functionality
    async loadCalendarData() {
        console.log(`[${new Date().toISOString()}] 📅 Loading calendar data`);
        this.showLoading(true);

        try {
            // Ensure Daily_Sales sheet exists
            await this.ensureDailySalesSheet();
            
            // Get all sales data to populate calendar
            const salesData = await this.googleIntegration.getAllSales();
            
            if (salesData && salesData.success) {
                this.calendarData = this.processCalendarData(salesData.data);
                this.renderCalendar();
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

    processCalendarData(salesData) {
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

    renderCalendar() {
        const calendarPicker = document.getElementById('calendar-picker');
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
            this.renderCalendar();
        });

        const monthYear = document.createElement('div');
        monthYear.className = 'calendar-month-year';
        monthYear.textContent = `${monthNames[this.currentCalendarDate.getMonth()]} ${this.currentCalendarDate.getFullYear()}`;

        const nextBtn = document.createElement('button');
        nextBtn.className = 'calendar-nav-btn';
        nextBtn.innerHTML = '›';
            nextBtn.addEventListener('click', () => {
                this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + 1);
            this.renderCalendar();
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
                this.selectDate(dateString, dayData);
            });

            grid.appendChild(dayElement);
        }

        // Clear and populate calendar
        calendarPicker.innerHTML = '';
        calendarPicker.appendChild(headerControls);
        calendarPicker.appendChild(grid);
    }

    selectDate(dateString, dayData) {
        console.log(`[${new Date().toISOString()}] 📅 Date selected: ${dateString}`);
        
        // Update selected date
        this.selectedDate = dateString;
        
        // Update calendar display
        this.renderCalendar();
        
        // Update selected date display
        const selectedDateDisplay = document.getElementById('selected-date-display');
        if (selectedDateDisplay) {
            if (dayData && dayData.totalSales > 0) {
                selectedDateDisplay.textContent = `${dateString} - Sales: ${dayData.totalSales.toFixed(2)} AED (${dayData.transactionCount} transactions)`;
            } else {
                selectedDateDisplay.textContent = `${dateString} - No sales data`;
            }
        }
        
        // Load and display sales data for selected date
        this.loadSalesDataForDate(dateString);
    }

    async loadSalesDataForDate(dateString) {
        console.log(`[${new Date().toISOString()}] 📊 Loading sales data for ${dateString}`);
        this.showLoading(true);

        try {
            const salesData = await this.googleIntegration.getAllSales(dateString);
            
            if (salesData && salesData.success) {
                this.displaySalesData(salesData.data);
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

    displaySalesData(data) {
        // Update summary cards
        this.updateSummaryCards(data);
        
        // Display worker sales
        this.displayWorkerSales(data.workerStats);
        
        // Display sales table
        this.displaySalesTable(data.transactions);
    }

    updateSummaryCards(data) {
        const totalSalesElement = document.getElementById('total-sales-today');
        const totalTransactionsElement = document.getElementById('total-transactions-today');
        const activeWorkersElement = document.getElementById('active-workers-today');

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

    displayWorkerSales(workerStats) {
        const workerSalesList = document.getElementById('worker-sales-list');
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

    displaySalesTable(transactions) {
        const tableBody = document.getElementById('daily-sales-table-body');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        if (transactions && transactions.length > 0) {
            transactions.forEach(transaction => {
                const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.date || ''}</td>
                <td>${transaction.worker || 'Unknown'}</td>
                <td>${transaction.service || 'Unknown'}</td>
                <td><span class="category-badge ${(transaction.category || '').toLowerCase()}">${transaction.category || 'Unknown'}</span></td>
                <td>${transaction.customer || 'Unknown'}</td>
                <td>${transaction.amount || '0'} AED</td>
                <td>${transaction.paymentMethod || 'Unknown'}</td>
                <td>${transaction.time || ''}</td>
            `;
                tableBody.appendChild(row);
            });
        } else {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="8" style="text-align: center; color: #666;">No transactions found for selected date</td>';
            tableBody.appendChild(row);
        }
    }


    // All Sales functionality
    async loadAllSalesData(showAll = false) {
        console.log(`[${new Date().toISOString()}] 🔄 Loading All Sales data`);
        this.showLoading(true);

        try {
            // First, ensure Daily_Sales sheet exists
            await this.ensureDailySalesSheet();

            const dateFilter = document.getElementById('sales-date-filter');
            const filterDate = showAll ? null : (dateFilter ? dateFilter.value : null);

            // Get all sales data
            const salesData = await this.googleIntegration.getAllSales(filterDate);
            
            if (salesData && salesData.success) {
                this.displayAllSalesData(salesData.data);
                
                // Save daily sales data to Daily_Sales sheet
                if (salesData.data.workerStats && Object.keys(salesData.data.workerStats).length > 0) {
                    await this.saveDailySalesData(salesData.data);
                }
            } else {
                console.error(`[${new Date().toISOString()}] ❌ Failed to load sales data:`, salesData);
                this.showMessage('Failed to load sales data. Please try again.', 'error');
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error loading All Sales data:`, error);
            this.showMessage('Failed to load sales data. Please check your connection.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async ensureDailySalesSheet() {
        try {
            // Try to setup spreadsheet which will create Daily_Sales sheet if it doesn't exist
            await this.googleIntegration.makeRequest('setupSpreadsheet', {}, 'GET');
            console.log(`[${new Date().toISOString()}] ✅ Daily_Sales sheet ensured`);
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error ensuring Daily_Sales sheet:`, error);
        }
    }

    displayAllSalesData(data) {
        console.log(`[${new Date().toISOString()}] 📊 Displaying All Sales data:`, data);

        // Update summary cards
        this.updateSummaryCards(data);

        // Display worker sales breakdown
        this.displayWorkerSales(data.workerStats);

        // Display detailed sales table
        this.displaySalesTable(data.transactions);
    }

    updateSummaryCards(data) {
        const totalSalesElement = document.getElementById('total-sales-today');
        const totalTransactionsElement = document.getElementById('total-transactions-today');
        const activeWorkersElement = document.getElementById('active-workers-today');

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

    displayWorkerSales(workerStats) {
        const workerSalesList = document.getElementById('worker-sales-list');
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

    displaySalesTable(transactions) {
        const tableBody = document.getElementById('daily-sales-table-body');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        transactions.forEach(transaction => {
            const row = document.createElement('tr');
            const time = this.formatTimeFromDate(transaction.createdAt);
            
            row.innerHTML = `
                <td>${transaction.date}</td>
                <td>${transaction.worker}</td>
                <td>${transaction.service}</td>
                <td><span class="category-badge ${(transaction.category || '').toLowerCase()}">${transaction.category || 'N/A'}</span></td>
                <td>${transaction.customer}</td>
                <td>${transaction.amount.toFixed(2)} AED</td>
                <td>${transaction.paymentMethod}</td>
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

    async saveDailySalesData(data) {
        try {
            const saveResult = await this.googleIntegration.makeRequest('saveDailySales', {
                date: data.date,
                workerStats: data.workerStats
            });
            
            if (saveResult && saveResult.success) {
                console.log(`[${new Date().toISOString()}] ✅ Daily sales data saved:`, saveResult.message);
            } else {
                console.error(`[${new Date().toISOString()}] ❌ Failed to save daily sales data:`, saveResult);
            }
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error saving daily sales data:`, error);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log(`[${new Date().toISOString()}] 🎯 DOM loaded, initializing BANGZ SALOON Manager`);
    window.salonManager = new SalonManager();
    
    // Make test functions available globally for debugging
    window.testServices = () => window.salonManager.testServices();
    window.testTransactions = () => window.salonManager.testTransactions();
    window.refreshServices = () => window.salonManager.refreshServices();
    window.refreshWorkers = () => window.salonManager.refreshWorkers();
    window.testDailyTransactions = () => window.salonManager.testDailyTransactions();
});

// Handle page visibility changes for data refresh
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.salonManager) {
        console.log(`[${new Date().toISOString()}] 👁️ Page visible, refreshing data`);
        window.salonManager.updateDashboard();
        window.salonManager.refreshWorkers();
        window.salonManager.refreshServices();
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
