import { useEffect, useState } from "react";
import api from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { saveAs } from "file-saver";

export default function IssueTracker() {
  const { user } = useAuth();

  const [issues, setIssues] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", department: "", priority: "Low" });
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [activeIssue, setActiveIssue] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    api.get("/issues")
      .then((res) => setIssues(res.data))
      .catch((err) => console.error("Failed to fetch issues:", err));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.department) return;
    try {
      const res = await api.post("/issues", form);
      setIssues((prev) => [res.data, ...prev]);
      setForm({ title: "", description: "", department: "", priority: "Low" });
    } catch (err) {
      console.error("Error creating issue:", err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/issues/${id}`, { status: newStatus });
      setIssues((prev) =>
        prev.map((issue) =>
          issue._id === id ? { ...issue, status: newStatus } : issue
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleCommentChange = (issueId, text) => {
    setCommentInputs((prev) => ({ ...prev, [issueId]: text }));
  };

  const handleAddComment = async (issueId) => {
    const text = commentInputs[issueId];
    if (!text) return;

    try {
      const res = await api.post(`/issues/${issueId}/comments`, { text });
      setIssues((prev) =>
        prev.map((issue) =>
          issue._id === issueId
            ? { ...issue, comments: [...(issue.comments || []), res.data] }
            : issue
        )
      );
      setCommentInputs((prev) => ({ ...prev, [issueId]: "" }));
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleDeleteComment = async (issueId, commentId) => {
    try {
      await api.delete(`/issues/${issueId}/comments/${commentId}`);
      setIssues((prev) =>
        prev.map((issue) =>
          issue._id === issueId
            ? { ...issue, comments: issue.comments.filter((c) => c._id !== commentId) }
            : issue
        )
      );
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await api.get("/issues/export", { responseType: "blob" });
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, "issues_export.csv");
    } catch (err) {
      console.error("Error exporting CSV:", err);
    }
  };

  const filteredIssues = issues
    .filter((i) => (statusFilter ? i.status === statusFilter : true))
    .filter((i) => (departmentFilter ? i.department === departmentFilter : true))
    .filter((i) => searchQuery ? i.title.toLowerCase().includes(searchQuery.toLowerCase()) || i.description?.toLowerCase().includes(searchQuery.toLowerCase()) : true)
    .filter((i) => i.archived === showArchived)
    .sort((a, b) => {
      if (sortOption === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortOption === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortOption === "priority") {
        const order = { High: 0, Medium: 1, Low: 2 };
        return order[a.priority] - order[b.priority];
      }
      return 0;
    });

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 p-6 w-full min-h-screen bg-[#121620] text-white">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Issue Tracker</h2>
            <div className="bg-[#1c2a3a] rounded flex overflow-hidden text-sm font-medium">
              <button
                className={`px-4 py-2 ${!showArchived ? "bg-[#cca050] text-black" : "text-white"}`}
                onClick={() => setShowArchived(false)}
              >
                Active
              </button>
              <button
                className={`px-4 py-2 ${showArchived ? "bg-[#cca050] text-black" : "text-white"}`}
                onClick={() => setShowArchived(true)}
              >
                Archived
              </button>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="bg-[#cca050] text-black px-4 py-2 rounded font-semibold hover:opacity-90"
          >
            📤 Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-4">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-[#1c2a3a] text-white px-3 py-2 rounded">
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
            <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="bg-[#1c2a3a] text-white px-3 py-2 rounded">
              <option value="">All Departments</option>
              {[...new Set(issues.map((i) => i.department))].map((d) => <option key={d}>{d}</option>)}
            </select>
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="bg-[#1c2a3a] text-white px-3 py-2 rounded">
              <option value="">Sort by</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Priority</option>
            </select>
          </div>
          <input type="text" placeholder="Search issues..." className="bg-[#1c2a3a] text-white px-4 py-2 rounded w-full md:w-64" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        {/* Add Form */}
        <form onSubmit={handleSubmit} className="bg-[#15202e] p-6 rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <input type="text" name="title" placeholder="Title" value={form.title} onChange={handleChange} className="bg-[#1c2a3a] text-white rounded px-4 py-2" />
          <input type="text" name="description" placeholder="Description" value={form.description} onChange={handleChange} className="bg-[#1c2a3a] text-white rounded px-4 py-2" />
          <input type="text" name="department" placeholder="Department" value={form.department} onChange={handleChange} className="bg-[#1c2a3a] text-white rounded px-4 py-2" />
          <select name="priority" value={form.priority} onChange={handleChange} className="bg-[#1c2a3a] text-white rounded px-4 py-2">
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
          </select>
          <button type="submit" className="col-span-full bg-[#cca050] text-black font-bold px-4 py-2 rounded">➕ Add Issue</button>
        </form>

        {/* Issues Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredIssues.map((issue) => (
            <div key={issue._id} className="bg-[#15202e] rounded-2xl p-6 border border-[#1f2e3d] cursor-pointer hover:bg-[#1a2636]" onClick={() => setActiveIssue(issue)}>
              <h2 className="text-xl font-semibold mb-1 text-[#cca050]">{issue.title}</h2>
              <p className="text-sm text-gray-300 mb-3">{issue.description || "No description provided."}</p>
              <p className="text-sm text-gray-400">Department: {issue.department}</p>
              <p className="text-sm text-gray-400">Priority: <span className={`font-semibold ${issue.priority === "High" ? "text-red-400" : issue.priority === "Medium" ? "text-yellow-300" : "text-green-400"}`}>{issue.priority}</span></p>
            </div>
          ))}
        </div>

        {/* Modal */}
        {activeIssue && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-[#1c2a3a] rounded-lg p-6 w-full max-w-2xl relative overflow-y-auto max-h-[90vh]">
              <button className="absolute top-2 right-2 text-white text-xl" onClick={() => setActiveIssue(null)}>✕</button>

              <h2 className="text-2xl font-bold text-[#cca050] mb-2">{activeIssue.title}</h2>
              <p className="text-gray-300 mb-4">{activeIssue.description}</p>
              <p className="text-sm text-gray-400 mb-1">Department: {activeIssue.department}</p>
              <p className="text-sm text-gray-400 mb-4">
                Priority: <span className={`font-semibold ${activeIssue.priority === "High" ? "text-red-400" : activeIssue.priority === "Medium" ? "text-yellow-300" : "text-green-400"}`}>{activeIssue.priority}</span>
              </p>

              <div className="mb-4">
                <label className="text-sm text-gray-400 mr-2">Status:</label>
                <select
                  value={activeIssue.status}
                  onChange={async (e) => {
                    const newStatus = e.target.value;
                    await handleStatusChange(activeIssue._id, newStatus);
                    setActiveIssue(prev => ({ ...prev, status: newStatus }));
                  }}
                  className="bg-[#1f2e3d] text-white px-3 py-1 rounded text-sm"
                >
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <h3 className="text-md font-semibold text-white mb-1">Comments</h3>
              <ul className="space-y-2 mb-3 max-h-40 overflow-y-auto pr-1">
                {(activeIssue.comments || []).map((comment) => (
                  <li key={comment._id} className="relative text-sm text-gray-300 bg-[#28394a] rounded px-3 py-2">
                    <span className="block text-xs text-gray-400 mb-1">
                      {comment.author?.name || "Staff"} • {new Date(comment.createdAt).toLocaleString()}
                    </span>
                    {comment.text}
                    {user?.role === "admin" && (
                      <button
                        onClick={() => handleDeleteComment(activeIssue._id, comment._id)}
                        className="absolute top-1 right-2 text-red-400 hover:text-red-200 text-xs"
                      >
                        🗑️
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={commentInputs[activeIssue._id] || ""}
                  onChange={(e) => handleCommentChange(activeIssue._id, e.target.value)}
                  placeholder="Add comment..."
                  className="flex-1 bg-[#1c2a3a] text-white text-sm px-3 py-2 rounded"
                />
                <button
                  onClick={() => handleAddComment(activeIssue._id)}
                  className="bg-[#cca050] text-black text-sm px-3 py-2 rounded hover:opacity-90"
                >
                  ➤
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
