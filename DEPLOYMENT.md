# Deployment Guide - MindWell

## Pre-Deployment Checklist

### Backend Setup

1. **Environment Variables**
   Create `.env` file in `/backend` with:
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/mindwell
   JWT_SECRET=your-super-secure-random-string-min-32-chars
   MASTER_KEY=a-separate-random-string-of-at-least-32-characters
   CLIENT_ORIGIN=http://localhost:3000
   NODE_ENV=production
   ```

2. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Database Setup**
   - Ensure MongoDB Atlas cluster is created
   - Add connection string to `.env`
   - Verify indexes are created:
     ```
     db.journals.createIndex({ userId: 1, date: -1 })
     db.users.createIndex({ email: 1 })
     ```

4. **Start Backend**
   ```bash
   npm run dev  # Development
   npm start    # Production
   ```
   Should see: `Server running on port 5000`

### Frontend Setup

1. **Environment Variables**
   Create `.env` in `/frontend` with:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```
   Or for production: `https://your-api-domain.com/api`

2. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Build Frontend**
   ```bash
   npm run build
   ```

4. **Start Development Server**
   ```bash
   npm start
   ```

## Feature Verification

### ✅ Week-Based Journal for Free Users
- [x] Free users see only 7-day window
- [x] Empty days show "No data"
- [x] Premium upsell card displays
- [x] Backend enforces week filter

### ✅ Premium Features Locked
- [x] Date filter (premium only)
- [x] Prompt filter (premium only)
- [x] Analytics on full history (premium only)
- [x] Export data button (premium only)
- [x] 403 errors returned when unauthorized

### ✅ Export Data Endpoint
- [x] Endpoint: `GET /api/journal/export`
- [x] Returns encrypted content decrypted
- [x] Includes statistics (avg mood, avg energy, date range)
- [x] File download in frontend
- [x] Premium-only with auth check

### ✅ Navigation Bar
- [x] Sticky positioning
- [x] Visible while scrolling
- [x] Z-index properly set
- [x] All links functional

### ✅ Breathing Tool
- [x] Ball slides on triangle edges
- [x] Inhale: Left → Top (4 seconds)
- [x] Hold: Top → Right (7 seconds)
- [x] Exhale: Right → Left (8 seconds)
- [x] Ball size scales slightly
- [x] All three levels working

## API Testing Examples

### 1. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "recoveryKeyword": "myrecoverykeyword"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
# Returns: { token: "jwt-token-here" }
```

### 3. Create Journal Entry
```bash
curl -X POST http://localhost:5000/api/journal \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Today was amazing",
    "moodScore": 9,
    "energyScore": 8,
    "promptUsed": "What went well today?"
  }'
```

### 4. Get Journal (with week filter for free)
```bash
curl -X GET http://localhost:5000/api/journal \
  -H "Authorization: Bearer {token}"
```

### 5. Export Data (Premium Only)
```bash
curl -X GET http://localhost:5000/api/journal/export \
  -H "Authorization: Bearer {premium-token}" \
  -o export.json
```

## Common Issues & Solutions

### Issue: "MongoDB is required for authentication"
**Solution:** Check MongoDB connection string in `.env`

### Issue: "JWT_SECRET is required"
**Solution:** Add JWT_SECRET to `.env` with 32+ character string

### Issue: CORS errors
**Solution:** Verify backend CORS is configured for frontend URL in `server.js`

### Issue: "Export is only available for premium members"
**Solution:** This is expected for free users. Set `isPremium: true` in database to test.

### Issue: Ball not moving on breathing tool
**Solution:** Ensure `framer-motion` is installed: `npm install framer-motion`

## Performance Optimization

1. **Database Indexes** (automatically created in models)
   - `userId` index for faster queries
   - `date` index for sorting

2. **Encryption** 
   - Uses AES-256-GCM for data at rest
   - IV and authTag stored with encrypted content

3. **Frontend Optimization**
   - Chart rendering optimized for 100+ entries
   - Lazy loading for journal entries
   - Memo optimization for expensive computations

4. **Caching Suggestions**
   - Implement Redis for session caching
   - Cache export data temporarily
   - Browser local storage for UI state

## Security Considerations

1. **Authentication**
   - JWT tokens with 24-hour expiration (configure in authController)
   - Passwords hashed with bcryptjs
   - Recovery keyword for account recovery

2. **Data Protection**
   - All journal content encrypted server-side
   - HTTPS recommended in production
   - CORS restricted to frontend domain

3. **Premium Features**
   - Server-side validation of `isPremium` flag
   - 403 Forbidden responses for unauthorized access
   - Audit logs recommended for compliance

## Deployment Platforms

### Option 1: Render + Vercel (recommended)
1. Create a Render Blueprint from this repository. The included `render.yaml`
   deploys the `/backend` service and provides a health check at `/api/health`.
2. Add `MONGO_URI` and `CLIENT_ORIGIN` in Render's environment settings. Keep
   `JWT_SECRET` and `MASTER_KEY` secret; never put them in a client variable.
3. Import the repository into Vercel with `frontend` as the Root Directory.
   Set `REACT_APP_API_URL` to `https://<render-service>.onrender.com/api`.
4. Set `CLIENT_ORIGIN` in Render to the final Vercel deployment URL and redeploy.

### Option 2: AWS
- Backend: EC2 or Elastic Beanstalk
- Database: MongoDB Atlas or RDS
- Frontend: S3 + CloudFront

### Option 3: Digital Ocean
- Backend: Droplet with Node.js
- Database: MongoDB Atlas (managed)
- Frontend: Same droplet or separate Vercel deployment

## Post-Deployment

1. **Verify All Endpoints**
   - Test each API endpoint documented in TESTING.md
   - Verify premium features are locked

2. **Monitor Logs**
   - Check for errors in production logs
   - Monitor database performance

3. **Backup Strategy**
   - Regular MongoDB backups
   - Test restore procedures

4. **Analytics**
   - Track feature usage
   - Monitor export/download frequency
   - Track premium conversion

## Rollback Plan

1. Keep previous version deployed
2. Version API endpoints (/api/v1/, /api/v2/)
3. Monitor error rates
4. Have quick rollback script ready

## Success Metrics

- [ ] All API tests passing
- [ ] Export file contains correct data
- [ ] Free users cannot access premium features
- [ ] Premium features work for premium users
- [ ] No console errors in production
- [ ] Performance acceptable (<2s load time)
- [ ] Mobile responsive design working
- [ ] All features documented and tested

