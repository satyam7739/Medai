
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { Onboarding } from './pages/Onboarding';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { AddMedicine } from './pages/AddMedicine';
import { PillRecognition } from './pages/PillRecognition';
import { Chatbot } from './pages/Chatbot';
import { Profile } from './pages/Profile';
import { SOS } from './pages/SOS';
import { PharmacyLocator } from './pages/PharmacyLocator';
import { HealthReports } from './pages/HealthReports'; 
import { BarcodeScanner } from './pages/BarcodeScanner';
import { Insights } from './pages/Insights';
import { Medicines } from './pages/Medicines';
import { AutoRefill } from './pages/AutoRefill';
import { MedicalReportsHistory } from './pages/MedicalReportsHistory';
import { About } from './pages/About';

// Wrapper to protect routes
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isAuthenticated } = useApp();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!user.onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return children;
};

const AppContent: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/medicines" element={<ProtectedRoute><Medicines /></ProtectedRoute>} />
          <Route path="/add-medicine" element={<ProtectedRoute><AddMedicine /></ProtectedRoute>} />
          <Route path="/scan-pill" element={<ProtectedRoute><PillRecognition /></ProtectedRoute>} />
          <Route path="/barcode-scan" element={<ProtectedRoute><BarcodeScanner /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/sos" element={<ProtectedRoute><SOS /></ProtectedRoute>} />
          <Route path="/pharmacy" element={<ProtectedRoute><PharmacyLocator /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><HealthReports /></ProtectedRoute>} />
          <Route path="/medical-reports-history" element={<ProtectedRoute><MedicalReportsHistory /></ProtectedRoute>} />
          <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
          <Route path="/auto-refill" element={<ProtectedRoute><AutoRefill /></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
