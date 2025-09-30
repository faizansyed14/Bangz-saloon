# 🚀 BANGZ SALOON - Quick Setup Guide

## ⚡ Fast Track Setup (5 Minutes)

### Step 1: Create Google Sheets
1. Go to [Google Sheets](https://sheets.google.com)
2. Create new spreadsheet: **"BANGZ SALOON Management Data"**
3. Copy the Spreadsheet ID from URL (the long string between `/d/` and `/edit`)

### Step 2: Create Google Apps Script
1. Go to [Google Apps Script](https://script.google.com)
2. Create new project: **"BANGZ SALOON Backend"**
3. Copy entire content from `google-apps-script.js` and paste it
4. **IMPORTANT**: Replace `SPREADSHEET_ID: ''` with your actual ID:
   ```javascript
   SPREADSHEET_ID: 'your_actual_spreadsheet_id_here',
   ```

### Step 3: Deploy Web App
1. Click **Deploy** → **New deployment**
2. Choose **Web app**
3. Set **Execute as**: "Me"
4. Set **Who has access**: "Anyone"
5. Click **Deploy**
6. **Copy the Web App URL**

### Step 4: Update Frontend
1. Open `js/google-integration.js`
2. Find `GOOGLE_APPS_SCRIPT_URL`
3. Replace with your Web App URL:
   ```javascript
   const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
   ```

### Step 5: Initialize System
1. In Apps Script, select **"setupSpreadsheet"** function
2. Click **Run**
3. Wait for completion
4. Check your Google Sheets - should have 6 new sheets

### Step 6: Test
1. Open `index.html`
2. Add a test service entry
3. Check **Transactions** sheet for data

## 🔐 Enable Authentication (Optional)

### Add Your User
1. Go to **Users** sheet in Google Sheets
2. Add your email with admin password hash:
   ```
   your-email@gmail.com | 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9 | Active | Admin | Your Name |
   ```

### Enable Login
1. Uncomment in `index.html`:
   ```html
   <script src="js/auth.js"></script>
   ```
2. Uncomment authentication code in `js/main.js`
3. Access via `login.html`

## 🎯 Default Login Credentials
- **Email**: `admin@bangzsaloon.com`
- **Password**: `admin123`

## ✅ You're Done!
Your BANGZ SALOON system is now fully operational with Google Sheets integration!
