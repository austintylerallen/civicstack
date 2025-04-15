import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import api from "../utils/axios";
import { toast } from "react-toastify";

const statuses = ["Submitted", "Reviewed", "Interviewing", "Hired", "Rejected"];

export default function AdminJobDetailModal({ job, onClose }) {
  const isOpen = !!job;
  const [applicants, setApplicants] = useState([]);
  const [filters, setFilters] = useState({ status: "" });
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    if (job?._id) fetchApplicants();
  }, [job, filters, sortOrder]);

  const fetchApplicants = async () => {
    try {
      const res = await api.get("/careers/applicants");
      let filtered = res.data.filter(
        (a) =>
          a.jobTitle === job.title &&
          (!filters.status || (a.status || "Submitted").includes(filters.status))
      );

      if (sortOrder === "newest") {
        filtered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else {
        filtered = filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      }

      setApplicants(filtered);
    } catch (err) {
      toast.error("Error fetching applicants");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/careers/applicants/${id}/status`, { status: newStatus });
      toast.success("Applicant status updated.");
      fetchApplicants();
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  return (
    <Dialog open={isOpen} onClose={() => onClose?.()} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-[#15202e] text-white max-w-lg w-full p-6 rounded-lg shadow-xl">
          <Dialog.Title className="text-xl font-bold mb-4">{job?.title || "Job Details"}</Dialog.Title>

          <p className="text-sm text-gray-300 mb-1">Department: {job?.department || "N/A"}</p>
          <p className="text-sm text-gray-300 mb-1">Location: {job?.location || "N/A"}</p>
          <p className="text-sm text-gray-400 mt-4 whitespace-pre-line">
            {job?.description || "No description available."}
          </p>

          <div className="mt-6">
            <h3 className="text-md font-semibold mb-2">Applicants</h3>

            <div className="mb-4 grid grid-cols-2 gap-2">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="bg-[#1c2a3a] text-white p-2 rounded"
              >
                <option value="">All Statuses</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <select
                className="bg-[#1c2a3a] text-white p-2 rounded"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            {applicants.length > 0 ? (
              <ul className="space-y-2 text-sm max-h-48 overflow-auto">
                {applicants.map((a) => (
                  <li key={a._id} className="bg-[#1c2a3a] p-2 rounded">
                    <p className="font-medium">{a.fullName}</p>
                    <p className="text-gray-400 text-xs">{a.email}</p>
                    <p className="text-gray-500 text-xs mb-1">{new Date(a.createdAt).toLocaleDateString()}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <select
                        className="bg-[#252f3e] text-white text-xs p-1 rounded"
                        value={a.status || "Submitted"}
                        onChange={(e) => handleStatusChange(a._id, e.target.value)}
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">No applicants for this job yet.</p>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => onClose?.()}
              className="bg-[#cca050] text-black font-semibold px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
