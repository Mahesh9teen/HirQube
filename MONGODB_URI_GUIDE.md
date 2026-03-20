# 📍 How to Get Your MongoDB Connection URL

## Step-by-Step Guide (10 minutes)

### Step 1: Create MongoDB Atlas Account
```
1. Go to: https://www.mongodb.com/cloud/atlas
2. Click "Try Free" (green button)
3. Sign up with:
   - Email address
   - Password
   - Strong password
4. Check your email and verify
```

### Step 2: Create a Cluster
```
1. After login, you'll see "Create a Cluster" button
2. Choose: M0 Sandbox (FREE)
3. Select Region: 
   ✅ US-EAST-1 (recommended for you)
4. Click "Create Cluster"
5. ⏳ Wait 2-3 minutes (watch for "Cluster Deployed")
```

### Step 3: Create Database User
```
1. Look for "Quick Start" guide on screen
   OR navigate to: Security → Database Access
2. Click "Create a Database User"
3. Fill in:
   - Username: hirqube_user
   - Password: YourSecurePassword123! (remember this!)
4. Click "Create User"
```

### Step 4: Whitelist IP Address (Allow Connections)
```
1. Click "Security" in left menu
2. Click "Network Access"
3. Click "Add IP Address" (green button)
4. Choose: "Allow access from anywhere"
   - This adds: 0.0.0.0/0 (for development)
5. Click "Confirm"
```

### Step 5: Get Your Connection String
```
⭐ THIS IS THE IMPORTANT PART ⭐

1. Click "Databases" in left menu
2. You'll see your cluster (Cluster0)
3. Click "Connect" button (blue)
4. Choose "Drivers"
5. Select: Node.js
6. Select: 3.12 or latest version
7. In the code box, you'll see:
   
   mongodb+srv://hirqube_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

8. 🎯 COPY THIS ENTIRE STRING
```

### Step 6: Replace Password and Database Name
```
Your URL looks like:
mongodb+srv://hirqube_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

REPLACE:
- <password> → Your actual password (from Step 3)
- ? → /hirqube?

FINAL URL will look like:
mongodb+srv://hirqube_user:YourSecurePassword123@cluster0.abc123.mongodb.net/hirqube?retryWrites=true&w=majority
```

### Step 7: Paste Into .env File
```
In: backend/.env

Change from:
MONGODB_URI=mongodb+srv://hirqube_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/hirqube?retryWrites=true&w=majority

To:
MONGODB_URI=mongodb+srv://hirqube_user:YourSecurePassword123@cluster0.abc123.mongodb.net/hirqube?retryWrites=true&w=majority
```

---

## ⚠️ IMPORTANT NOTES

1. **Replace `<password>` with your ACTUAL password**
   - NOT the text "<password>"
   - Use the password you created in Step 3

2. **Add `/hirqube` before the `?`**
   - MongoDB gives you: `/?retryWrites=true`
   - You need: `/hirqube?retryWrites=true`

3. **Special characters in password?**
   - If password has: `@`, `#`, `!`, `:`
   - URL-encode them: https://www.urlencoder.org
   - Example: `!` becomes `%21`

4. **After pasting, SAVE the file**
   - Ctrl+S in VS Code

5. **Test connection later:**
   - When you start backend with `npm run dev`
   - You should see: `✅ MongoDB connected`

---

## 🔍 Visual Guide (What You'll See)

### In MongoDB Atlas "Connect" screen:
```
Connection String
mongodb+srv://hirqube_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

🔑 username: hirqube_user
🔑 password: (hidden, you created this)
🔑 cluster: cluster0.xxxxx
```

### Your final .env should have:
```env
MONGODB_URI=mongodb+srv://hirqube_user:YourActualPassword@cluster0.xxxxx.mongodb.net/hirqube?retryWrites=true&w=majority
```

---

## ✅ Verification Checklist

After pasting, verify:
- [ ] No `<password>` text (replaced with ACTUAL password)
- [ ] Starts with: `mongodb+srv://`
- [ ] Has: `/hirqube?` (database name added)
- [ ] Includes: `retryWrites=true&w=majority`
- [ ] File is saved (Ctrl+S)

---

## 🆘 Common Issues

### Issue: "MongoDB connection failed"
**Solution:** 
- Check IP whitelist (Network Access tab)
- Verify password is correct (copy from MongoDB, not memory)
- Make sure no special characters are in the URL

### Issue: "cluster0.xxxxx" part is different
**That's OK** - Everyone gets unique cluster URL. Just copy yours exactly.

### Issue: "Can't find where to copy the string"
**Path:** Clusters → Connect → Drivers → Node.js → Copy code box

---

## 📋 Quick Reference

| Item | Value | Where to Get |
|------|-------|-------------|
| URL | `mongodb+srv://...` | MongoDB Atlas → Connect → Drivers |
| Username | `hirqube_user` | Database Access tab |
| Password | `YourPassword` | Database Access tab (what you created) |
| Database | `hirqube` | Add this to URL `/hirqube?` |

---

## 🎯 Final Example

```
If MongoDB gives you:
mongodb+srv://hirqube_user:<password>@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority

And your password is: MyP@ssw0rd

Your final .env line should be:
MONGODB_URI=mongodb+srv://hirqube_user:MyP@ssw0rd@cluster0.abc123.mongodb.net/hirqube?retryWrites=true&w=majority
```

---

**After completing these steps, your connection URL is ready to paste!** ✅
