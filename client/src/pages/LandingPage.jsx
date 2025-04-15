import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#121620] text-white flex flex-col justify-center items-center px-6 text-center">
      <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-[#cca050]">
        Welcome to CivicStack
      </h1>
      <p className="text-lg text-gray-300 max-w-2xl mb-8">
        CivicStack helps Las Cruces residents report local issues directly to city staff. 
        Your input improves the city and ensures transparency and action.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/submit-issue"
          className="bg-[#cca050] text-black px-6 py-3 rounded font-semibold hover:opacity-90 transition"
        >
          📬 Report an Issue
        </Link>
        <Link
          to="/login"
          className="bg-[#1f2e3d] text-white border border-[#cca050] px-6 py-3 rounded font-semibold hover:bg-[#2b3c4e] transition"
        >
          🔐 Staff Login
        </Link>
      </div>
    </main>
  );
}
