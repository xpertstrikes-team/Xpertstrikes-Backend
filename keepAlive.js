// Keep Render.com server warm by pinging every 10 minutes
// Deploy this on a free service like Vercel/Netlify as a serverless function
// Or use a free cron service like cron-job.org

const SERVER_URL = "https://xpertstrikes-backend-f4fj.onrender.com/api/health";

async function pingServer() {
  try {
    const response = await fetch(SERVER_URL);
    const data = await response.json();
    console.log(`✅ Server pinged at ${new Date().toISOString()}:`, data);
  } catch (error) {
    console.error(`❌ Ping failed at ${new Date().toISOString()}:`, error.message);
  }
}

// Run immediately
pingServer();

// Then run every 10 minutes
setInterval(pingServer, 10 * 60 * 1000);
