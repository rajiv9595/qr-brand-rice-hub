# 🔧 Authentication Debugging Guide

## ❌ Common Issue: "Authentication failed"

This error typically occurs when the **frontend cannot connect to the backend**.

---

## 🔍 Root Causes

### 1. **Backend Not Running**
The most common issue is that your backend server is not running.

**Solution:**
```bash
# Navigate to backend directory
cd backend

# Start the backend server
npm run dev
# OR
node server.js
```

**Expected output:**
```
Server running on port 5000
Connected to MongoDB/Database
```

---

### 2. **Wrong API URL**
The frontend is trying to connect to the wrong backend URL.

**Check `.env` file:**
```env
VITE_API_URL=http://localhost:5000/api
```

**Common port numbers:**
- Express default: `5000`
- NestJS default: `3000`
- Your custom port: Check your backend config

**Fix:**
1. Open `frontend/.env`
2. Update `VITE_API_URL` to match your backend port
3. Restart frontend dev server

---

### 3. **CORS Issues**
Backend is blocking requests from frontend.

**Backend needs CORS enabled:**

**Express.js:**
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));
```

**NestJS:**
```typescript
app.enableCors({
  origin: 'http://localhost:5173',
  credentials: true
});
```

---

### 4. **Backend Routes Not Implemented**
The authentication endpoints don't exist yet.

**Required endpoints:**
```
POST /api/auth/login
POST /api/auth/register
```

**Example Express.js implementation:**
```javascript
// routes/auth.js
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Verify password
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Generate JWT
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  
  // Check if user exists
  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).json({ message: 'Email already registered' });
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || 'customer'
  });
  
  // Generate JWT
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  res.status(201).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});
```

---

## 🛠️ Debugging Steps

### Step 1: Check Backend Status
```bash
# Is backend running?
curl http://localhost:5000/api/health
# OR
curl http://localhost:3000/api/health
```

**Expected:** `200 OK` or similar response

---

### Step 2: Check Frontend Console
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try to login/signup
4. Look for error messages

**Common errors:**
- `ERR_CONNECTION_REFUSED` → Backend not running
- `ERR_NAME_NOT_RESOLVED` → Wrong URL
- `CORS error` → CORS not configured
- `404 Not Found` → Route doesn't exist
- `401 Unauthorized` → Wrong credentials

---

### Step 3: Check Network Tab
1. Open DevTools (F12)
2. Go to **Network** tab
3. Try to login/signup
4. Look for the request to `/api/auth/login`

**Check:**
- **Status Code:** Should be `200` for success
- **Response:** Should contain `token` and `user`
- **Request Payload:** Should contain `email` and `password`

---

### Step 4: Test Backend Directly
Use Postman or curl to test backend:

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"test@example.com",
    "password":"password123",
    "role":"supplier"
  }'
```

**Expected response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com",
    "role": "supplier"
  }
}
```

---

## ✅ Quick Fix Checklist

- [ ] Backend server is running
- [ ] Backend is on correct port (check console output)
- [ ] Frontend `.env` has correct `VITE_API_URL`
- [ ] CORS is enabled on backend
- [ ] Auth routes exist (`/api/auth/login`, `/api/auth/register`)
- [ ] Database is connected
- [ ] User model exists
- [ ] JWT secret is configured
- [ ] Frontend dev server restarted after `.env` change

---

## 🔄 Restart Frontend After .env Changes

**IMPORTANT:** After changing `.env`, you MUST restart the dev server!

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

---

## 📝 Error Messages Explained

### "Cannot connect to server"
- Backend is not running
- Wrong port in `.env`
- Firewall blocking connection

### "Invalid credentials"
- Wrong email/password
- User doesn't exist
- Password hash mismatch

### "Email already registered"
- User already exists in database
- Try login instead of signup

### "Authentication failed: Network Error"
- Backend not running
- CORS issue
- Wrong URL

---

## 🎯 Quick Test

**Create a test user directly in database:**

**MongoDB:**
```javascript
db.users.insertOne({
  name: "Test Admin",
  email: "admin@test.com",
  password: "$2b$10$...", // bcrypt hash of "admin123"
  role: "admin",
  createdAt: new Date()
});
```

**Then try logging in with:**
- Email: `admin@test.com`
- Password: `admin123`

---

## 🚀 Next Steps

1. **Start backend server**
2. **Verify it's running** (check console)
3. **Update `.env`** with correct port
4. **Restart frontend** dev server
5. **Try login again**
6. **Check browser console** for errors

---

## 💡 Pro Tips

1. **Use environment variables:**
   ```env
   # Backend .env
   PORT=5000
   JWT_SECRET=your-secret-key
   MONGODB_URI=mongodb://localhost:27017/qr-brand
   ```

2. **Add health check endpoint:**
   ```javascript
   app.get('/api/health', (req, res) => {
     res.json({ status: 'OK', timestamp: new Date() });
   });
   ```

3. **Enable detailed error logging:**
   ```javascript
   app.use((err, req, res, next) => {
     console.error('Error:', err);
     res.status(500).json({ message: err.message });
   });
   ```

---

**Need more help? Check the browser console and network tab for detailed error messages!**
