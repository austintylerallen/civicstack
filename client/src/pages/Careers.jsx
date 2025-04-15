import { useEffect, useState } from "react";
import api from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import UserApplicationModal from "../components/UserApplicationModal";
import AdminApplicantModal from "../components/AdminApplicantModal";
import AdminJobDetailModal from "../components/AdminJobDetailModal";

export default function Careers() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [filters, setFilters] = useState({ department: "", location: "", status: "", search: "" });
  const [selectedJob, setSelectedJob] = useState(null);
  const [viewJobDetails, setViewJobDetails] = useState(null);

  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    department: "",
    location: "",
  });

  useEffect(() => {
    fetchJobs();
    if (user?.role === "admin") fetchApplicants();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get("/careers");
      setJobs(res.data);
    } catch (err) {
      toast.error("Failed to fetch jobs.");
    }
  };

  const fetchApplicants = async () => {
    try {
      const res = await api.get("/careers/applicants");
      setApplicants(res.data);
    } catch (err) {
      toast.error("Failed to load applicants.");
    }
  };

  const handleJobChange = (e) => {
    const { name, value } = e.target;
    setNewJob((prev) => ({ ...prev, [name]: value }));
  };

  const createJob = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/careers", newJob);
      fetchJobs();
      setNewJob({ title: "", description: "", department: "", location: "" });
      toast.success("Job posted!");
    } catch (err) {
      toast.error("Error posting job.");
    }
  };

  const deleteJob = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      await api.delete(`/careers/${id}`);
      fetchJobs();
      toast.success("Job deleted.");
    } catch (err) {
      toast.error("Error deleting job.");
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesDepartment = filters.department ? job.department === filters.department : true;
    const matchesLocation = filters.location ? job.location === filters.location : true;
    return matchesDepartment && matchesLocation;
  });

  const filteredApplicants = applicants.filter((a) => {
    const job = jobs.find((j) => j.title === a.jobTitle);
    const matchesDepartment = filters.department ? job?.department === filters.department : true;
    const matchesLocation = filters.location ? job?.location === filters.location : true;
    const matchesStatus = filters.status ? a.status === filters.status : true;
    const matchesSearch = filters.search ? a.fullName.toLowerCase().includes(filters.search.toLowerCase()) || a.email.toLowerCase().includes(filters.search.toLowerCase()) : true;
    return matchesDepartment && matchesLocation && matchesStatus && matchesSearch;
  });

  const uniqueDepartments = [...new Set(jobs.map((j) => j.department))];
  const uniqueLocations = [...new Set(jobs.map((j) => j.location))];
  const uniqueStatuses = ["Submitted", "Reviewed", "Interviewing", "Hired", "Rejected"];

  const handleAdminJobClick = (job) => setViewJobDetails(job);

  return (
    <div className="p-8 text-white bg-[#121620] min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Careers</h1>

      {user?.role === "admin" && (
        <div className="bg-[#15202e] p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Admin: Post New Job</h2>
          <form onSubmit={createJob} className="grid md:grid-cols-2 gap-4">
            <input type="text" name="title" value={newJob.title} onChange={handleJobChange} placeholder="Job Title" className="bg-[#1c2a3a] p-2 rounded" required />
            <input type="text" name="department" value={newJob.department} onChange={handleJobChange} placeholder="Department" className="bg-[#1c2a3a] p-2 rounded" required />
            <input type="text" name="location" value={newJob.location} onChange={handleJobChange} placeholder="Location" className="bg-[#1c2a3a] p-2 rounded" required />
            <textarea name="description" value={newJob.description} onChange={handleJobChange} placeholder="Job Description" className="bg-[#1c2a3a] p-2 rounded md:col-span-2" required />
            <button type="submit" className="bg-[#cca050] text-black font-bold px-4 py-2 rounded md:col-span-2">➕ Post Job</button>
          </form>

          <div className="grid md:grid-cols-4 gap-4 my-6">
            <select onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))} className="bg-[#1c2a3a] p-2 rounded text-white">
              <option value="">All Departments</option>
              {uniqueDepartments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))} className="bg-[#1c2a3a] p-2 rounded text-white">
              <option value="">All Locations</option>
              {uniqueLocations.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <select onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} className="bg-[#1c2a3a] p-2 rounded text-white">
              <option value="">All Statuses</option>
              {uniqueStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="text" placeholder="Search name or email..." className="bg-[#1c2a3a] p-2 rounded text-white" onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
          </div>

          <h3 className="text-lg font-semibold mb-2">Existing Postings</h3>
          <ul className="space-y-2 text-sm">
            {filteredJobs.map((job) => (
              <li
                key={job._id}
                className="flex justify-between items-center bg-[#1c2a3a] px-4 py-2 rounded cursor-pointer hover:ring-2 hover:ring-[#cca050]"
                onClick={() => handleAdminJobClick(job)}
              >
                <span>{job.title} – {job.department}</span>
                <button onClick={(e) => { e.stopPropagation(); deleteJob(job._id); }} className="text-red-400 hover:text-red-300 text-xs">
                  Delete
                </button>
              </li>
            ))}
          </ul>

          <hr className="my-6 border-[#1f2a3c]" />

          <h3 className="text-lg font-semibold mb-2">Applicants</h3>
          <ul className="text-sm space-y-2">
            {filteredApplicants.map((app) => (
              <li key={app._id} className="flex flex-col gap-2 bg-[#1c2a3a] px-4 py-2 rounded">
                <div>
                  <p className="font-medium">{app.fullName}</p>
                  <p className="text-gray-400 text-xs">{app.email}</p>
                  <p className="text-gray-500 text-xs">For: {app.jobTitle}</p>
                  <p className="text-xs text-[#cca050]">Status: {app.status}</p>
                </div>
                {app.resumeUrl && (
                  <div className="mt-2">
                    {app.resumeUrl.endsWith(".pdf") ? (
                      <embed src={app.resumeUrl} type="application/pdf" width="100%" height="300px" className="rounded border border-[#1f2a3c]" />
                    ) : (
                      <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-[#cca050] text-xs underline">
                        View Resume
                      </a>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {user?.role === "admin" && viewJobDetails && (
        <AdminJobDetailModal
          job={viewJobDetails}
          onClose={() => setViewJobDetails(null)}
        />
      )}

      {user?.role !== "admin" && selectedJob && (
        <UserApplicationModal
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          job={selectedJob}
        />
      )}
    </div>
  );
}