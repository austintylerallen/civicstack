import { useState } from "react";
import api from "../utils/axios";

export default function WorkOrderForm({ onCreated }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    department: "",
    priority: "Low",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await api.post("/work-orders", form);
      onCreated?.(res.data); // optional callback
      setForm({
        title: "",
        description: "",
        department: "",
        priority: "Low",
      });
    } catch (err) {
      setError("Failed to create work order");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#15202e] p-6 rounded-xl text-white space-y-4 shadow-xl"
    >
      <h2 className="text-xl font-bold">Submit Work Order</h2>

      {error && <p className="text-red-400">{error}</p>}

      <input
        type="text"
        name="title"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
        className="w-full bg-[#1c2a3a] px-4 py-2 rounded"
        required
      />

      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        rows={3}
        className="w-full bg-[#1c2a3a] px-4 py-2 rounded"
      />

      <input
        type="text"
        name="department"
        placeholder="Department"
        value={form.department}
        onChange={handleChange}
        className="w-full bg-[#1c2a3a] px-4 py-2 rounded"
        required
      />

      <select
        name="priority"
        value={form.priority}
        onChange={handleChange}
        className="w-full bg-[#1c2a3a] px-4 py-2 rounded"
      >
        <option value="Low">Low Priority</option>
        <option value="Medium">Medium Priority</option>
        <option value="High">High Priority</option>
      </select>

      <button
        type="submit"
        disabled={submitting}
        className="bg-[#cca050] text-black px-4 py-2 rounded font-semibold hover:opacity-90"
      >
        {submitting ? "Submitting..." : "Submit Work Order"}
      </button>
    </form>
  );
}
