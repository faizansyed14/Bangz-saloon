# Salon Management System - Setup Instructions

## Overview
This is a professional hair salon management system that replaces manual paper-based logging. The system integrates with Google Sheets for data storage using Google Apps Script.

## Prerequisites
- Google account with access to Google Sheets and Google Apps Script
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (with offline capability)

## Phase 1: Google Sheets Setup

### Step 1: Create Google Sheets Workbook
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Salon Management Data"
4. Create the following sheets:

#### Sheet 1: Transactions
- **Purpose**: Main data storage for all service entries
- **Columns**:
  - A: Timestamp (Auto-generated)
  - B: Date (Auto-generated)
  - C: Worker_Name (Required)
  - D: Service_Type (Required)
  - E: Service_Cost (Auto-calculated)
  - F: Payment_Method (Required: Cash/Card)
  - G: Customer_Name (Optional)
  - H: Month_Year (Auto-generated)

#### Sheet 2: Workers
- **Purpose**: Employee list
- **Columns**:
  - A: Worker_Name
  - B: Status (Active/Inactive)
  - C: Hire_Date
  - D: Notes

#### Sheet 3: Services
- **Purpose**: Service types and pricing
- **Columns**:
  - A: Category
  - B: Service_Name
  - C: Price
  - D: Status (Active/Inactive)

#### Sheet 4: Daily_Summary
- **Purpose**: Auto-calculated daily totals
- **Columns**:
  - A: Date
  - B: Total_Sales
  - C: Transaction_Count
  - D: Cash_Total
  - E: Card_Total
  - F: Worker_Stats (JSON format)

#### Sheet 5: Settings
- **Purpose**: App configuration
- **Columns**:
  - A: Setting_Name
  - B: Setting_Value
  - C: Description

### Step 2: Add Sample Data
Add sample data to test the system:

**Workers Sheet:**
```
Maria | Active | 2024-01-15 | Senior Stylist
Ahmed | Active | 2024-02-01 | Barber
Sarah | Active | 2024-01-20 | Hair Stylist
John | Active | 2024-03-01 | Barber
Lisa | Active | 2024-02-15 | Hair Stylist
```

**Services Sheet:**
```
Hair Services | Basic Hair Cut | 15 | Active
Hair Services | Premium Hair Cut | 25 | Active
Hair Services | Hair Styling | 20 | Active
Hair Services | Hair Wash & Blow Dry | 12 | Active
Hair Services | Hair Coloring | 45 | Active
Hair Services | Hair Treatment | 35 | Active
Hair Services | Highlights | 60 | Active
Shaving Services | Basic Shave | 8 | Active
Shaving Services | Premium Shave | 15 | Active
Shaving Services | Beard Trim | 10 | Active
Shaving Services | Mustache Trim | 5 | Active
Facial Services | Basic Facial | 25 | Active
Facial Services | Deep Cleansing Facial | 40 | Active
Facial Services | Anti-Aging Facial | 50 | Active
```

## Phase 2: Google Apps Script Setup

### Step 1: Create Apps Script Project
1. Go to [Google Apps Script](https://script.google.com)
2. Click "New Project"
3. Name it "Salon Management Backend"

### Step 2: Add the Backend Code
Replace the default code with the provided Google Apps Script code (see `google-apps-script.js` file)

### Step 3: Configure Script Properties
1. Go to Project Settings
2. Add the following script properties:
   - `SPREADSHEET_ID`: Your Google Sheets ID
   - `SALON_NAME`: Your salon name
   - `TIMEZONE`: Your timezone (e.g., "America/New_York")

### Step 4: Deploy as Web App
1. Click "Deploy" > "New Deployment"
2. Choose "Web app" as type
3. Set execution permissions to "Anyone"
4. Set access permissions to "Anyone"
5. Click "Deploy"
6. Copy the web app URL

## Phase 3: Frontend Configuration

### Step 1: Configure Google Integration
1. Open `js/google-integration.js`
2. Find the line: `this.scriptUrl = '';`
3. Replace with your Google Apps Script web app URL:
   ```javascript
   this.scriptUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
   ```

### Step 2: Test the System
1. Open `index.html` in your web browser
2. Test the following features:
   - Worker dropdown population
   - Service selection and pricing
   - Form submission
   - Dashboard data display

## Phase 4: Deployment Options

### Option 1: Local Hosting
- Simply open `index.html` in a web browser
- Works offline with limited functionality
- Data syncs when online

### Option 2: Web Hosting
- Upload files to any web hosting service
- Ensure HTTPS for production use
- Configure CORS if needed

### Option 3: GitHub Pages
1. Create a GitHub repository
2. Upload all files
3. Enable GitHub Pages
4. Access via GitHub Pages URL

## Testing Checklist

### Functional Tests
- [ ] Add service entry with all fields
- [ ] Add service entry with minimum fields
- [ ] Test automatic cost calculation
- [ ] Test worker selection
- [ ] Test payment method selection
- [ ] Test form validation
- [ ] Test data sync to Google Sheets

### UI/UX Tests
- [ ] Test on mobile devices (320px, 375px, 414px)
- [ ] Test on tablet (768px, 1024px)
- [ ] Test on desktop browsers
- [ ] Test touch interactions
- [ ] Test keyboard navigation
- [ ] Test with slow internet connection

### Integration Tests
- [ ] Test Google Apps Script connectivity
- [ ] Test data accuracy in sheets
- [ ] Test error scenarios (no internet)
- [ ] Test concurrent user submissions

## Troubleshooting

### Common Issues

#### 1. Google Apps Script Not Responding
- Check if the script is deployed correctly
- Verify execution permissions
- Check Google Apps Script logs

#### 2. Data Not Syncing
- Verify spreadsheet ID in script properties
- Check sheet names match exactly
- Ensure column headers are correct

#### 3. CORS Errors
- Make sure Google Apps Script is deployed as web app
- Check execution permissions are set to "Anyone"
- Verify the script URL is correct

#### 4. Offline Mode Issues
- Check browser localStorage is enabled
- Verify offline data is being saved
- Test sync when connection is restored

### Performance Optimization
- Limit dashboard data to recent transactions
- Implement pagination for large datasets
- Use caching for frequently accessed data
- Optimize Google Apps Script execution time

## Security Considerations
- Google Apps Script web app should be deployed with appropriate permissions
- Consider implementing user authentication for production use
- Regularly backup Google Sheets data
- Monitor access logs for suspicious activity

## Maintenance
- Regularly update service prices in Google Sheets
- Add new workers as needed
- Monitor system performance
- Backup data regularly
- Update documentation as needed

## Support
For technical support or questions:
1. Check the troubleshooting section
2. Review Google Apps Script logs
3. Test with sample data
4. Verify all setup steps are completed

## Version History
- v1.0: Initial release with core functionality
- Future versions will include additional features and improvements
