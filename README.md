# SafeTalk Frontend

Frontend web application for **SafeTalk — Multimodal AI Agent for Suicide Prevention in Sri Lankan Undergraduates**.

The application provides dedicated interfaces for students and mental-health professionals. Students can complete assessments, record daily mood information, access supportive activities, communicate with the SafeTalk assistant, and submit optional speech or facial inputs. Authorized counselors can review alerts, risk summaries, and longitudinal wellness information through a separate dashboard.

SafeTalk is a supportive early-warning platform and **does not replace professional mental-health care, clinical diagnosis, or emergency services**.

## Main Features

### Student Experience

- Secure registration and login
- Student profile and baseline assessment
- DASS-21 assessment workflow
- Daily mood check-ins and previous-record viewing
- SafeTalk conversational-support interface
- Text-based emotional-risk analysis
- Optional voice-analysis workflow
- Optional facial-emotion analysis
- Breathing and grounding exercises
- Mental-health resources and safety information
- Personal settings, consent, and privacy controls

### Counselor Experience

- Separate counselor authentication and dashboard
- High-risk and severe-risk alert review
- Student risk summaries
- Modality-level evidence and available explanations
- Mood and assessment trend visualization
- Counselor notes and follow-up workflow
- Human oversight of AI-generated risk indicators

## Technology Stack

- **Frontend Library:** React.js
- **Routing:** React Router
- **HTTP Client:** Axios or the repository's configured API client
- **Data Visualization:** Chart.js or the configured chart library
- **Browser Media APIs:** Webcam and MediaRecorder APIs
- **Styling:** Repository-specific CSS/component styling
- **Backend Integration:** FastAPI REST API

## Application Areas

The implemented interface includes pages and workflows such as:

```text
Welcome
Login
Registration and role selection
Student registration
Counselor registration
Student dashboard
Profile assessment
DASS-21 assessment
Daily check-in
Check-in records
Chat selection
SafeTalk support chat
Breathing exercise
Voice analysis
Facial analysis
Resources
Settings
Terms of service
Counselor dashboard and alerts
```

## Project Structure

```text
frontend/
├── public/                   # Static public files
├── src/
│   ├── assets/               # Images, icons, and local media
│   ├── components/           # Reusable interface components
│   ├── contexts/             # Authentication and shared state
│   ├── hooks/                # Custom React hooks
│   ├── pages/                # Student and counselor pages
│   ├── services/             # Backend API integration
│   ├── styles/               # Global and component styles
│   ├── utils/                # Validation and shared utilities
│   ├── App.jsx               # Main route/application component
│   └── main.jsx              # Application entry point
├── .env.example
├── package.json
└── README.md
```

> The exact folder names may differ slightly depending on the current repository version.

## Local Setup

### Prerequisites

- Node.js 18 or later
- npm
- Running SafeTalk backend API

### 1. Clone the repository

```bash
git clone <FRONTEND_REPOSITORY_URL>
cd <FRONTEND_REPOSITORY_FOLDER>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file from `.env.example`.

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Do not commit production credentials or sensitive configuration values.

### 4. Start the development server

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

### 5. Create a production build

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Backend Connection

The frontend expects the backend API base URL through an environment variable. A typical API client configuration is:

```javascript
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
```

Authentication tokens should be handled using the repository's secure authentication strategy. Avoid exposing tokens in logs, URLs, or source-controlled files.

## User Flow

```text
Registration / Login
        ↓
Consent and Profile Setup
        ↓
Assessment and Daily Monitoring
        ↓
Optional Text, Voice, or Facial Analysis
        ↓
Risk-Aware Support and Resources
        ↓
Counselor Review When Escalation Is Required
```

## Privacy and Accessibility Expectations

Because the application processes sensitive mental-health and biometric-related inputs, the interface should provide:

- Clear consent before microphone or camera access
- Visible recording and processing states
- Permission-denied and unsupported-browser handling
- Options to skip optional modalities
- Plain-language explanations of AI-generated results
- Emergency and professional-support information
- Accessible forms, labels, keyboard navigation, and responsive layouts
- No alarming or diagnostic wording based only on automated predictions

## Testing

Use the test scripts configured in `package.json`. Common commands are:

```bash
npm run test
npm run lint
npm run build
```

Before deployment, verify the complete student and counselor journeys, including authentication, validation, media permissions, assessment submission, API failures, risk display, and alert workflows.

## Deployment Notes

- Configure the production backend URL through environment variables.
- Permit the frontend origin in the backend CORS configuration.
- Serve the application over HTTPS, especially when using camera or microphone features.
- Do not enable public access to internal counselor routes.
- Avoid storing raw mental-health, audio, or facial data in browser storage unless explicitly required and securely designed.

## Current Research Scope

The application was developed as part of an undergraduate research project exploring multimodal AI-assisted suicide-prevention support for Sri Lankan university students. It should be deployed only with appropriate institutional review, security controls, professional oversight, and crisis-response procedures.


## Author

**M.A.S. Sewwandi**  
BSc (Hons) Computer Science  
Faculty of Computing and Technology, University of Kelaniya
