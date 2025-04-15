import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import api from "../utils/axios";
import { toast } from "react-toastify";

const statuses = ["Submitted", "Reviewed", "Interviewing", "Hired", "Rejected"];

export default function AdminApplicantModal({ isOpen, onClose, applicant, refresh }) {
  const [status, setStatus] = useState("Submitted");

  useEffect(() => {
    if (applicant?.status) {
      setStatus(applicant.status);
    }
  }, [applicant]);

  const handleStatusUpdate = async () => {
    try {
      await api.put(`/careers/applicants/${applicant._id}/status`, { status });
      toast.success("Status updated!");
      refresh();
      onClose();
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  if (!applicant) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-[#15202e] text-white max-w-lg w-full p-6 rounded-lg shadow-xl">
          <Dialog.Title className="text-xl font-bold mb-2">{applicant.fullName || "Applicant Details"}</Dialog.Title>
          <p className="text-sm text-gray-300 mb-1">{applicant.email || "No email provided"}</p>
          <p className="text-sm text-gray-400 mb-4">For: {applicant.jobTitle || "Unknown Position"}</p>

          {applicant.answers?.whyInterested && (
            <div className="mb-4">
              <p className="text-sm font-semibold">Why Interested:</p>
              <p className="text-sm text-gray-300 whitespace-pre-line">{applicant.answers.whyInterested}</p>
            </div>
          )}

          {applicant.answers?.experience && (
            <div className="mb-4">
              <p className="text-sm font-semibold">Experience:</p>
              <p className="text-sm text-gray-300 whitespace-pre-line">{applicant.answers.experience}</p>
            </div>
          )}

          {applicant.resumeUrl && (
            <div className="mb-4">
              {applicant.resumeUrl.endsWith(".pdf") ? (
                <embed
                  src={applicant.resumeUrl}
                  type="application/pdf"
                  width="100%"
                  height="250px"
                  className="rounded border border-[#1f2a3c]"
                />
              ) : (
                <a
                  href={applicant.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#cca050] text-xs underline"
                >
                  View Resume
                </a>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <select
              className="bg-[#1c2a3a] text-white p-2 rounded"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              onClick={handleStatusUpdate}
              className="bg-[#cca050] text-black font-semibold px-4 py-1.5 rounded"
            >
              Update
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
