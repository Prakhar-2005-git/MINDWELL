# MindWell Testing Guide

## Testing Checklist

### 1. Authentication Tests
- [ ] User can register with email and password
- [ ] User can log in with valid credentials
- [ ] User receives JWT token on login
- [ ] Unauthorized users cannot access protected routes
- [ ] Token expires appropriately

### 2. Journal Entry Tests
- [ ] Free users can create new journal entries
- [ ] Entries are encrypted and stored securely
- [ ] Free users can view only current week entries (7 days)
- [ ] Free users cannot view older entries
- [ ] Premium users can view all entries
- [ ] Premium users can search by date and prompt
- [ ] Entries display mood score (1-10) and energy score (1-10)
- [ ] Prompt used is saved and displayed

### 3. Analytics Tests - FREE USERS
- [ ] Mood chart shows only current week data
- [ ] Pie chart shows emotion distribution for current week only
- [ ] Labels show "Last 7 entries"
- [ ] No option to export data
- [ ] Premium upsell card is visible

### 4. Analytics Tests - PREMIUM USERS
- [ ] Mood chart shows all historical data
- [ ] Pie chart shows emotion distribution for all entries
- [ ] Can filter journal by date range
- [ ] Can filter journal by prompt keyword
- [ ] Export data button is available
- [ ] Export downloads JSON file with all data

### 5. Export Data Tests (Premium Only)
- [ ] Export includes user metadata (email, premium status, creation date)
- [ ] Export includes all journal entries with decrypted content
- [ ] Export includes statistics (average mood, average energy, date range)
- [ ] Free users receive 403 error when attempting to export
- [ ] Exported file is valid JSON format
- [ ] File naming includes export date

### 6. Breathing Tool Tests
- [ ] User can select breathing exercise level
- [ ] Ball slides along triangle path:
  - Inhale: Left corner → Top corner
  - Hold: Top corner → Right corner
  - Exhale: Right corner → Left corner
- [ ] Countdown timer counts down correctly
- [ ] Phase text updates (Inhale, Hold, Exhale)
- [ ] Ball size scales slightly during inhale phase
- [ ] All three breathing levels work correctly

### 7. Navigation Tests
- [ ] Navbar remains visible when scrolling
- [ ] Active navigation link is highlighted
- [ ] All navigation links work correctly
- [ ] Logout functionality works
- [ ] User can navigate between all pages

### 8. Premium Flag Tests
- [ ] Free users see premium upgrade prompts
- [ ] Premium users have access to all features
- [ ] Premium flag is stored correctly in database
- [ ] Endpoints check isPremium before returning full data
- [ ] 403 Forbidden response for unauthorized premium features

## Backend API Testing

### Journal Endpoints

#### POST /api/journal (Create Entry)
```bash
curl -X POST http://localhost:5000/api/journal \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Today was a good day",
    "moodScore": 8,
    "energyScore": 7,
    "promptUsed": "What is one thing you would like to let go of?"
  }'
```

#### GET /api/journal (Get Entries)
```bash
# Free user (only current week)
curl -X GET http://localhost:5000/api/journal \
  -H "Authorization: Bearer <token>"

# Premium user with filters
curl -X GET "http://localhost:5000/api/journal?startDate=2024-01-01&endDate=2024-12-31&prompt=gratitude" \
  -H "Authorization: Bearer <token>"
```

#### GET /api/journal/export (Export Data - Premium Only)
```bash
curl -X GET http://localhost:5000/api/journal/export \
  -H "Authorization: Bearer <token>"
```

#### GET /api/journal/prompt (Get Answers for Prompt - Premium Only)
```bash
curl -X GET "http://localhost:5000/api/journal/prompt?prompt=What%20is%20one%20thing" \
  -H "Authorization: Bearer <token>"
```

## Frontend Feature Testing

### Export Data Flow
1. Login as premium user
2. Navigate to Dashboard
3. Click "Export Data" button (when added)
4. JSON file should download automatically
5. Verify file contains all entries and statistics

### Analytics Comparison

**Free User View:**
- Only sees current week entries
- Limited chart data (7 days max)
- No export capability
- No date/prompt filters

**Premium User View:**
- Sees all historical entries
- Full analytics on all data
- Can export complete data
- Date and prompt filters available

## Deployment Checklist

- [ ] Environment variables configured (.env file)
- [ ] Database connection verified
- [ ] JWT_SECRET set and secure
- [ ] CORS properly configured
- [ ] API endpoints respond correctly
- [ ] Frontend builds without errors
- [ ] Database indexes created for performance
- [ ] Error handling implemented
- [ ] Security headers set
- [ ] Premium flag migrations complete

## Known Limitations

1. Encryption/decryption happens on server (consider client-side for enhanced privacy)
2. Export includes plaintext decrypted content (encrypted backup recommended)
3. No audit logging for export events (consider adding for compliance)
4. Date filtering uses server timezone (consider UTC standardization)

## Performance Considerations

- Database queries use indexes on userId and date
- Large exports (10k+ entries) may take time
- Consider pagination for very large datasets
- Chart rendering optimized for 100+ data points

