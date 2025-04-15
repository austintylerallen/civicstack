import { useEffect, useState } from "react";
import api from "../utils/axios";

export default function Recruitment() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    jobId: "",
    resume: null,
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/public/jobs")
      .then((res) => setJobs(res.data))
      .catch((err) => console.error("Failed to load jobs", err));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "resume") {
      setForm({ ...form, resume: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.jobId || !form.resume) return;

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("jobId", form.jobId);
    formData.append("resume", form.resume);

    try {
      setLoading(true);
      await api.post("/public/recruitment", formData);
      setSuccess(true);
      setForm({ name: "", email: "", jobId: "", resume: null });
    } catch (err) {
      console.error("Application failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#121620] text-white p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-[#cca050]">Careers at CivicStack</h1>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">Open Positions</h2>
        <ul className="space-y-4">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <li key={job._id} className="bg-[#1f2e3d] p-4 rounded">
                <h3 className="text-xl font-bold text-[#cca050]">{job.title}</h3>
                <p className="text-gray-300">{job.description}</p>
              </li>
            ))
          ) : (
            <p className="text-gray-400">No job openings posted yet.</p>
          )}
        </ul>
      </section>

      <section className="bg-[#1f2e3d] p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4 text-[#cca050]">Submit Your Application</h2>
        {success && (
          <div className="text-green-400 mb-4">✅ Your application has been submitted!</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full bg-[#15202e] text-white px-4 py-2 rounded"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="w-full bg-[#15202e] text-white px-4 py-2 rounded"
            required
          />
          <select
            name="jobId"
            value={form.jobId}
            onChange={handleChange}
            className="w-full bg-[#15202e] text-white px-4 py-2 rounded"
            required
          >
            <option value="">Select a Job</option>
            {jobs.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title}
              </option>
            ))}
          </select>
          <input
            type="file"
            name="resume"
            onChange={handleChange}
            className="text-sm text-gray-300 file:bg-[#cca050] file:text-black file:rounded file:px-4 file:py-2"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#cca050] text-black px-6 py-2 font-semibold rounded hover:opacity-90"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </section>
    </main>
  );
}
