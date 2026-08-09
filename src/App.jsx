import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import context
import { AuthProvider, useAuth } from './context/AuthContext';
import useBehavioralTelemetry from './hooks/useBehavioralTelemetry';

// Import pages
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import RegisterSelection from './pages/RegisterSelection';
import StudentRegister from './pages/StudentRegister';
import PsychiatricRegister from './pages/PsychiatricRegister';
import Dashboard from './pages/Dashboard';
import DashboardNew from './pages/Dashboard-NEW';
import ProfileAssessment from './pages/ProfileAssessment';
import DASS21Assessment from './pages/DASS21Assessment';
import DailyCheckin from './pages/DailyCheckin';
import CheckinRecords from './pages/CheckinRecords';
import ChatInterface from './pages/ChatInterface';
import ChatSupport from './pages/ChatSupport';
import ChatSelector from './pages/ChatSelector';
import CounselorChat from './pages/CounselorChat';
import SafeTalkBot from './pages/SafeTalkBot';
import WellnessHub from './pages/WellnessHub';
import Meditation from './pages/Meditation';
import BreathingCenter from './pages/BreathingCenter';
import AmbientSounds from './pages/AmbientSounds';
import Journal from './pages/Journal';
import VideoLibrary from './pages/VideoLibrary';
import Progress from './pages/Progress';
import Preferences from './pages/Preferences';
import MindfulnessActivities from './pages/MindfulnessActivities';
import DashboardOverview from './pages/counselor/DashboardOverview';
import CounselorDashboard from './pages/counselor/CounselorDashboard';
import ViewStudentProfile from './pages/counselor/ViewStudentProfile';
import AllStudentsView from './pages/counselor/AllStudentsView';
import EnhancedStudentProfileView from './pages/counselor/EnhancedStudentProfileView';
import StudentDetailView from './pages/counselor/StudentDetailView';
import SessionManagement from './pages/counselor/SessionManagement';
import TermsOfService from './pages/TermsOfService';
import Resources from './pages/Resources';
import Settings from './pages/Settings';
import AdminPortal from './pages/admin/AdminPortal';
import FacialAnalysis from './pages/FacialAnalysis';
import STUDENT_ROUTES from './routes/studentRoutes';

const COUNSELOR_ROLES = new Set(['counselor', 'psychiatrist']);

const LoadingScreen = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <p>Loading...</p>
  </div>
);

// Error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch() {}

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: '#b42318', fontSize: '18px' }}>
          <h3>Application temporarily unavailable</h3>
          <p>Please refresh the page or sign in again.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isStudent, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isStudent) {
    return (
      <div style={{ padding: '20px', color: '#7f1d1d', fontSize: '18px' }}>
        <h3>Unauthorized</h3>
        <p>You do not have permission to use the student portal.</p>
      </div>
    );
  }
  
  return children;
};

// Counselor Route component
const CounselorRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (!COUNSELOR_ROLES.has(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to={COUNSELOR_ROLES.has(user?.role) ? '/counselor' : '/dashboard'} replace />;
  }

  return children;
};

// Routes container
function AppRoutes() {
  useBehavioralTelemetry();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterSelection />} />
      <Route path="/register/student" element={<StudentRegister />} />
      <Route path="/register/psychiatric" element={<PsychiatricRegister />} />

      {/* Student Routes (Protected) */}
      <Route path={STUDENT_ROUTES.DASHBOARD} element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard-new" element={<ProtectedRoute><DashboardNew /></ProtectedRoute>} />
      <Route path={STUDENT_ROUTES.PROFILE_ASSESSMENT} element={<ProtectedRoute><ProfileAssessment /></ProtectedRoute>} />
      <Route path={STUDENT_ROUTES.FACIAL_ANALYSIS} element={<ProtectedRoute><FacialAnalysis /></ProtectedRoute>} />
      <Route path="/dass21" element={<ProtectedRoute><DASS21Assessment /></ProtectedRoute>} />
      <Route path="/dass21-assessment" element={<ProtectedRoute><DASS21Assessment /></ProtectedRoute>} />
      <Route path="/daily-checkin" element={<ProtectedRoute><DailyCheckin /></ProtectedRoute>} />
      <Route path="/checkin-history" element={<ProtectedRoute><CheckinRecords /></ProtectedRoute>} />
      <Route path="/checkin-records" element={<ProtectedRoute><CheckinRecords /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><ChatSelector /></ProtectedRoute>} />
      <Route path="/chat-support" element={<ProtectedRoute><ChatSelector /></ProtectedRoute>} />
      <Route path="/chat-with-counselor" element={<ProtectedRoute><ChatSupport /></ProtectedRoute>} />
      <Route path="/safetalk-bot" element={<ProtectedRoute><SafeTalkBot /></ProtectedRoute>} />
      <Route path="/chat-interface" element={<ProtectedRoute><ChatInterface /></ProtectedRoute>} />
      <Route path="/wellness" element={<ProtectedRoute><WellnessHub /></ProtectedRoute>} />
      <Route path="/wellness-hub" element={<ProtectedRoute><WellnessHub /></ProtectedRoute>} />
      <Route path="/meditation" element={<ProtectedRoute><Meditation /></ProtectedRoute>} />
      <Route path="/breathing" element={<ProtectedRoute><BreathingCenter /></ProtectedRoute>} />
      <Route path="/breathing-center" element={<ProtectedRoute><BreathingCenter /></ProtectedRoute>} />
      <Route path="/breathing-exercise" element={<ProtectedRoute><BreathingCenter /></ProtectedRoute>} />
      <Route path="/ambient-sounds" element={<ProtectedRoute><AmbientSounds /></ProtectedRoute>} />
      <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
      <Route path="/video-library" element={<ProtectedRoute><VideoLibrary /></ProtectedRoute>} />
      <Route path="/mindfulness-activities" element={<ProtectedRoute><MindfulnessActivities /></ProtectedRoute>} />
      <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
      <Route path="/preferences" element={<ProtectedRoute><Preferences /></ProtectedRoute>} />
      <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/terms" element={<ProtectedRoute><TermsOfService /></ProtectedRoute>} />

      {/* Counselor Routes */}
      <Route path="/counselor" element={<CounselorRoute><CounselorDashboard /></CounselorRoute>} />
      <Route path="/counselor/dashboard" element={<CounselorRoute><CounselorDashboard /></CounselorRoute>} />
      <Route path="/counselor/students" element={<CounselorRoute><AllStudentsView /></CounselorRoute>} />
      <Route path="/counselor/student/:userId/profile" element={<CounselorRoute><EnhancedStudentProfileView /></CounselorRoute>} />
      <Route path="/counselor/student/:userId/profile-old" element={<CounselorRoute><ViewStudentProfile /></CounselorRoute>} />
      <Route path="/counselor/student/:userId" element={<CounselorRoute><StudentDetailView /></CounselorRoute>} />
      <Route path="/counselor/chat" element={<CounselorRoute><CounselorChat /></CounselorRoute>} />
      <Route path="/counselor/sessions" element={<CounselorRoute><SessionManagement /></CounselorRoute>} />
      <Route path="/counselor/session/:sessionId" element={<CounselorRoute><SessionManagement /></CounselorRoute>} />
      <Route path="/counselor/sessions/user/:userId" element={<CounselorRoute><SessionManagement /></CounselorRoute>} />

      {/* Administration Routes */}
      <Route path="/admin" element={<AdminRoute><AdminPortal /></AdminRoute>} />
      <Route path="/admin/dashboard" element={<AdminRoute><AdminPortal /></AdminRoute>} />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Main App Component
function App() {
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
