import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { toast } from "react-toastify";
import api from "../utils/axios";

export default function UserApplicationModal({ isOpen, onClose, job }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    resume: null,
    jobId: job?._id || "",
    whyInterested: "",
    experience: "",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "resume") {
      setForm((prev) => ({ ...prev, resume: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, val]) => data.append(key, val));
      await api.post("/careers/apply", data);
      toast.success("Application submitted!");
      onClose();
    } catch (err) {
      toast.error("Error submitting application.");
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-[#15202e] text-white max-w-lg w-full p-6 rounded-lg shadow-xl">
          <Dialog.Title className="text-xl font-bold text-[#cca050] mb-4">
            Apply for: {job?.title}
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              className="bg-[#1c2a3a] p-2 rounded"
              value={form.fullName}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="bg-[#1c2a3a] p-2 rounded"
              value={form.email}
              onChange={handleChange}
              required
            />
            <textarea
              name="whyInterested"
              placeholder="Why are you interested in this role?"
              className="bg-[#1c2a3a] p-2 rounded"
              value={form.whyInterested}
              onChange={handleChange}
              required
            />
            <textarea
              name="experience"
              placeholder="Relevant experience or skills?"
              className="bg-[#1c2a3a] p-2 rounded"
              value={form.experience}
              onChange={handleChange}
              required
            />
            <input
              type="file"
              name="resume"
              onChange={handleChange}
              className="text-sm"
              required
            />
            <button
              type="submit"
              className="bg-[#cca050] text-black font-semibold px-4 py-2 rounded"
            >
              Submit Application
            </button>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
