exports.handler = async (event, context) => {
  // This function will be triggered daily at 11 PM Dubai time
  
  try {
    console.log('Triggering daily email report...');
    
    // Call your Supabase function
    const response = await fetch('https://ryspwycehszeyrdnpzyo.supabase.co/functions/v1/daily-report', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      throw new Error(`Supabase function failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('Daily email sent successfully:', result);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Daily email report triggered successfully',
        emailId: result.emailId
      })
    };

  } catch (error) {
    console.error('Error triggering daily email:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
