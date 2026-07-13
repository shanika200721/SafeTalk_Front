# COUNSELOR DASHBOARD - IMPLEMENTATION GUIDE

## 📋 STEP-BY-STEP EXPLANATION

### What We Created:

#### 1. **counselorService.js** (`frontend/src/services/counselorService.js`)
   - **Purpose:** API communication layer between frontend and backend
   - **How it works:** 
     - Wraps all backend API calls
     - Handles errors and logging
     - Converts API responses to usable data
   - **Database Connection:** Connects to 6 backend endpoints:
     - `/api/counselor/alerts` - Fetch high-risk alerts
     - `/api/counselor/high-risk-users` - Fetch at-risk students
     - `/api/counselor/student/{id}/dashboard` - Student details
     - `/api/counselor/analytics/summary` - Dashboard metrics
     - `/api/counselor/sessions` - Create/manage sessions
     - etc.

#### 2. **DashboardOverview.jsx** (`frontend/src/pages/counselor/DashboardOverview.jsx`)
   - **Screen Components:**
     - Header with counselor greeting
     - 4 Metric Cards (Total Students, At-Risk, Sessions, Completed)
     - Recent Alerts Table (10 latest)
     - High-Risk Students Table with action buttons
     - Session Creation Dialog
   
   - **Data Flow:**
     ```
     Component Mounts
           ↓
     useEffect Hook Triggers
           ↓
     fetchDashboardData() called
           ↓
     Calls 3 services in parallel:
     - getAnalyticsSummary() → Analytics data
     - getAlerts() → Recent alerts
     - getHighRiskUsers() → At-risk students
           ↓
     Data displayed in tables
           ↓
     Auto-refresh every 5 minutes
     ```

   - **Database Tables Used:**
     - `User` - Counselor and student info
     - `Alert` - High-risk alerts
     - `CounselorSession` - Session tracking
     - `Assessment` - Risk assessment data
     - `DailyCheckIn` - Student check-in data

   - **Key Features:**
     - Real-time data from database
     - Click buttons to view student details
     - Create new sessions directly
     - Mark alerts as read
     - Auto-refresh functionality

---

## 🚀 HOW TO TEST & RUN

### Step 1: Ensure Backend is Running
```powershell
# In PowerShell, make sure backend is running from previous steps
# You should see: "INFO: Uvicorn running on http://0.0.0.0:8000"
```

### Step 2: Start Frontend (New Terminal)
```powershell
# Open a NEW PowerShell terminal
cd "C:\Users\CMSDEV04\Documents\research\suicide-prevention-agent\frontend"

# Install dependencies (if not done)
npm install

# Start frontend development server
npm run dev

# You'll see: "VITE v5.x.x ready in xxx ms"
# Frontend runs on: http://localhost:5173 or http://localhost:3000
```

### Step 3: Test the Dashboard
1. **Open browser:** `http://localhost:5173`
2. **Login as Counselor:**
   - Email: `counselor@example.com`
   - Password: (check TESTING_CREDENTIALS.md in backend folder)
3. **Navigate to:** Counselor Dashboard
4. **You should see:**
   - ✅ Welcome message with your name
   - ✅ 4 metric cards with real data
   - ✅ Recent alerts table
   - ✅ High-risk students table
   - ✅ Refresh button works
   - ✅ Auto-refresh every 5 minutes

### Step 4: Test Interactions
- **Click "View" on an alert** → Should navigate to student dashboard
- **Click "View Dashboard" on a student** → Should navigate to student profile
- **Click "Start Session"** → Should open dialog
  - Fill in notes
  - Click "Create Session"
  - Should navigate to session details
  - Check database: New session created in `counselor_sessions` table

---

## 🔗 DATABASE CONNECTIONS EXPLAINED

### How Data Flows from Database to Dashboard:

```
1. DATABASE LAYER (Backend)
   ├─ Users table: stores counselor and student info
   ├─ Alerts table: high-risk alerts
   ├─ Assessments table: risk scores
   ├─ CounselorSessions table: session records
   └─ DailyCheckIn table: student check-in data

2. API LAYER (Backend)
   ├─ GET /api/counselor/analytics/summary
   │  └─ Queries: Users, CounselorSessions
   │  └─ Returns: { total_students, at_risk_count, sessions_count, ... }
   │
   ├─ GET /api/counselor/alerts
   │  └─ Queries: Alerts table
   │  └─ Returns: [{ id, alert_type, risk_level, student_name, ... }, ...]
   │
   └─ GET /api/counselor/high-risk-users
      └─ Queries: Users + Assessments
      └─ Returns: [{ id, name, current_risk_level, ... }, ...]

3. SERVICE LAYER (Frontend)
   ├─ counselorService.getAnalyticsSummary()
   ├─ counselorService.getAlerts()
   └─ counselorService.getHighRiskUsers()
      ↓ (Makes HTTP requests to backend)

4. COMPONENT LAYER (Frontend)
   └─ DashboardOverview renders received data in UI
      └─ Cards, Tables, Dialogs display live database data
```

### Example: Creating a Session

**User Action:** Click "Start Session" → Fill notes → Click "Create Session"

**Database Chain:**
```
Frontend Form
    ↓ (serializes data)
counselorService.createSession()
    ↓ (POST request to backend with: user_id, session_type, risk_level, notes)
Backend: POST /api/counselor/sessions
    ↓ (validates data)
Database INSERT into CounselorSessions table
    ↓
Backend returns: { id, user_id, status: 'pending', created_at, ... }
    ↓
Frontend receives response
    ↓
refreshes dashboard data
    ↓
User navigated to /counselor/sessions/{id}
```

---

## 📁 FILES CREATED/MODIFIED

### New Files:
1. ✅ `frontend/src/services/counselorService.js` - API service
2. ✅ `frontend/src/pages/counselor/DashboardOverview.jsx` - Dashboard component

### Files to Update (NEXT):
1. `frontend/src/pages/CounselorView.jsx` - Import and use DashboardOverview
2. `frontend/src/App.jsx` - Update routing if needed

---

## ⚙️ BACKEND ENDPOINTS BEING USED

| Endpoint | Method | Purpose | Database Tables |
|----------|--------|---------|-----------------|
| `/api/counselor/analytics/summary` | GET | Get dashboard metrics | Users, CounselorSessions |
| `/api/counselor/alerts` | GET | Get high-risk alerts | Alerts |
| `/api/counselor/high-risk-users` | GET | Get risky students | Users, Assessments |
| `/api/counselor/sessions` | POST | Create new session | CounselorSessions |
| `/api/counselor/sessions/{id}` | PUT | Update session | CounselorSessions |
| `/api/counselor/alerts/{id}/read` | PUT | Mark alert as read | Alerts |

---

## 🔍 TESTING CHECKLIST

- [ ] Backend running on :8000
- [ ] Frontend running on :5173
- [ ] Can login as counselor
- [ ] Dashboard loads with data
- [ ] Metric cards show numbers > 0
- [ ] Alerts table loads
- [ ] High-risk students table loads
- [ ] Refresh button works
- [ ] Can click view on alert
- [ ] Can click start session
- [ ] Session dialog opens
- [ ] Can create session
- [ ] New session shows in database

---

## 🐛 TROUBLESHOOTING

### Dashboard shows "Loading..." forever
- [ ] Check backend is running: `http://localhost:8000/api/docs`
- [ ] Check browser console for errors: F12 → Console tab
- [ ] Check network tab: F12 → Network tab → Look for API calls

### "Failed to load dashboard data" error
- [ ] Backend API might be down
- [ ] Authentication token expired → logout and login again
- [ ] CORS issue → check backend ALLOWED_ORIGINS setting

### Metric cards show 0 values
- [ ] Database might be empty or not connected
- [ ] Run sample data generation script
- [ ] Check database tables have records:
  ```sql
  SELECT COUNT(*) FROM users;
  SELECT COUNT(*) FROM counselor_sessions;
  SELECT COUNT(*) FROM alerts;
  ```

### Start Session button doesn't work
- [ ] Check browser console for errors
- [ ] Verify backend endpoint is working
- [ ] Check user has counselor role in database

---

## Next Steps in Your Project:

1. ✅ **COMPONENT 1: Dashboard Overview** - COMPLETE
2. 🔄 **COMPONENT 2: Student Detail View** - Shows full student profile
3. 🔄 **COMPONENT 3: Session Management** - Create/edit/close sessions
4. 🔄 **COMPONENT 4: Alerts Manager** - Fine-grained alert control
5. 🔄 **COMPONENT 5: Analytics Dashboard** - Charts and trends

Ready to build Component 2? Reply and I'll create the Student Detail view!
