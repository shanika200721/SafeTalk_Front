# COMPONENT 3: SESSION MANAGEMENT - COMPLETE GUIDE

## 📋 **WHAT IS THIS COMPONENT?**

The **Session Management** component allows counselors to:
- ✅ Create new counselor sessions with students
- ✅ Edit session notes and interventions during/after session
- ✅ Record session outcomes
- ✅ Schedule follow-up appointments
- ✅ Track session status (pending → in_progress → completed)
- ✅ View complete session history for any student
- ✅ Change intervention types as needed

---

## 🎯 **COMPONENT DETAILS**

### **File Created:**
📄 `frontend/src/pages/counselor/SessionManagement.jsx`

### **Size & Complexity:**
- ~600 lines of code
- 3 views: Single session detail, Student sessions list
- 4 Tab panels with different functions
- Dynamic form editing
- Real-time database updates

---

## 🗄️ **DATABASE CONNECTIONS - DETAILED EXPLANATION**

### **Three API Endpoints Used:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/counselor/sessions` | POST | Create new session |
| `/api/counselor/sessions/{id}` | GET, PUT | Get/Update specific session |
| `/api/counselor/sessions/user/{user_id}` | GET | Get all sessions for a student |

### **Database Table: `CounselorSession`**

```sql
CREATE TABLE counselor_sessions (
    id INT PRIMARY KEY,
    user_id INT,                    -- Student ID
    counselor_id INT,               -- Counselor ID
    session_type VARCHAR,           -- 'scheduled', 'auto_escalated', 'emergency'
    risk_level_at_escalation VARCHAR, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    status VARCHAR,                 -- 'pending', 'in_progress', 'completed'
    
    -- Session Details
    counselor_notes TEXT,           -- Notes from counselor
    intervention_type VARCHAR,      -- Type of intervention used
    outcome VARCHAR,                -- Session outcome
    
    -- Follow-up
    follow_up_needed BOOLEAN,       -- Whether follow-up is needed
    follow_up_date DATETIME,        -- When to follow up
    
    -- Timestamps
    created_at DATETIME,            -- When session was created
    updated_at DATETIME             -- When session was last updated
);
```

### **Data Flow Diagram:**

```
Scenario 1: Create Session
═══════════════════════════════════════════════════════════════
Counselor clicks "Start Session" on StudentDetailView
        ↓
Dialog opens with form
        ↓
Fills: student_id, session_type, risk_level, initial_notes
        ↓
Submits form
        ↓
POST /api/counselor/sessions
   ├─ Validates data
   ├─ Creates row in counselor_sessions table
   └─ Returns: { id, user_id, status: 'pending', created_at, ... }
        ↓
Frontend navigates to: /counselor/session/{new_id}


Scenario 2: Edit Session Details
═══════════════════════════════════════════════════════════════
Counselor views session (GET /api/counselor/session/{id})
        ↓
Clicks "Edit" button
        ↓
Form becomes editable
        ↓
Updates:
   ├─ Counselor notes
   ├─ Intervention type
   ├─ Status
   └─ Outcome & follow-up details
        ↓
Clicks "Save Changes"
        ↓
PUT /api/counselor/sessions/{id}
   ├─ Updates row with new values
   └─ Returns updated session
        ↓
Page refreshes with new data


Scenario 3: View Student's Sessions
═══════════════════════════════════════════════════════════════
Counselor navigates to: /counselor/sessions/user/{student_id}
        ↓
GET /api/counselor/sessions/user/{student_id}
   ├─ Queries: SELECT * FROM counselor_sessions WHERE user_id={id}
   └─ Returns: [{ session1 }, { session2 }, ...]
        ↓
Component displays table of all sessions
        ↓
Counselor can click "View" on any session
```

---

## 📊 **COMPONENT STRUCTURE - 4 TABS EXPLAINED**

### **When Viewing a Single Session:**

#### **TAB 1: OVERVIEW** 📌
Shows basic session information:
- **Session Type:** scheduled, auto_escalated, emergency
- **Status:** Color-coded (Pending/In Progress/Completed)
- **Risk Level:** At time of escalation (LOW/MEDIUM/HIGH/CRITICAL)
- **Created At:** Timestamp when session was created
- **Duration:** How long session has been active (calculated in real-time)
- **Last Updated:** When session data was last modified

**Database:** Reads from `CounselorSession` table

```sql
SELECT session_type, status, risk_level_at_escalation, 
       created_at, updated_at 
FROM counselor_sessions WHERE id = {session_id};
```

---

#### **TAB 2: NOTES & INTERVENTIONS** 📝

**In View Mode:**
- See counselor notes (what counselor wrote during/after session)
- Intervention type already applied
- Session status badge

**In Edit Mode (counselor can edit):**
```javascript
Field 1: Counselor Notes (textarea) - Full text area for observations
Field 2: Intervention Type (select dropdown) - Choose from:
   ├─ Cognitive Behavioral Therapy
   ├─ Motivational Interviewing
   ├─ Crisis Intervention
   ├─ Peer Support
   ├─ Referral to Psychiatrist
   ├─ Medication Review
   ├─ Family Therapy
   └─ Other

Field 3: Session Status (select) - Change to:
   ├─ Pending (not yet started)
   ├─ In Progress (currently happening)
   └─ Completed (finished)

Button: "Save Changes" - Updates database
```

**Database Operations:**
```sql
UPDATE counselor_sessions SET
    counselor_notes = {new_notes},
    intervention_type = {type},
    status = {status}
WHERE id = {session_id};
```

---

#### **TAB 3: OUTCOME & FOLLOW-UP** 📊

**In View Mode:**
- Session outcome (how student responded)
- Follow-up date (if scheduled)

**In Edit Mode (counselor fills after session ends):**
```javascript
Field 1: Session Outcome (select) - Choose from:
   ├─ ✅ Student Improved
   ├─ ➡️ Status Stable
   ├─ ⚠️ Still Concerned
   └─ 🚨 Escalated to Psychiatrist

Field 2: Follow-up Needed (toggle) - Yes/No
   └─ If Yes → Show date picker for follow-up date
   
Field 3: Follow-up Date (date input) - Conditional, shows only if follow-up needed
        └─ Format: YYYY-MM-DD

Button: "Save Outcome & Follow-up" - Updates database
```

**Database Operations:**
```sql
UPDATE counselor_sessions SET
    outcome = {selected_outcome},
    follow_up_needed = {true/false},
    follow_up_date = {date_if_needed}
WHERE id = {session_id};
```

---

#### **TAB 4: SESSION TIMELINE** 📅

Shows chronological events:
1. **Session Created** 🔵 - Timestamp when session started
2. **Last Updated** 🔵 - When notes/outcome were last modified
3. **Session Completed** 🟢 - Only shows if status = 'completed'

**Purpose:** Audit trail showing when actions occurred

---

## 💡 **HOW IT WORKS - STEP BY STEP**

### **Creating a Session:**
```
1. Counselor on StudentDetailView page
2. Clicks "Start Session" button
3. Dialog opens with form:
   - User ID (pre-filled with current student)
   - Session Type (dropdown: scheduled/auto_escalated/emergency)
   - Risk Level (dropdown: LOW/MEDIUM/HIGH/CRITICAL)
   - Initial Notes (textarea for observations)
4. Clicks "Create Session"
5. Frontend validates form
6. Calls: counselorService.createSession({...})
7. Backend executes:
   INSERT INTO counselor_sessions 
   (user_id, counselor_id, session_type, risk_level_at_escalation, 
    counselor_notes, status, created_at)
   VALUES (...)
8. Backend returns new session with ID
9. Frontend navigates to /counselor/session/{new_id}
```

### **Editing a Session:**
```
1. Counselor viewing session detail
2. Clicks "Edit" button
3. Form fields become editable
4. Updates any field:
   - More detailed notes
   - Different intervention type
   - Change status
   - Add outcome & follow-up
5. Clicks "Save Changes"
6. Frontend validates
7. Calls: counselorService.updateSession(sessionId, {updated_data})
8. Backend executes:
   UPDATE counselor_sessions 
   SET counselor_notes=?, intervention_type=?, 
       outcome=?, follow_up_date=?, ...
   WHERE id=?
9. Backend returns updated session
10. Frontend refreshes display
```

### **Ending a Session:**
```
1. Counselor clicks "End Session" button
2. Confirmation dialog appears
3. Counselor confirms
4. Sets status = 'completed'
5. Same update flow as above
6. Button disappears (can't end completed session again)
```

---

## 🧪 **HOW TO TEST THIS COMPONENT**

### **Test 1: Create a Session**
```
Steps:
1. Navigate to: /counselor/student/1 (StudentDetailView)
2. Click blue "Start Session" button
3. Dialog opens with form
4. Fill in:
   - Session type: "scheduled"
   - Risk level: "HIGH"
   - Notes: "Student expressing anxiety about exams"
5. Click "Create Session"
6. ✅ Should navigate to /counselor/session/{id}
7. ✅ Should show session details with 4 tabs
```

### **Test 2: Edit Session Notes**
```
Steps:
1. On session detail page
2. Click "Edit" button
3. ✅ Form fields become editable
4. Add more notes: "Student responded well to CBT techniques"
5. Select intervention: "Cognitive Behavioral Therapy"
6. Click "Save Changes"
7. ✅ "Edit" button reappears
8. ✅ Tab 2 shows updated data
```

### **Test 3: Add Outcome & Follow-up**
```
Steps:
1. Still in edit mode
2. Switch to Tab 3 (Outcome & Follow-up)
3. Select outcome: "Student Improved"
4. Toggle follow-up: "Yes"
5. Select date: 2 weeks from now
6. Click "Save Outcome & Follow-up"
7. ✅ Tab 3 now shows outcome and follow-up date
```

### **Test 4: End Session**
```
Steps:
1. While editing
2. Click "End Session" button
3. Confirm dialog
4. ✅ Status changes to "Completed"
5. ✅ "Edit" and "End Session" buttons disappear
6. ✅ Timeline tab shows "Session Completed"
```

### **Test 5: View All Sessions for Student**
```
Steps:
1. Navigate to: /counselor/sessions/user/1
2. ✅ Shows table of all sessions for user
3. Columns: Date, Type, Status, Intervention, Outcome, Follow-up
4. Click "View" on any session
5. ✅ Navigates to that session detail page
```

### **Test 6: Database Verification**
```
SQL Commands to verify:

-- Check new session was created
SELECT * FROM counselor_sessions 
WHERE user_id = 1 
ORDER BY created_at DESC;

-- Check session updates
SELECT id, status, intervention_type, outcome, follow_up_date
FROM counselor_sessions
WHERE id = 123;

-- Check counselor notes were saved
SELECT counselor_notes FROM counselor_sessions WHERE id = 123;
```

---

## 🔁 **DATABASE QUERIES EXECUTED**

### **When Creating Session:**
```sql
INSERT INTO counselor_sessions 
(user_id, counselor_id, session_type, risk_level_at_escalation, 
 counselor_notes, status, created_at, updated_at)
VALUES (1, 5, 'scheduled', 'HIGH', 'Student anxious about exams', 
        'pending', NOW(), NOW());
```

### **When Updating Session:**
```sql
UPDATE counselor_sessions 
SET status = 'in_progress',
    counselor_notes = 'Applied CBT techniques...',
    intervention_type = 'cognitive_behavioral_therapy',
    updated_at = NOW()
WHERE id = 123;
```

### **When Fetching Session:**
```sql
SELECT * FROM counselor_sessions WHERE id = 123;
```

### **When Fetching Student's Sessions:**
```sql
SELECT * FROM counselor_sessions 
WHERE user_id = 1 
ORDER BY created_at DESC;
```

---

## 📱 **COMPONENT FEATURES SUMMARY**

✅ **3 Views:** Single session, Student sessions list, Create dialog
✅ **4 Tabs:** Overview, Notes, Outcome, Timeline
✅ **Edit Mode:** Click-to-edit capability
✅ **Intervention Types:** 8 different intervention options
✅ **Outcome Tracking:** 4 outcome options
✅ **Follow-up Management:** Auto-schedule follow-ups
✅ **Status Tracking:** 3 status states with color coding
✅ **Timeline View:** Audit trail of changes
✅ **Responsive Design:** Works on all devices

---

## 🔗 **INTEGRATION WITH OTHER COMPONENTS**

### **Connected From:**
- **StudentDetailView** → Click "Start Session" → Opens SessionManagement
- **DashboardOverview** → Click student "Start Session" → Opens SessionManagement

### **Data Flow:**
```
DashboardOverview
    ↓ (click "Start Session")
Session Dialog opens
    ↓ (submit)
CREATE session via API
    ↓
Redirect to /counselor/session/{id}
    ↓
SessionManagement loads
    ↓
Display session details
```

---

## 🐛 **COMMON ISSUES & SOLUTIONS**

### **"Failed to create session" error**
- Check if backend is running
- Verify user_id is valid
- Check JWT token is still valid

### **Edit form doesn't show**
- Click "Edit" button again
- Refresh page if button doesn't appear

### **Follow-up date not saving**
- Make sure "Follow-up Needed" is toggled to "Yes"
- Select a date after today

### **Session not appearing in student history**
- Refresh the page
- Check database has session with correct user_id

---

## 📝 **QUICK REFERENCE**

### **Session Status Flow:**
```
pending → in_progress → completed ✅
  ↑          ↓             ↓
  └─ Can edit ──→ Can edit ──→ Cannot edit
```

### **Intervention Types Available:**
```
1. cognitive_behavioral_therapy
2. motivational_interviewing
3. crisis_intervention
4. peer_support
5. referral_to_psychiatrist
6. medication_review
7. family_therapy
8. other
```

### **Session Outcomes:**
```
1. improved           (✅ Student Improved)
2. stable            (➡️ Status Stable)
3. concerned         (⚠️ Still Concerned)
4. escalated         (🚨 Escalated to Psychiatrist)
```

---

## 📊 **ROUTING**

Add these to use SessionManagement:

```javascript
// View all sessions for a student
/counselor/sessions/user/1

// View specific session
/counselor/session/123

// List all sessions (if needed)
/counselor/sessions
```

---

## 🎯 **NEXT STEPS**

After this component, you can build:

### **Component 4: Analytics Dashboard**
- Charts showing: Risk trends, session frequency, outcomes distribution
- Reports: Student progress over time, counselor caseload

### **Component 5: Alerts Manager**
- Bulk alert management
- Mark multiple alerts as read
- Alert templates
- Notification rules

---

## ✅ **FILES MODIFIED**

| File | Action | Details |
|------|--------|---------|
| `SessionManagement.jsx` | ✅ CREATED | Main component (600 lines, 3 views, 4 tabs) |
| `App.jsx` | ✅ UPDATED | Added 3 routes for sessions |
| `counselorService.js` | Already Used | createSession(), updateSession(), getSessionDetails() |

---
