/**
 * Salon Management System - Services Manager
 * Handles service definitions, pricing, and business logic
 */

class ServicesManager {
    constructor() {
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

        this.workers = ["Maria", "Ahmed", "Sarah", "John", "Lisa"];
        
        this.paymentMethods = ["Cash", "Card"];
        
        console.log(`[${new Date().toISOString()}] ✅ Services Manager initialized`);
    }

    /**
     * Get all service categories
     * @returns {Array} Array of service category names
     */
    getServiceCategories() {
        return Object.keys(this.services);
    }

    /**
     * Get services for a specific category
     * @param {string} category - Service category name
     * @returns {Object} Object with service names as keys and prices as values
     */
    getServicesByCategory(category) {
        return this.services[category] || {};
    }

    /**
     * Get all services as a flat object
     * @returns {Object} Object with all services and their prices
     */
    getAllServices() {
        const allServices = {};
        Object.values(this.services).forEach(categoryServices => {
            Object.assign(allServices, categoryServices);
        });
        return allServices;
    }

    /**
     * Get service price
     * @param {string} category - Service category
     * @param {string} service - Service name
     * @returns {number} Service price
     */
    getServicePrice(category, service) {
        if (this.services[category] && this.services[category][service]) {
            return this.services[category][service];
        }
        return 0;
    }

    /**
     * Get all workers
     * @returns {Array} Array of worker names
     */
    getWorkers() {
        return [...this.workers];
    }

    /**
     * Add a new worker
     * @param {string} workerName - Name of the worker
     * @returns {boolean} Success status
     */
    addWorker(workerName) {
        if (workerName && !this.workers.includes(workerName)) {
            this.workers.push(workerName);
            console.log(`[${new Date().toISOString()}] ✅ Worker added: ${workerName}`);
            return true;
        }
        return false;
    }

    /**
     * Remove a worker
     * @param {string} workerName - Name of the worker to remove
     * @returns {boolean} Success status
     */
    removeWorker(workerName) {
        const index = this.workers.indexOf(workerName);
        if (index > -1) {
            this.workers.splice(index, 1);
            console.log(`[${new Date().toISOString()}] ✅ Worker removed: ${workerName}`);
            return true;
        }
        return false;
    }

    /**
     * Get payment methods
     * @returns {Array} Array of payment method names
     */
    getPaymentMethods() {
        return [...this.paymentMethods];
    }

    /**
     * Add a new service
     * @param {string} category - Service category
     * @param {string} serviceName - Service name
     * @param {number} price - Service price
     * @returns {boolean} Success status
     */
    addService(category, serviceName, price) {
        if (!this.services[category]) {
            this.services[category] = {};
        }
        
        if (serviceName && price > 0) {
            this.services[category][serviceName] = price;
            console.log(`[${new Date().toISOString()}] ✅ Service added: ${serviceName} in ${category} for $${price}`);
            return true;
        }
        return false;
    }

    /**
     * Update service price
     * @param {string} category - Service category
     * @param {string} serviceName - Service name
     * @param {number} newPrice - New service price
     * @returns {boolean} Success status
     */
    updateServicePrice(category, serviceName, newPrice) {
        if (this.services[category] && this.services[category][serviceName] && newPrice > 0) {
            const oldPrice = this.services[category][serviceName];
            this.services[category][serviceName] = newPrice;
            console.log(`[${new Date().toISOString()}] ✅ Service price updated: ${serviceName} from $${oldPrice} to $${newPrice}`);
            return true;
        }
        return false;
    }

    /**
     * Remove a service
     * @param {string} category - Service category
     * @param {string} serviceName - Service name
     * @returns {boolean} Success status
     */
    removeService(category, serviceName) {
        if (this.services[category] && this.services[category][serviceName]) {
            delete this.services[category][serviceName];
            console.log(`[${new Date().toISOString()}] ✅ Service removed: ${serviceName} from ${category}`);
            return true;
        }
        return false;
    }

    /**
     * Calculate total for multiple services
     * @param {Array} serviceItems - Array of service objects with category, service, and quantity
     * @returns {number} Total cost
     */
    calculateTotal(serviceItems) {
        let total = 0;
        serviceItems.forEach(item => {
            const price = this.getServicePrice(item.category, item.service);
            const quantity = item.quantity || 1;
            total += price * quantity;
        });
        return total;
    }

    /**
     * Validate service entry data
     * @param {Object} data - Service entry data
     * @returns {Object} Validation result with isValid and errors
     */
    validateServiceEntry(data) {
        const errors = [];

        // Check required fields
        if (!data.worker) {
            errors.push('Worker is required');
        } else if (!this.workers.includes(data.worker)) {
            errors.push('Invalid worker selected');
        }

        if (!data.category) {
            errors.push('Service category is required');
        } else if (!this.services[data.category]) {
            errors.push('Invalid service category');
        }

        if (!data.service) {
            errors.push('Service type is required');
        } else if (!this.services[data.category] || !this.services[data.category][data.service]) {
            errors.push('Invalid service type');
        }

        if (!data.payment) {
            errors.push('Payment method is required');
        } else if (!this.paymentMethods.includes(data.payment)) {
            errors.push('Invalid payment method');
        }

        if (!data.cost || data.cost <= 0) {
            errors.push('Service cost must be greater than 0');
        }

        // Validate cost matches service price
        if (data.category && data.service && data.cost) {
            const expectedPrice = this.getServicePrice(data.category, data.service);
            if (expectedPrice > 0 && data.cost !== expectedPrice) {
                errors.push(`Service cost mismatch. Expected $${expectedPrice}, got $${data.cost}`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Get service statistics
     * @returns {Object} Service statistics
     */
    getServiceStatistics() {
        const stats = {
            totalCategories: Object.keys(this.services).length,
            totalServices: 0,
            averagePrice: 0,
            categoryStats: {}
        };

        let totalPrice = 0;
        let serviceCount = 0;

        Object.entries(this.services).forEach(([category, services]) => {
            const categoryServiceCount = Object.keys(services).length;
            const categoryTotalPrice = Object.values(services).reduce((sum, price) => sum + price, 0);
            const categoryAveragePrice = categoryTotalPrice / categoryServiceCount;

            stats.categoryStats[category] = {
                serviceCount: categoryServiceCount,
                totalPrice: categoryTotalPrice,
                averagePrice: categoryAveragePrice
            };

            stats.totalServices += categoryServiceCount;
            totalPrice += categoryTotalPrice;
            serviceCount += categoryServiceCount;
        });

        stats.averagePrice = serviceCount > 0 ? totalPrice / serviceCount : 0;

        return stats;
    }

    /**
     * Export services data for backup
     * @returns {Object} Services data in exportable format
     */
    exportServicesData() {
        return {
            services: this.services,
            workers: this.workers,
            paymentMethods: this.paymentMethods,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }

    /**
     * Import services data from backup
     * @param {Object} data - Services data to import
     * @returns {boolean} Success status
     */
    importServicesData(data) {
        try {
            if (data.services && typeof data.services === 'object') {
                this.services = data.services;
            }
            
            if (data.workers && Array.isArray(data.workers)) {
                this.workers = data.workers;
            }
            
            if (data.paymentMethods && Array.isArray(data.paymentMethods)) {
                this.paymentMethods = data.paymentMethods;
            }

            console.log(`[${new Date().toISOString()}] ✅ Services data imported successfully`);
            return true;
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error importing services data:`, error);
            return false;
        }
    }

    /**
     * Get service recommendations based on category
     * @param {string} category - Service category
     * @returns {Array} Array of recommended services
     */
    getServiceRecommendations(category) {
        const categoryServices = this.getServicesByCategory(category);
        const services = Object.entries(categoryServices);
        
        // Sort by price (ascending) and return top 3
        return services
            .sort(([, priceA], [, priceB]) => priceA - priceB)
            .slice(0, 3)
            .map(([service, price]) => ({ service, price }));
    }

    /**
     * Search services by name or category
     * @param {string} query - Search query
     * @returns {Array} Array of matching services
     */
    searchServices(query) {
        const results = [];
        const searchTerm = query.toLowerCase();

        Object.entries(this.services).forEach(([category, services]) => {
            Object.entries(services).forEach(([service, price]) => {
                if (service.toLowerCase().includes(searchTerm) || 
                    category.toLowerCase().includes(searchTerm)) {
                    results.push({
                        category,
                        service,
                        price
                    });
                }
            });
        });

        return results;
    }
}

// Create global instance
window.servicesManager = new ServicesManager();
