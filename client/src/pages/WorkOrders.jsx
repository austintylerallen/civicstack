import { useEffect, useState } from "react";
import api from "../utils/axios";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

const DEPARTMENTS = [
  "IT",
  "Public Works",
  "Facilities",
  "Parks and Rec",
  "Utilities",
  "Fleet",
  "Other",
];

export default function WorkOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    department: "",
    priority: "Low",
    attachments: [],
  });
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/work-orders")
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("Error loading work orders:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setForm((prev) => ({ ...prev, attachments: files }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.department) return;
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("department", form.department);
      formData.append("priority", form.priority);

      for (let file of form.attachments) {
        formData.append("attachments", file);
      }

      const res = await api.post("/work-orders", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setOrders((prev) => [res.data, ...prev]);
      setForm({ title: "", description: "", department: "", priority: "Low", attachments: [] });
    } catch (err) {
      console.error("Error creating work order:", err);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.patch(`/work-orders/${id}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((order) =>
          order._id === id ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handlePDFExport = async (id) => {
    try {
      const res = await api.get(`/work-orders/${id}/pdf`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `work_order_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("Error exporting PDF:", err);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchDept = filterDept === "All" || o.department === filterDept;
    const matchStatus = filterStatus === "All" || o.status === filterStatus;
    const matchSearch = o.title.toLowerCase().includes(search.toLowerCase()) || o.description?.toLowerCase().includes(search.toLowerCase());
    return matchDept && matchStatus && matchSearch;
  });

  const uniqueDepartments = [...new Set(orders.map((o) => o.department))];

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 p-6 w-full min-h-screen bg-[#121620] text-white">
        <h1 className="text-3xl font-bold mb-6">Work Orders</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-[#15202e] p-6 rounded-xl mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            className="bg-[#1c2a3a] text-white rounded px-4 py-2"
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
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
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="bg-[#1c2a3a] text-white rounded px-4 py-2"
          >
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
          </select>

          <div className="col-span-full">
            <label className="block text-sm mb-2">Attachments</label>
            <input
              type="file"
              name="attachments"
              multiple
              onChange={handleChange}
              className="text-sm file:rounded file:border-0 file:bg-[#cca050] file:text-black file:px-4 file:py-2"
            />
          </div>

          <button
            type="submit"
            className="col-span-full lg:col-span-1 bg-[#cca050] text-black font-bold px-4 py-2 rounded"
          >
            ➕ Submit Work Order
          </button>
        </form>

        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="🔍 Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#1c2a3a] text-white px-4 py-2 rounded w-full max-w-sm"
          />
          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="bg-[#1c2a3a] text-white px-4 py-2 rounded">
            <option value="All">All Departments</option>
            {uniqueDepartments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-[#1c2a3a] text-white px-4 py-2 rounded">
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-[#15202e] rounded-xl p-4 shadow border border-[#1f2e3d]"
            >
              <h2 className="text-xl font-semibold mb-1 text-[#cca050]">
                {order.title}
              </h2>
              <p className="text-sm text-gray-300 mb-2">
                {order.description || "No description provided."}
              </p>
              <p className="text-sm text-gray-400">Department: {order.department}</p>
              <p className="text-sm text-gray-400">
                Priority: <span className={`font-semibold ${order.priority === "High" ? "text-red-400" : order.priority === "Medium" ? "text-yellow-300" : "text-green-400"}`}>{order.priority}</span>
              </p>
              <div className="mt-2">
                <label className="text-xs text-gray-400 mr-2">Status:</label>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                  className="bg-[#1f2e3d] text-white text-sm px-3 py-1 rounded"
                >
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              {order.attachments?.length > 0 && (
                <div className="mt-2 text-sm">
                  <p className="font-semibold text-white">Attachments:</p>
                  <ul className="list-disc list-inside">
                    {order.attachments.map((file, i) => (
                      <li key={i}>
                        <a
                          href={`http://localhost:5173${file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          {file.split("/").pop()}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                onClick={() => handlePDFExport(order._id)}
                className="mt-4 bg-[#cca050] text-black px-3 py-1 text-sm rounded hover:opacity-90"
              >
                📄 Export PDF
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Submitted: {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
