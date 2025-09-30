import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]
    const todayFormatted = new Date().toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    console.log(`Generating daily report for ${today}`)

    // Get today's transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('date', today)
      .order('created_at', { ascending: false })

    if (transactionsError) {
      throw new Error(`Failed to fetch transactions: ${transactionsError.message}`)
    }

    // Calculate statistics
    const totalSales = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0)
    const totalTips = transactions.reduce((sum, t) => sum + parseFloat(t.tip || 0), 0)
    const cashTotal = transactions.filter(t => t.payment_method === 'Cash').reduce((sum, t) => sum + parseFloat(t.amount), 0)
    const cardTotal = transactions.filter(t => t.payment_method === 'Card').reduce((sum, t) => sum + parseFloat(t.amount), 0)
    
    // Calculate worker stats
    const workerStats: { [key: string]: { total: number, count: number, cash: number, card: number } } = {}
    transactions.forEach(transaction => {
      const worker = transaction.worker
      if (!workerStats[worker]) {
        workerStats[worker] = { total: 0, count: 0, cash: 0, card: 0 }
      }
      workerStats[worker].total += parseFloat(transaction.amount)
      workerStats[worker].count += 1
      if (transaction.payment_method === 'Cash') {
        workerStats[worker].cash += parseFloat(transaction.amount)
      } else {
        workerStats[worker].card += parseFloat(transaction.amount)
      }
    })

    // Calculate category stats
    const categoryStats: { [key: string]: { total: number, count: number } } = {}
    transactions.forEach(transaction => {
      const category = transaction.category || 'Unknown'
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, count: 0 }
      }
      categoryStats[category].total += parseFloat(transaction.amount)
      categoryStats[category].count += 1
    })

    // Generate HTML email template
    const emailHtml = generateEmailTemplate({
      date: todayFormatted,
      totalSales,
      totalTips,
      cashTotal,
      cardTotal,
      transactionCount: transactions.length,
      transactions,
      workerStats,
      categoryStats
    })

    // Send email using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const recipientEmail = Deno.env.get('RECIPIENT_EMAIL')
    
    if (!resendApiKey || !recipientEmail) {
      throw new Error('Missing email configuration')
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'BANGZ SALOON <noreply@bangzsaloon.com>',
        to: [recipientEmail],
        subject: `📊 Daily Sales Report - ${todayFormatted}`,
        html: emailHtml,
      }),
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      throw new Error(`Failed to send email: ${errorText}`)
    }

    const emailResult = await emailResponse.json()
    console.log('Email sent successfully:', emailResult.id)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Daily report sent successfully',
        emailId: emailResult.id,
        stats: {
          totalSales,
          totalTips,
          transactionCount: transactions.length,
          workers: Object.keys(workerStats).length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error generating daily report:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

function generateEmailTemplate(data: any): string {
  const { date, totalSales, totalTips, cashTotal, cardTotal, transactionCount, transactions, workerStats, categoryStats } = data

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Sales Report - BANGZ SALOON</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #667eea; }
        .stat-value { font-size: 24px; font-weight: bold; color: #667eea; margin: 10px 0; }
        .stat-label { color: #666; font-size: 14px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .table th { background-color: #f8f9fa; font-weight: bold; color: #333; }
        .table tr:hover { background-color: #f5f5f5; }
        .worker-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
        .worker-card { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; }
        .category-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .category-normal { background-color: #e3f2fd; color: #1976d2; }
        .category-promotional { background-color: #fff3e0; color: #f57c00; }
        .footer { text-align: center; margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px; color: #666; }
        .highlight { background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 BANGZ SALOON</h1>
        <p>Daily Sales Report - ${date}</p>
    </div>

    <div class="highlight">
        <strong>📈 Summary:</strong> ${transactionCount} transactions completed today with a total revenue of <strong>${totalSales.toFixed(2)} AED</strong>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-value">${totalSales.toFixed(2)} AED</div>
            <div class="stat-label">Total Sales</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${totalTips.toFixed(2)} AED</div>
            <div class="stat-label">Total Tips</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${cashTotal.toFixed(2)} AED</div>
            <div class="stat-label">Cash Payments</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${cardTotal.toFixed(2)} AED</div>
            <div class="stat-label">Card Payments</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${transactionCount}</div>
            <div class="stat-label">Total Transactions</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${Object.keys(workerStats).length}</div>
            <div class="stat-label">Active Workers</div>
        </div>
    </div>

    <div class="section">
        <h2>👥 Worker Performance</h2>
        <div class="worker-stats">
            ${Object.entries(workerStats).map(([worker, stats]: [string, any]) => `
                <div class="worker-card">
                    <h3>${worker}</h3>
                    <p><strong>Total Sales:</strong> ${stats.total.toFixed(2)} AED</p>
                    <p><strong>Transactions:</strong> ${stats.count}</p>
                    <p><strong>Cash:</strong> ${stats.cash.toFixed(2)} AED</p>
                    <p><strong>Card:</strong> ${stats.card.toFixed(2)} AED</p>
                </div>
            `).join('')}
        </div>
    </div>

    <div class="section">
        <h2>📋 Service Categories</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Transactions</th>
                    <th>Total Revenue</th>
                    <th>Average per Transaction</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(categoryStats).map(([category, stats]: [string, any]) => `
                    <tr>
                        <td><span class="category-badge category-${category.toLowerCase()}">${category}</span></td>
                        <td>${stats.count}</td>
                        <td>${stats.total.toFixed(2)} AED</td>
                        <td>${(stats.total / stats.count).toFixed(2)} AED</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>📝 Today's Transactions</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>Time</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Worker</th>
                    <th>Amount</th>
                    <th>Tip</th>
                    <th>Payment</th>
                    <th>Category</th>
                </tr>
            </thead>
            <tbody>
                ${transactions.map(transaction => `
                    <tr>
                        <td>${new Date(transaction.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
                        <td>${transaction.customer_name || 'Walk-in Customer'}</td>
                        <td>${transaction.service}</td>
                        <td>${transaction.worker}</td>
                        <td>${parseFloat(transaction.amount).toFixed(2)} AED</td>
                        <td>${parseFloat(transaction.tip || 0).toFixed(2)} AED</td>
                        <td>${transaction.payment_method}</td>
                        <td><span class="category-badge category-${(transaction.category || 'unknown').toLowerCase()}">${transaction.category || 'Unknown'}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="footer">
        <p>📧 This is an automated daily report from BANGZ SALOON Management System</p>
        <p>Generated on ${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dubai' })}</p>
    </div>
</body>
</html>
  `
}
