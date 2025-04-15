import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function LeaveRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({
    department: "",
    leaveType: "Vacation",
    startDate: "",
    endDate: "",
    reason: "",
    attachments: [],
  });

  useEffect(() => {
    api.get("/leave-requests")
      .then(res => setRequests(res.data))
      .catch(err => console.error("Error fetching leave requests:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "attachments") {
      setForm(prev => ({ ...prev, attachments: files }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      for (let key in form) {
        if (key === "attachments") {
          for (let file of form.attachments) {
            formData.append("attachments", file);
          }
        } else {
          formData.append(key, form[key]);
        }
      }

      const res = await api.post("/leave-requests", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setRequests(prev => [res.data, ...prev]);
      toast.success("Leave request submitted!");
      setForm({
        department: "",
        leaveType: "Vacation",
        startDate: "",
        endDate: "",
        reason: "",
        attachments: [],
      });
    } catch (err) {
      toast.error("Failed to submit request.");
      console.error("Error submitting request:", err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await api.patch(`/leave-requests/${id}/status`, { status });
      setRequests(prev => prev.map(r => (r._id === id ? res.data : r)));
    } catch (err) {
      toast.error("Error updating status");
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 p-6 w-full min-h-screen bg-[#121620] text-white">
        <h1 className="text-3xl font-bold mb-6">Leave Requests</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-[#15202e] p-6 rounded-xl mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            className="bg-[#1c2a3a] text-white rounded px-4 py-2 col-span-2"
          >
            <option value="">Select Department</option>
            {[
              "Assessor", "Communications", "Community Development", "County Manager",
              "Detention Center", "Fire Department", "Flood Commission", "HR",
              "IT", "Public Works", "Purchasing", "Sheriff"
            ].map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            name="leaveType"
            value={form.leaveType}
            onChange={handleChange}
            className="bg-[#1c2a3a] text-white rounded px-4 py-2"
          >
            <option value="Vacation">Vacation</option>
            <option value="Sick">Sick</option>
            <option value="Personal">Personal</option>
            <option value="Other">Other</option>
          </select>

          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            className="bg-[#1c2a3a] text-white rounded px-4 py-2"
          />
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            className="bg-[#1c2a3a] text-white rounded px-4 py-2"
          />

          <textarea
            name="reason"
            value={form.reason}
            onChange={handleChange}
            placeholder="Reason for leave"
            rows={2}
            className="col-span-full bg-[#1c2a3a] text-white rounded px-4 py-2"
          />

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
            ➕ Submit Request
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {requests.map((req) => (
            <div key={req._id} className="bg-[#15202e] p-4 rounded-xl border border-[#1f2e3d]">
              <h2 className="text-xl text-[#cca050] font-semibold">{req.name}</h2>
              <p className="text-sm text-gray-400">Dept: {req.department}</p>
              <p className="text-sm text-gray-400">Leave: {req.leaveType}</p>
              <p className="text-sm text-gray-400">From: {req.startDate?.slice(0, 10)} → {req.endDate?.slice(0, 10)}</p>
              <p className="text-sm text-gray-300 mt-2">{req.reason}</p>
              <p className="text-xs text-gray-500 mt-2">Submitted: {new Date(req.createdAt).toLocaleString()}</p>

              {req.attachments?.length > 0 && (
                <div className="mt-3 text-sm">
                  <strong className="text-white">Attachments:</strong>
                  <ul className="mt-1 space-y-1">
                    {req.attachments.map((file, i) => (
                      <li key={i}>
                        <a
                          href={`http://localhost:5173${file}`}
                          target="_blank"
                          className="text-blue-400 hover:underline"
                        >
                          {file.split("/").pop()}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm">
                  Status:{" "}
                  <span className={`font-semibold ${
                    req.status === "Approved" ? "text-green-400" :
                    req.status === "Denied" ? "text-red-400" : "text-yellow-400"
                  }`}>
                    {req.status}
                  </span>
                </span>

                {user.role === "admin" && (
                  <select
                    value={req.status}
                    onChange={(e) => updateStatus(req._id, e.target.value)}
                    className="bg-[#1c2a3a] text-white px-3 py-1 rounded text-sm border border-[#2a3a4d]"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Approved">Approved</option>
                    <option value="Denied">Denied</option>
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
