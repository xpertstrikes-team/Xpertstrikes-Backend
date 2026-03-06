# Server Keep-Alive Setup

## Problem
Render.com free tier puts servers to sleep after 15 minutes of inactivity, causing 30+ second cold starts.

## Solution Options

### Option 1: Use a Free Cron Service (RECOMMENDED)
1. Go to https://cron-job.org (free account)
2. Create a new cron job:
   - URL: `https://xpertstrikes-backend-f4fj.onrender.com/api/health`
   - Interval: Every 10 minutes
   - Method: GET

### Option 2: Use UptimeRobot (FREE)
1. Go to https://uptimerobot.com
2. Add new monitor:
   - Monitor Type: HTTP(s)
   - URL: `https://xpertstrikes-backend-f4fj.onrender.com/api/health`
   - Monitoring Interval: 5 minutes

### Option 3: Deploy keepAlive.js
Deploy `keepAlive.js` on a service that doesn't sleep:
- Vercel (as a serverless function)
- Railway (free tier)
- Your local machine (if always on)

## Result
Server stays warm = instant form submissions (< 1 second)
