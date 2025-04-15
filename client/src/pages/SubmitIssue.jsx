import { useState } from "react";
import api from "../utils/axios";
import { useNavigate } from "react-router-dom";

export default function SubmitIssue() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    title: "",
    description: "",
    department: "",
    priority: "Low",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/public/issues", form);
      setSubmitted(true);
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      console.error("Failed to submit issue:", err);
      alert("Submission failed. Try again.");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#121620] text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Thank you!</h2>
          <p>Your issue was submitted and will be reviewed by staff.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121620] text-white p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Submit an Issue</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="name" placeholder="Your Name" required className="w-full bg-[#1c2a3a] px-4 py-2 rounded text-white" onChange={handleChange} />
        <input type="email" name="email" placeholder="Your Email" required className="w-full bg-[#1c2a3a] px-4 py-2 rounded text-white" onChange={handleChange} />
        <input type="text" name="title" placeholder="Issue Title" required className="w-full bg-[#1c2a3a] px-4 py-2 rounded text-white" onChange={handleChange} />
        <textarea name="description" placeholder="Describe the issue..." rows="4" className="w-full bg-[#1c2a3a] px-4 py-2 rounded text-white" onChange={handleChange}></textarea>
        <select name="department" required className="w-full bg-[#1c2a3a] px-4 py-2 rounded text-white" onChange={handleChange}>
          <option value="">Select Department</option>
          <option value="Public Works">Public Works</option>
          <option value="Parks & Rec">Parks & Rec</option>
          <option value="Utilities">Utilities</option>
        </select>
        <select name="priority" className="w-full bg-[#1c2a3a] px-4 py-2 rounded text-white" onChange={handleChange}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <button type="submit" className="bg-[#cca050] text-black font-bold px-6 py-2 rounded hover:opacity-90">Submit</button>
      </form>
    </div>
  );
}
