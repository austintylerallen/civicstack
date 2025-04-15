import { useEffect, useState } from "react";
import api from "../utils/axios";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

export default function FormRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({
    type: "Leave Request",
    description: "",
    amount: "",
    startDate: "",
    endDate: "",
    weekOf: "",
    hours: "",
    acknowledged: false,
    attachments: [],
  });
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [filterDept, setFilterDept] = useState("All");

  useEffect(() => {
    api.get("/form-requests")
      .then((res) => setRequests(res.data))
      .catch((err) => console.error("Error loading form requests:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      setForm((prev) => ({ ...prev, attachments: files }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("type", form.type);
    data.append("department", "General Services");
    data.append("acknowledged", form.acknowledged);

    const fields = {
      description: form.description,
      amount: form.amount,
      startDate: form.startDate,
      endDate: form.endDate,
      weekOf: form.weekOf,
      hours: form.hours,
    };
    data.append("fields", JSON.stringify(fields));

    if (form.attachments.length > 0) {
      for (let file of form.attachments) {
        data.append("attachments", file);
      }
    }

    try {
      const res = await api.post("/form-requests", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setRequests((prev) => [res.data, ...prev]);
      setForm({
        type: "Leave Request",
        description: "",
        amount: "",
        startDate: "",
        endDate: "",
        weekOf: "",
        hours: "",
        acknowledged: false,
        attachments: [],
      });
    } catch (err) {
      console.error("Error submitting request:", err);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await api.patch(`/form-requests/${id}/status`, { status });
      setRequests((prev) => prev.map((r) => (r._id === id ? res.data : r)));
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleCommentUpdate = async (id, comment) => {
    try {
      const res = await api.patch(`/form-requests/${id}/comment`, { comment });
      setRequests((prev) => prev.map((r) => (r._id === id ? res.data : r)));
    } catch (err) {
      console.error("Failed to update comment:", err);
    }
  };

  const handlePDFExport = async (req) => {
    try {
      const res = await api.get(`/form-requests/${req._id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesStatus = filterStatus === "All" || r.status === filterStatus;
    const matchesType = filterType === "All" || r.type === filterType;
    const matchesDept = filterDept === "All" || r.department === filterDept;
    return matchesStatus && matchesType && matchesDept;
  });

  const uniqueDepartments = [...new Set(requests.map((r) => r.department))];

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 p-6 w-full min-h-screen bg-[#121620] text-white">
        <h1 className="text-3xl font-bold mb-6">Form Requests</h1>

        <form onSubmit={handleSubmit} className="bg-[#15202e] p-6 rounded-xl mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <select name="type" value={form.type} onChange={handleChange} className="col-span-full bg-[#1c2a3a] text-white rounded px-4 py-2">
            <option value="Leave Request">Leave Request</option>
            <option value="Expense Report">Expense Report</option>
            <option value="Timesheet">Timesheet</option>
            <option value="Other">Other</option>
          </select>

          <input type="text" name="description" placeholder="Description" value={form.description} onChange={handleChange} className="col-span-full bg-[#1c2a3a] text-white rounded px-4 py-2" />

          {form.type === "Leave Request" && (
            <>
              <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="bg-[#1c2a3a] text-white rounded px-4 py-2" />
              <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className="bg-[#1c2a3a] text-white rounded px-4 py-2" />
            </>
          )}
          {form.type === "Expense Report" && (
            <input type="text" name="amount" placeholder="Amount" value={form.amount} onChange={handleChange} className="bg-[#1c2a3a] text-white rounded px-4 py-2" />
          )}
          {form.type === "Timesheet" && (
            <>
              <input type="date" name="weekOf" value={form.weekOf} onChange={handleChange} className="bg-[#1c2a3a] text-white rounded px-4 py-2" />
              <input type="text" name="hours" placeholder="Hours" value={form.hours} onChange={handleChange} className="bg-[#1c2a3a] text-white rounded px-4 py-2" />
            </>
          )}

          <input type="file" name="attachments" multiple onChange={handleChange} className="col-span-full text-sm file:rounded file:border-0 file:bg-[#cca050] file:text-black file:px-4 file:py-2" />

          {form.type === "Other" && (
            <label className="col-span-full text-sm text-gray-300 flex gap-2 items-center">
              <input type="checkbox" name="acknowledged" checked={form.acknowledged} onChange={handleChange} />
              I acknowledge this policy request
            </label>
          )}

          <button type="submit" className="col-span-full bg-[#cca050] text-black font-bold px-4 py-2 rounded">
            ➕ Submit Request
          </button>
        </form>

        <div className="flex gap-4 mb-6">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-[#1c2a3a] text-white px-4 py-2 rounded">
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-[#1c2a3a] text-white px-4 py-2 rounded">
            <option value="All">All Types</option>
            <option value="Leave Request">Leave Request</option>
            <option value="Expense Report">Expense Report</option>
            <option value="Timesheet">Timesheet</option>
            <option value="Other">Other</option>
          </select>

          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="bg-[#1c2a3a] text-white px-4 py-2 rounded">
            <option value="All">All Departments</option>
            {uniqueDepartments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRequests.map((req) => (
            <div key={req._id} className="bg-[#15202e] rounded-xl p-4 shadow border border-[#1f2e3d]">
              <h2 className="text-lg font-semibold text-[#cca050]">{req.type}</h2>
              <p className="text-sm text-gray-300">{req.fields?.description}</p>
              {req.fields?.amount && <p className="text-sm text-green-400">Amount: ${req.fields.amount}</p>}
              {req.fields?.startDate && <p className="text-sm text-gray-400">Leave: {req.fields.startDate} – {req.fields.endDate}</p>}
              {req.fields?.hours && <p className="text-sm text-blue-400">Hours: {req.fields.hours}</p>}
              <p className="text-sm mt-2">Department: {req.department}</p>
              <p className="text-xs text-gray-400 mt-2">Status: {req.status}</p>
              <p className="text-xs text-gray-500">Submitted: {new Date(req.createdAt).toLocaleString()}</p>
              {req.attachments?.length > 0 && (
                <div className="mt-3 text-sm">
                  <strong className="text-white">Attachments:</strong>
                  <ul className="mt-1 space-y-1">
                    {req.attachments.map((file, i) => (
                      <li key={i}>
                        <a href={`http://localhost:5173${file}`} target="_blank" className="text-blue-400 hover:underline">{file.split("/").pop()}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {req.comment && <p className="text-xs text-yellow-300 mt-2">💬 Admin Comment: {req.comment}</p>}
              {req.acknowledged && <p className="text-xs text-green-400 mt-2">✅ Policy Acknowledged</p>}

              <button onClick={() => handlePDFExport(req)} className="text-sm mt-2 underline text-[#cca050]">📄 View PDF</button>

              {user?.role === "admin" && (
                <div className="mt-4 space-y-2">
                  <select value={req.status} onChange={(e) => handleStatusUpdate(req._id, e.target.value)} className="w-full bg-[#1c2a3a] text-white rounded px-3 py-2">
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <input type="text" placeholder="Add or update comment" defaultValue={req.comment || ""} onBlur={(e) => handleCommentUpdate(req._id, e.target.value)} className="w-full bg-[#1c2a3a] text-white rounded px-3 py-2" />
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
