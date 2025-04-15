import { useEffect, useState } from "react";
import api from "../utils/axios";
import Sidebar from "../components/Sidebar";
import { format } from "date-fns";

const ITEMS_PER_PAGE = 10;

export default function AuditLogPanel() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    api.get("/admin/audit-logs")
      .then((res) => {
        setLogs(res.data);
        setFilteredLogs(res.data);
      })
      .catch((err) => console.error("Failed to load audit logs:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = logs.filter(log =>
      (log.user?.name || "").toLowerCase().includes(query) &&
      (actionFilter ? log.action === actionFilter : true)
    );
    setFilteredLogs(filtered);
    setCurrentPage(1); // Reset page when filter changes
  }, [searchQuery, actionFilter, logs]);

  const handleExport = () => {
    const csv = filteredLogs.map(log =>
      `"${log.user?.name || "Unknown"}","${log.action}","${log.targetType}","${format(new Date(log.timestamp), "PPpp")}"`
    );
    const csvContent = `data:text/csv;charset=utf-8,User,Action,Target Type,Timestamp\n${csv.join("\n")}`;
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "audit_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const uniqueActions = [...new Set(logs.map(log => log.action))];

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 p-6 w-full min-h-screen bg-[#121620] text-white">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <button
            onClick={handleExport}
            className="bg-[#cca050] text-black font-semibold px-4 py-2 rounded hover:opacity-90"
          >
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#1c2a3a] text-white px-4 py-2 rounded w-64"
          />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-[#1c2a3a] text-white px-4 py-2 rounded"
          >
            <option value="">All Actions</option>
            {uniqueActions.map((action) => (
              <option key={action}>{action}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-gray-400">Loading logs...</p>
        ) : paginatedLogs.length === 0 ? (
          <p className="text-gray-400">No audit logs found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-[#1c2a3a] rounded-xl shadow">
                <thead>
                  <tr className="text-left border-b border-[#2c3e50]">
                    <th className="px-4 py-3 text-[#cca050]">User</th>
                    <th className="px-4 py-3 text-[#cca050]">Action</th>
                    <th className="px-4 py-3 text-[#cca050]">Target</th>
                    <th className="px-4 py-3 text-[#cca050]">Metadata</th>
                    <th className="px-4 py-3 text-[#cca050]">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogs.map((log) => (
                    <tr key={log._id} className="border-t border-[#2c3e50] hover:bg-[#20303f]">
                      <td className="px-4 py-2">{log.user?.name || "Unknown"}</td>
                      <td className="px-4 py-2">{log.action}</td>
                      <td className="px-4 py-2">{log.targetType} ({log.targetId?.slice(-5)})</td>
                      <td className="px-4 py-2 text-sm text-gray-300">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(log.metadata, null, 2)}</pre>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-400">
                        {format(new Date(log.timestamp), "PPpp")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: totalPages }, (_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === idx + 1
                      ? "bg-[#cca050] text-black font-bold"
                      : "bg-[#1c2a3a] text-white hover:bg-[#1f2a3c]"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
