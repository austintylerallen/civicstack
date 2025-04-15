import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import ReactMarkdown from "react-markdown";

export default function InternalCommsHub() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState({
    title: "",
    body: "",
    department: "General Services",
    pinned: false,
    attachment: null,
  });
  const [filters, setFilters] = useState({ department: "", search: "" });

  useEffect(() => {
    api.get("/announcements")
      .then((res) => setAnnouncements(res.data))
      .catch((err) => console.error("Error loading announcements:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setForm((prev) => ({ ...prev, attachment: files[0] }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.body) return;

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("content", form.body);
      formData.append("department", form.department);
      formData.append("pinned", form.pinned);

      if (form.attachment) {
        formData.append("attachment", form.attachment);
      }

      const res = await api.post("/announcements", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setAnnouncements((prev) => [res.data, ...prev]);
      setForm({ title: "", body: "", department: "General Services", pinned: false, attachment: null });
    } catch (err) {
      console.error("Error posting announcement:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await api.delete(`/announcements/${id}`);
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error("Error deleting announcement:", err);
    }
  };

  const filtered = announcements.filter((a) => {
    const matchesDept = filters.department ? a.department === filters.department : true;
    const matchesSearch = filters.search
      ? a.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        a.content.toLowerCase().includes(filters.search.toLowerCase())
      : true;
    return matchesDept && matchesSearch;
  });

  const pinned = filtered.filter((a) => a.pinned);
  const others = filtered.filter((a) => !a.pinned);

  const uniqueDepartments = [...new Set(announcements.map((a) => a.department))];

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 p-6 w-full min-h-screen bg-[#121620] text-white">
        <h1 className="text-3xl font-bold mb-6">📢 Internal Communications Hub</h1>

        {user?.role === "admin" && (
          <form onSubmit={handleSubmit} className="bg-[#15202e] p-6 rounded-lg mb-8 space-y-4">
            <input
              type="text"
              name="title"
              placeholder="Announcement Title"
              value={form.title}
              onChange={handleChange}
              className="w-full bg-[#1c2a3a] text-white px-4 py-2 rounded"
            />
            <textarea
              name="body"
              placeholder="Message (Markdown supported)"
              value={form.body}
              onChange={handleChange}
              rows={5}
              className="w-full bg-[#1c2a3a] text-white px-4 py-2 rounded"
            />
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              className="w-full bg-[#1c2a3a] text-white px-4 py-2 rounded"
            >
              <option value="General Services">General Services</option>
              <option value="Public Works">Public Works</option>
              <option value="Parks & Rec">Parks & Rec</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
            </select>
            <label className="flex items-center text-sm text-white space-x-2">
              <input type="checkbox" name="pinned" checked={form.pinned} onChange={handleChange} />
              <span>Pin this announcement</span>
            </label>
            <input
              type="file"
              name="attachment"
              onChange={handleChange}
              className="text-sm text-white block file:rounded file:border-0 file:bg-[#cca050] file:text-black file:px-4 file:py-2"
            />
            <button
              type="submit"
              className="bg-[#cca050] text-black font-bold px-4 py-2 rounded"
            >
              ➕ Post Announcement
            </button>
          </form>
        )}

        {/* Filters */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <select
            onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}
            className="bg-[#1c2a3a] p-2 rounded text-white"
          >
            <option value="">All Departments</option>
            {uniqueDepartments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search announcements..."
            className="bg-[#1c2a3a] p-2 rounded text-white"
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          />
        </div>

        {/* 📌 Pinned Section */}
        {pinned.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-yellow-400">📌 Pinned Announcements</h2>
            <div className="space-y-4">
              {pinned.map((a) => (
                <AnnouncementCard key={a._id} announcement={a} user={user} onDelete={handleDelete} />
              ))}
            </div>
          </section>
        )}

        {/* 📰 Other Announcements */}
        <div className="space-y-4">
          {others.map((a) => (
            <AnnouncementCard key={a._id} announcement={a} user={user} onDelete={handleDelete} />
          ))}
        </div>
      </main>
    </div>
  );
}

function AnnouncementCard({ announcement: a, user, onDelete }) {
  return (
    <div className="bg-[#15202e] rounded-lg p-5 border border-[#1f2e3d] shadow">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[#cca050]">
          {a.title} {a.pinned && <span className="ml-2 text-yellow-400 text-sm">📌</span>}
        </h2>
        <span className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleString()}</span>
      </div>
      <ReactMarkdown
        components={{
          p: ({ node, ...props }) => <p className="prose prose-invert mt-3" {...props} />,
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mt-4 mb-2" {...props} />,
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline" />
          ),
          ul: ({ node, ...props }) => <ul className="list-disc list-inside" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside" {...props} />,
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
          em: ({ node, ...props }) => <em className="italic" {...props} />,
        }}
      >
        {a.content}
      </ReactMarkdown>
      <p className="text-sm text-gray-400 mt-2">Department: {a.department}</p>
      {a.attachment && (
        <div className="mt-3">
          <a
            href={a.attachment}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 underline hover:text-blue-300"
          >
            📎 Download Attachment
          </a>
        </div>
      )}
      {user?.role === "admin" && (
        <button
          onClick={() => onDelete(a._id)}
          className="mt-4 text-sm text-red-400 hover:underline"
        >
          🗑️ Delete
        </button>
      )}
    </div>
  );
}
