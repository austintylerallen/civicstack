import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5173/api/auth/login", form);
      const { user, token } = res.data;

      login({ user, token }); // store user and token in context + localStorage
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Login failed", err);
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#121620] text-white">
      <div className="bg-[#15202e] p-6 rounded-lg shadow-xl text-center w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-4">CivicStack Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-[#1c2a3a] text-white"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-[#1c2a3a] text-white"
            required
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="bg-yellow-500 text-black px-4 py-2 rounded hover:opacity-90 transition w-full"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
