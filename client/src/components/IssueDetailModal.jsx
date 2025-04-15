import { useEffect, useState } from "react";
import api from "../utils/axios";
import { useAuth } from "../context/AuthContext";

export default function IssueDetailModal({ issueId, onClose }) {
  const { user } = useAuth();
  const [issue, setIssue] = useState(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (issueId) {
      api.get("/issues").then(res => {
        const found = res.data.find((i) => i._id === issueId);
        setIssue(found || null);
      });
    }
  }, [issueId]);

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    try {
      const res = await api.post(`/issues/${issueId}/comments`, { text: comment });
      setIssue(prev => ({
        ...prev,
        comments: [...prev.comments, res.data]
      }));
      setComment("");
    } catch (err) {
      console.error("Failed to add comment", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/issues/${issueId}/comments/${commentId}`);
      setIssue(prev => ({
        ...prev,
        comments: prev.comments.filter(c => c._id !== commentId)
      }));
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  if (!issue) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#1c2a3a] text-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative p-6">
        <button onClick={onClose} className="absolute top-3 right-4 text-white text-2xl font-bold">
          ×
        </button>

        <h2 className="text-2xl font-bold mb-2">{issue.title}</h2>
        <p className="text-gray-300 mb-4">{issue.description || "No description provided."}</p>

        <div className="text-sm text-gray-400 mb-4 space-y-1">
          <p><strong>Status:</strong> {issue.status}</p>
          <p><strong>Department:</strong> {issue.department}</p>
          <p><strong>Priority:</strong> {issue.priority}</p>
          <p><strong>Created By:</strong> {issue.createdBy?.name || "Unknown"}</p>
          <p><strong>Created At:</strong> {new Date(issue.createdAt).toLocaleString()}</p>
        </div>

        <h3 className="text-xl font-semibold mb-2">Comments</h3>
        <ul className="space-y-3 mb-4">
          {issue.comments.map((c) => (
            <li key={c._id} className="bg-[#121620] p-3 rounded relative">
              <p className="text-sm text-white">{c.text}</p>
              <p className="text-xs text-gray-400">
                {c.author?.name || "Staff"} • {new Date(c.createdAt).toLocaleString()}
              </p>
              {user?.role === "admin" && (
                <button
                  onClick={() => handleDeleteComment(c._id)}
                  className="absolute top-2 right-2 text-red-400 text-xs"
                >
                  🗑
                </button>
              )}
            </li>
          ))}
        </ul>

        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-[#2a3b4d] text-white px-4 py-2 rounded"
          />
          <button
            onClick={handleAddComment}
            className="bg-[#cca050] text-black px-4 py-2 rounded font-semibold"
          >
            ➤ Post
          </button>
        </div>
      </div>
    </div>
  );
}
