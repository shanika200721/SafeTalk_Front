import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import context
import { AuthProvider, useAuth } from './context/AuthContext';

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
import BreathingExercise from './pages/BreathingExercise';
import DashboardOverview from './pages/counselor/DashboardOverview';
import CounselorDashboard from './pages/counselor/CounselorDashboard';
import ViewStudentProfile from './pages/counselor/ViewStudentProfile';
import AllStudentsView from './pages/counselor/AllStudentsView';
import EnhancedStudentProfileView from './pages/counselor/EnhancedStudentProfileView';
import StudentDetailView from './pages/counselor/StudentDetailView';
import SessionManagement from './pages/counselor/SessionManagement';
import DebugPage from './pages/DebugPage';
import TermsOfService from './pages/TermsOfService';
import Resources from './pages/Resources';
import Settings from './pages/Settings';

// Error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', fontSize: '18px' }}>
          <h3>Error Loading Application</h3>
          <p>{this.state.error?.toString()}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Counselor Route component
const CounselorRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role !== 'counselor') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Routes container
function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterSelection />} />
      <Route path="/register/student" element={<StudentRegister />} />
      <Route path="/register/psychiatric" element={<PsychiatricRegister />} />
      <Route path="/debug" element={<DebugPage />} />
      <Route path="/test" element={
        <div style={{ padding: '40px', fontSize: '24px', textAlign: 'center' }}>
          <h1>TEST PAGE</h1>
          <p>✅ If you see this, React is working!</p>
        </div>
      } />

      {/* Student Routes (Protected) */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard-new" element={<ProtectedRoute><DashboardNew /></ProtectedRoute>} />
      <Route path="/profile-assessment" element={<ProtectedRoute><ProfileAssessment /></ProtectedRoute>} />
      <Route path="/dass21" element={<ProtectedRoute><DASS21Assessment /></ProtectedRoute>} />
      <Route path="/dass21-assessment" element={<ProtectedRoute><DASS21Assessment /></ProtectedRoute>} />
      <Route path="/daily-checkin" element={<ProtectedRoute><DailyCheckin /></ProtectedRoute>} />
      <Route path="/checkin-history" element={<ProtectedRoute><CheckinRecords /></ProtectedRoute>} />
      <Route path="/checkin-records" element={<ProtectedRoute><CheckinRecords /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><ChatSelector /></ProtectedRoute>} />
      <Route path="/chat-support" element={<ProtectedRoute><ChatSupport /></ProtectedRoute>} />
      <Route path="/chat-with-counselor" element={<ProtectedRoute><ChatSupport /></ProtectedRoute>} />
      <Route path="/safetalk-bot" element={<ProtectedRoute><SafeTalkBot /></ProtectedRoute>} />
      <Route path="/chat-interface" element={<ProtectedRoute><ChatInterface /></ProtectedRoute>} />
      <Route path="/breathing-exercise" element={<ProtectedRoute><BreathingExercise /></ProtectedRoute>} />
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

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Main App Component
function App() {
  console.log('🎯 App component mounting');
  
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