import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`block px-4 py-2 rounded ${
        pathname === to ? "bg-yellow-500 text-black" : "hover:bg-[#1f2a3c]"
      }`}
    >
      {label}
    </Link>
  );

  const handleLogout = () => {
    logout(); // Clear token, user, etc.
    navigate("/login");
  };

  return (
    <aside className="w-64 h-screen bg-[#15202e] text-white p-4 fixed top-0 left-0 flex flex-col justify-between">
      <div>
        <h1 className="text-2xl font-bold mb-6">CivicStack</h1>
        <nav className="space-y-2">
          {navLink("/dashboard", "Dashboard")}
          {navLink("/issues", "Issue Tracker")}
          {navLink("/workorders", "Work Orders")}
          {navLink("/form-requests", "Form Requests")}
          {navLink("/communications", "Internal Comms Hub")}
          {navLink("/development-projects", "Dev Projects")}
          {navLink("/audit-logs", "Audit Logs")}
          {navLink("/settings", "Settings")}
          {navLink("/careers", "🌐 Careers Portal")}
          <hr className="my-4 border-[#1f2a3c]" />
          {navLink("/submit-issue", "📬 Submit an Issue")}
        </nav>
      </div>

      <div className="space-y-2 text-sm">
        <button
          onClick={() => window.dispatchEvent(new Event("openFeedbackModal"))}
          className="block px-3 py-2 rounded text-gray-400 hover:text-white hover:bg-[#1f2a3c] w-full text-left"
        >
          💬 Feedback
        </button>
        <button
          onClick={handleLogout}
          className="block px-3 py-2 rounded text-red-400 hover:text-white hover:bg-[#1f2a3c] w-full text-left"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
