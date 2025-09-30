# BANGZ SALOON - Google Apps Script Setup Guide

## 🚀 Complete Setup from Scratch

This guide will walk you through setting up Google Apps Script, Google Sheets, and authentication for your BANGZ SALOON management system.

---

## 📋 Prerequisites

- ✅ Fresh Gmail account created
- ✅ Access to Google Drive
- ✅ Access to Google Apps Script

---

## 🔧 Step 1: Create Google Sheets Workbook

### 1.1 Create New Spreadsheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Click **"+ Blank"** to create a new spreadsheet
3. Rename it to: **"BANGZ SALOON Management Data"**
4. **Important**: Note down the Spreadsheet ID from the URL
   - URL format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Copy the `SPREADSHEET_ID` part

### 1.2 Share the Spreadsheet
1. Click **"Share"** button (top right)
2. Set permissions to **"Anyone with the link can edit"** (for testing)
3. Or add your email with **"Editor"** permissions

---

## 🔧 Step 2: Create Google Apps Script Project

### 2.1 Create New Project
1. Go to [Google Apps Script](https://script.google.com)
2. Click **"+ New project"**
3. Rename the project to: **"BANGZ SALOON Backend"**

### 2.2 Copy the Code
1. Delete the default `myFunction()` code
2. Copy the entire content from `google-apps-script.js` file
3. Paste it into the Apps Script editor

### 2.3 Set Script Properties
1. In Apps Script, go to **"Project Settings"** (gear icon)
2. Scroll down to **"Script Properties"**
3. Click **"+ Add script property"**
4. Add these properties:

| Property Name | Property Value |
|---------------|----------------|
| `SPREADSHEET_ID` | Your spreadsheet ID from Step 1.1 |

### 2.4 Save the Project
1. Press **Ctrl+S** (or Cmd+S on Mac)
2. Give it a name: **"BANGZ SALOON Backend"**

---

## 🔧 Step 3: Deploy the Web App

### 3.1 Create Deployment
1. Click **"Deploy"** → **"New deployment"**
2. Click the gear icon ⚙️ → **"Web app"**
3. Fill in the details:
   - **Description**: "BANGZ SALOON Management System API"
   - **Execute as**: "Me"
   - **Who has access**: "Anyone"
4. Click **"Deploy"**

### 3.2 Get Web App URL
1. Copy the **Web App URL** (starts with `https://script.google.com/...`)
2. **Important**: Save this URL - you'll need it for the frontend

### 3.3 Authorize Permissions
1. Click **"Authorize access"**
2. Choose your Gmail account
3. Click **"Advanced"** → **"Go to [Project Name] (unsafe)"**
4. Click **"Allow"**

---

## 🔧 Step 4: Configure Frontend

### 4.1 Update Google Integration
1. Open `js/google-integration.js`
2. Find the `GOOGLE_APPS_SCRIPT_URL` variable
3. Replace the placeholder with your Web App URL from Step 3.2

```javascript
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

### 4.2 Test Connection
1. Open `index.html` in your browser
2. Open browser console (F12)
3. Look for connection test messages
4. Should see: "✅ Connection test successful"

---

## 🔧 Step 5: Initialize the System

### 5.1 Run Setup Function
1. In Google Apps Script, go to **"Functions"** dropdown
2. Select **"setupSpreadsheet"**
3. Click **"Run"** button
4. Wait for execution to complete
5. Check **"Execution log"** for success message

### 5.2 Verify Sheets Creation
1. Go back to your Google Sheets
2. You should see these sheets created:
   - ✅ **Transactions** - For service entries
   - ✅ **Workers** - Worker information
   - ✅ **Services** - Service types and prices
   - ✅ **Daily_Summary** - Daily sales summaries
   - ✅ **Settings** - System settings
   - ✅ **Users** - User authentication data

---

## 🔧 Step 6: Set Up Authentication

### 6.1 Default Admin User
The system creates a default admin user:
- **Email**: `admin@bangzsaloon.com`
- **Password**: `admin123`
- **Role**: Admin

### 6.2 Add More Users
1. Go to the **"Users"** sheet
2. Add new rows with user information:

| Email | Password (Hashed) | Status | Role | Name | Last_Login |
|-------|------------------|--------|------|------|------------|
| your-email@gmail.com | [hashed_password] | Active | Admin | Your Name | |

**Note**: For now, use the same hashed password as admin: `240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9`

### 6.3 Enable Authentication
1. Open `index.html`
2. Uncomment the authentication script:
   ```html
   <script src="js/auth.js"></script>
   ```
3. Uncomment authentication code in `js/main.js`
4. Uncomment user interface in `index.html`

---

## 🔧 Step 7: Test the Complete System

### 7.1 Test Data Entry
1. Go to **"Add Service"** section
2. Fill in a test service entry
3. Submit the form
4. Check **"Transactions"** sheet for new data

### 7.2 Test Authentication
1. Navigate to `login.html`
2. Login with admin credentials
3. Should redirect to main application
4. Test logout functionality

### 7.3 Test Dashboard
1. Check dashboard shows data
2. Verify worker performance
3. Test calendar view
4. Check monthly statistics

---

## 🔧 Step 8: Production Setup

### 8.1 Security Settings
1. In Google Sheets, change sharing to **"Restricted"**
2. Add only authorized users
3. Remove public access

### 8.2 Backup Setup
1. Create regular backups of your spreadsheet
2. Export data periodically
3. Keep Apps Script code backed up

---

## 🚨 Troubleshooting

### Common Issues:

1. **"Script not found" error**
   - Check Web App URL is correct
   - Verify deployment is active

2. **"Permission denied" error**
   - Re-authorize the script
   - Check spreadsheet sharing permissions

3. **"Sheet not found" error**
   - Run `setupSpreadsheet()` function
   - Check sheet names match exactly

4. **Authentication not working**
   - Verify Users sheet has data
   - Check password hashing
   - Ensure user status is "Active"

### Debug Steps:
1. Check browser console for errors
2. Check Apps Script execution log
3. Verify all URLs and IDs are correct
4. Test with default admin credentials first

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all steps were completed correctly
3. Check browser console and Apps Script logs
4. Test with default admin user first

---

## ✅ Final Checklist

- [ ] Google Sheets created and shared
- [ ] Apps Script project created and deployed
- [ ] Script properties configured
- [ ] Web App URL updated in frontend
- [ ] Setup function executed successfully
- [ ] All sheets created in spreadsheet
- [ ] Default admin user available
- [ ] Authentication tested and working
- [ ] Data entry tested
- [ ] Dashboard displaying correctly

**🎉 Congratulations! Your BANGZ SALOON management system is now fully operational!**
