import { useState } from "react";
import api from "../utils/axios";

export default function FeedbackModal({ isOpen, onClose }) {
  const [message, setMessage] = useState("");
  const [type, setType] = useState("Suggestion");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/feedback", { type, message });
      setSubmitted(true);
      setMessage("");
      setType("Suggestion");
    } catch (err) {
      console.error("Error submitting feedback:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1f2e3d] rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-[#cca050] mb-4">💬 Submit Feedback</h2>

        {submitted ? (
          <p className="text-green-400">Thanks for your feedback!</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-[#121620] text-white rounded px-3 py-2"
            >
              <option value="Suggestion">Suggestion</option>
              <option value="Bug">Bug</option>
              <option value="Other">Other</option>
            </select>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full p-3 rounded bg-[#121620] text-white"
              placeholder="Let us know what you think..."
              required
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded text-sm text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#cca050] text-black px-4 py-2 rounded font-bold"
              >
                Submit
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
