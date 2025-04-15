import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import Papa from "papaparse";

export default function DevelopmentProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [viewArchived, setViewArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    department: "",
    status: "Submitted",
    attachments: [],
  });

  useEffect(() => {
    api.get("/development-projects")
      .then((res) => setProjects(res.data))
      .catch((err) => console.error("Error loading projects:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "attachments") {
      setForm((prev) => ({ ...prev, attachments: files }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.department) return;
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key === "attachments" && val.length > 0) {
          for (let file of val) formData.append("attachments", file);
        } else {
          formData.append(key, val);
        }
      });
      const res = await api.post("/development-projects", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProjects((prev) => [res.data, ...prev]);
      setForm({ name: "", description: "", department: "", status: "Submitted", attachments: [] });
    } catch (err) {
      console.error("Error creating project:", err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await api.patch(`/development-projects/${id}/status`, { status });
      setProjects((prev) =>
        prev.map((p) => (p._id === id ? { ...p, status: res.data.status } : p))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const toggleDepartmentCheck = async (id, deptName, checked) => {
    try {
      const res = await api.patch(`/development-projects/${id}/department-check`, {
        department: deptName,
        reviewed: checked,
      });
      setProjects((prev) => prev.map((p) => (p._id === id ? res.data : p)));
    } catch (err) {
      console.error("Failed to update department review:", err);
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await api.delete(`/development-projects/${id}`);
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  const filteredProjects = (viewArchived
    ? projects.filter((p) => p.status === "Completed")
    : projects.filter((p) => p.status !== "Completed")
  )
    .filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.department.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((p) => (statusFilter ? p.status === statusFilter : true))
    .filter((p) => (departmentFilter ? p.department === departmentFilter : true));

  const exportToCSV = () => {
    const data = filteredProjects.map((p) => ({
      name: p.name,
      description: p.description,
      department: p.department,
      status: p.status,
      createdAt: new Date(p.createdAt).toLocaleString(),
    }));
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "projects_export.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 p-6 w-full min-h-screen bg-[#121620] text-white">
        <h1 className="text-3xl font-bold mb-6">Development Projects</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 items-end">
  <div className="flex flex-wrap gap-2">
    <input
      type="text"
      placeholder="Search name or department"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="bg-[#1c2a3a] text-white rounded px-4 py-2 w-full sm:w-auto"
    />
    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="bg-[#1c2a3a] text-white rounded px-4 py-2 w-full sm:w-auto"
    >
      <option value="">All Statuses</option>
      {["Submitted", "Under Review", "Approved", "In Progress", "Completed"].map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
    <select
      value={departmentFilter}
      onChange={(e) => setDepartmentFilter(e.target.value)}
      className="bg-[#1c2a3a] text-white rounded px-4 py-2 w-full sm:w-auto"
    >
      <option value="">All Departments</option>
      {[
        "Assessor", "Communications", "Community Development", "County Manager", "County Treasurer",
        "Detention Center", "Fire Department", "Fire Rescue", "Flood Commission", "Human Resources",
        "Information Technology", "Public Health & Assistance", "Purchasing Department", "Road Department", "Sheriff"
      ].map((d) => (
        <option key={d} value={d}>{d}</option>
      ))}
    </select>
  </div>

  <div className="flex gap-3 justify-start lg:justify-end items-center">
    <button
      onClick={() => setViewArchived((prev) => !prev)}
      className="text-sm text-[#cca050] hover:underline"
    >
      {viewArchived ? "Show Active Projects" : "Show Archived Projects"}
    </button>
    <button
      onClick={exportToCSV}
      className="bg-[#cca050] text-black font-semibold px-4 py-2 rounded text-sm"
    >
      ⬇ Export CSV
    </button>
  </div>
</div>


        


        {!viewArchived && (
          <form
            onSubmit={handleSubmit}
            className="bg-[#15202e] p-6 rounded-xl mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <input
              type="text"
              name="name"
              placeholder="Project Name"
              value={form.name}
              onChange={handleChange}
              className="bg-[#1c2a3a] text-white rounded px-4 py-2"
            />
            <input
              type="text"
              name="description"
              placeholder="Short Description"
              value={form.description}
              onChange={handleChange}
              className="bg-[#1c2a3a] text-white rounded px-4 py-2"
            />
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              className="bg-[#1c2a3a] text-white rounded px-4 py-2"
            >
              <option value="">Select Department</option>
              <option value="Assessor">Assessor</option>
              <option value="Communications">Communications</option>
              <option value="Community Development">Community Development</option>
              <option value="County Manager">County Manager</option>
              <option value="County Treasurer">County Treasurer</option>
              <option value="Detention Center">Detention Center</option>
              <option value="Fire Department">Fire Department</option>
              <option value="Fire Rescue">Fire Rescue</option>
              <option value="Flood Commission">Flood Commission</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Public Health & Assistance">Public Health & Assistance</option>
              <option value="Purchasing Department">Purchasing Department</option>
              <option value="Road Department">Road Department</option>
              <option value="Sheriff">Sheriff</option>
            </select>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="bg-[#1c2a3a] text-white rounded px-4 py-2"
            >
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <input
              type="file"
              name="attachments"
              multiple
              onChange={handleChange}
              className="col-span-full text-sm text-white block file:rounded file:border-0 file:bg-[#cca050] file:text-black file:px-4 file:py-2"
            />
            <button
              type="submit"
              className="col-span-full bg-[#cca050] text-black font-bold px-4 py-2 rounded"
            >
              ➕ Submit Project
            </button>
          </form>
        )}

<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
  {filteredProjects.map((proj) => (
    <div key={proj._id} className="bg-[#15202e] rounded-xl p-4 shadow border border-[#1f2e3d]">
      {/* card content here */}
   

              <h2 className="text-xl font-semibold text-[#cca050] mb-2">{proj.name}</h2>
              <p className="text-sm text-gray-300 mb-2">{proj.description || "No description provided."}</p>
              <p className="text-sm text-gray-400">Department: {proj.department}</p>
              <p className="text-sm text-gray-400">
                Status: <span className="text-white font-semibold">{proj.status}</span>
              </p>
              <p className="text-xs text-gray-500 mt-2">Submitted: {new Date(proj.createdAt).toLocaleString()}</p>

              {proj.attachments?.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-white mb-1">📎 Attachments</h4>
                  <ul className="space-y-1 text-sm">
                    {proj.attachments.map((file, i) => (
                      <li key={i}>
                        <a
                          href={`http://localhost:5173${file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
                        >
                          {file.split("/").pop()} <span>🔗</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {proj.departments?.length > 0 && (
                <div className="mt-4 text-sm">
                  <h3 className="font-semibold text-white mb-2">Departmental Review</h3>
                  <ul className="space-y-1">
                    {proj.departments.map((dept) => (
                      <li key={dept.name} className="flex items-center justify-between">
                        <span>{dept.name}</span>
                        <input
                          type="checkbox"
                          checked={dept.reviewed}
                          onChange={(e) =>
                            toggleDepartmentCheck(proj._id, dept.name, e.target.checked)
                          }
                          disabled={user.role !== "admin"}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

{user.role === "admin" && (
  <div className="mt-4 flex items-center justify-between gap-2 text-sm">
    <select
      value={proj.status}
      onChange={(e) => updateStatus(proj._id, e.target.value)}
      className="bg-[#1c2a3a] text-white px-3 py-1 rounded border border-[#2a3a4d] text-sm"
    >
      <option value="Submitted">Submitted</option>
      <option value="Under Review">Under Review</option>
      <option value="Approved">Approved</option>
      <option value="In Progress">In Progress</option>
      <option value="Completed">Completed</option>
    </select>
    <button
      onClick={() => deleteProject(proj._id)}
      className="text-red-400 hover:text-red-300 px-2 py-1 rounded text-xs border border-transparent hover:border-red-400"
    >
      Delete
    </button>
  </div>
)}

            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
