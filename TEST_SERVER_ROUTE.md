# Server Route Not Found - Troubleshooting Steps

## The Problem
Getting `404 Cannot GET /api/chat-history` even though:
- ✅ Files exist (chatHistory.routes.ts, controller, service)
- ✅ Route is registered in server.ts
- ✅ Server shows it's running

## Solution Steps

### Step 1: KILL AND RESTART THE SERVER COMPLETELY

**Important:** Sometimes nodemon doesn't detect all file changes.

1. **Stop the server:**
   - Go to the terminal where server is running
   - Press `Ctrl+C` TWICE to force kill
   - Wait until you see the command prompt

2. **Clear any cached processes:**
   ```bash
   # In terminal
   cd E:\DLTITANS\yield\server
   ```

3. **Start fresh:**
   ```bash
   npm run dev
   ```

4. **Watch for these logs:**
   ```
   🚀 Server running on port 5000
   📡 Environment: development
   ```

### Step 2: VERIFY SERVER IS ACTUALLY RUNNING

Open a NEW terminal and test:

```bash
curl http://localhost:5000/health
```

Should return:
```json
{"status":"ok","timestamp":"..."}
```

If this FAILS:
- Server is not running
- Check terminal for errors
- Port 5000 might be in use

### Step 3: TEST THE CHAT HISTORY ENDPOINT

```bash
curl http://localhost:5000/api/chat-history
```

Expected responses:
- ✅ `{"error":"Unauthorized"}` or `{"error":"No token provided"}` - **GOOD!** Route works, just needs auth
- ❌ `Cannot GET /api/chat-history` - Route not registered

### Step 4: IF STILL 404, CHECK SERVER LOGS

When you start the server, look for:
- ❌ **Red errors** about imports
- ❌ Errors about "Cannot find module"
- ❌ TypeScript compilation errors

Common issues:
```
Error: Cannot find module './routes/chatHistory.routes'
```

### Step 5: MANUAL FIX IF NEEDED

If route still doesn't work, try this:

**Option A: Rename the import in server.ts**

Edit `server/src/server.ts`:

```typescript
// Try with explicit .js extension
import chatHistoryRoutes from './routes/chatHistory.routes.js';
```

**Option B: Check tsconfig.json**

Ensure `server/tsconfig.json` has:
```json
{
  "compilerOptions": {
    "moduleResolution": "node"
  },
  "include": ["src/**/*"]
}
```

**Option C: Restart with cache clear**

```bash
cd server
rm -rf node_modules/.cache
npm run dev
```

### Step 6: USE POSTMAN OR BROWSER TO TEST

1. **Open Postman or your browser:**
   ```
   GET http://localhost:5000/api/chat-history
   ```

2. **Add Authorization header (from localStorage):**
   - Open browser console
   - Run: `localStorage.getItem('token')`
   - Copy the token
   - Add header: `Authorization: Bearer YOUR_TOKEN`

3. **Expected Response:**
   - Status: 200 OK
   - Body: `{"success": true, "chats": []}`

### Step 7: CHECK IF PORT 5000 IS ALREADY IN USE

```bash
# Windows
netstat -ano | findstr :5000

# If something is using port 5000, kill it or change your server port
```

### Step 8: NUCLEAR OPTION - REBUILD EVERYTHING

If nothing works:

```bash
cd server
rm -rf node_modules
rm -rf dist
npm install
npm run dev
```

## Quick Diagnostic Commands

Run these in order:

```bash
# 1. Check if server is running
curl http://localhost:5000/health

# 2. Check if route exists (will get 401, not 404)
curl http://localhost:5000/api/chat-history

# 3. Check what routes are registered
# Add this temporarily to server.ts after all routes:
app._router.stack.forEach(r => {
  if (r.route) console.log(r.route.path)
})

# 4. Restart server and watch logs carefully
npm run dev
```

## What Success Looks Like

When everything is working, you'll see in browser console:

```javascript
Fetching chat history from: http://localhost:5000/api/chat-history
Chat history response: {success: true, chats: []}
```

NOT:
```
GET http://localhost:5000/api/chat-history 404 (Not Found)
Cannot GET /api/chat-history
```

## Still Not Working?

1. Share the FULL server terminal output when it starts
2. Share any RED error messages
3. Check if `chatHistory.routes.ts` has any syntax errors
4. Verify the file was actually saved (open it in VS Code)
