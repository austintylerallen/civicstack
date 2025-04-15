import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useLenisScroll from "./hooks/useLenisScroll"; // ✅ Import Lenis hook

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import IssueTracker from "./pages/IssueTracker";
import AuditLogPanel from "./pages/AuditLogPanel";
import SubmitIssue from "./pages/SubmitIssue";
import LandingPage from "./pages/LandingPage";
import WorkOrders from "./pages/WorkOrders";
import FormRequests from "./pages/FormRequests";
import InternalCommsHub from "./pages/InternalCommsHub";
import DevelopmentProjects from "./pages/DevelopmentProjects";
import Careers from "./pages/Careers";
import Settings from "./pages/Settings";
import ProtectedRoute from "./routes/ProtectedRoute";

import "./index.css";

export default function App() {
  useLenisScroll(); // ✅ Enable global smooth scroll

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
      <Router>
        <Routes>
          {/* 🌐 Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/submit-issue" element={<SubmitIssue />} />
          <Route path="/careers" element={<Careers />} />

          {/* 🔐 Protected Pages */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/issues"
            element={
              <ProtectedRoute>
                <IssueTracker />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute>
                <AuditLogPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workorders"
            element={
              <ProtectedRoute>
                <WorkOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/form-requests"
            element={
              <ProtectedRoute>
                <FormRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/communications"
            element={
              <ProtectedRoute>
                <InternalCommsHub />
              </ProtectedRoute>
            }
          />
          <Route
            path="/development-projects"
            element={
              <ProtectedRoute>
                <DevelopmentProjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </>
  );
}
