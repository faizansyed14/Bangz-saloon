# 🚀 Quick Setup Guide - BANGZ SALOON with Supabase

## Step 1: Create Supabase Project (5 minutes)

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up** with your GitHub account
3. **Create New Project**:
   - Name: `bangz-saloon`
   - Password: Generate strong password (save it!)
   - Region: **Asia Pacific (Singapore)**
4. **Wait 2-3 minutes** for setup

## Step 2: Setup Database (2 minutes)

1. **Go to SQL Editor** in Supabase dashboard
2. **Click "New Query"**
3. **Copy entire content** from `database-schema.sql` file
4. **Paste and click "Run"**
5. **Verify tables** in Table Editor (users, workers, services, transactions)

## Step 3: Get API Keys (1 minute)

1. **Go to Settings → API**
2. **Copy these values**:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJ...` (long string)

## Step 4: Update Configuration (1 minute)

1. **Open `config.js`** in your project
2. **Replace these lines**:
   ```javascript
   url: 'YOUR_SUPABASE_URL',
   anonKey: 'YOUR_SUPABASE_ANON_KEY'
   ```
3. **With your actual values**:
   ```javascript
   url: 'https://your-project.supabase.co',
   anonKey: 'your-actual-anon-key-here'
   ```

## Step 5: Test Your Setup (2 minutes)

1. **Open `test-migration.html`** in your browser
2. **Check the test results**:
   - ✅ Database Connection
   - ✅ Authentication
   - ✅ Data Operations
   - ✅ Performance

## Step 6: Test Your App (2 minutes)

1. **Open `login.html`** in your browser
2. **Login with**:
   - Email: `admin@bangzsaloon.com`
   - Password: `admin123`
3. **Test all features**:
   - Dashboard
   - New Entry
   - Calendar
   - Admin Panel

## 🎉 You're Done!

Your BANGZ SALOON system is now running on:
- ⚡ **10x faster** Supabase database
- 🌍 **Global CDN** ready for Netlify
- 🔒 **Enterprise security**
- 📱 **Mobile optimized**

## 🚀 Next: Deploy to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Drag your project folder
3. Your site goes live instantly!

## 🆘 Need Help?

- Check browser console for errors
- Verify Supabase credentials in `config.js`
- Ensure database schema was created
- Test with `test-migration.html` first

**Total setup time: ~10 minutes** ⏱️
