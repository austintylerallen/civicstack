import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import api from "../utils/axios";

export default function Settings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: "", email: "", department: "" });
  const [password, setPassword] = useState({ current: "", new: "" });
  const [departments, setDepartments] = useState([]);
  const [newDept, setNewDept] = useState("");

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name || "", email: user.email || "", department: user.department || "" });
    }
    fetchDepartments();
  }, [user]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error("Error loading departments", err);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.patch("/users/profile", profile);
      alert("Profile updated.");
    } catch (err) {
      alert("Failed to update profile.");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await api.post("/users/change-password", password);
      alert("Password changed.");
    } catch (err) {
      alert("Failed to change password.");
    }
  };

  const handleNewDept = async () => {
    if (!newDept.trim()) return;
    try {
      const res = await api.post("/departments", { name: newDept });
      setDepartments((prev) => [...prev, res.data]);
      setNewDept("");
    } catch (err) {
      alert("Failed to add department.");
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 p-6 w-full min-h-screen bg-[#121620] text-white">
        <h1 className="text-3xl font-bold mb-6">⚙️ Settings</h1>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">👤 Profile</h2>
          <form onSubmit={handleProfileUpdate} className="bg-[#15202e] p-6 rounded-lg space-y-4">
            <input type="text" name="name" value={profile.name} onChange={handleProfileChange} placeholder="Name" className="bg-[#1c2a3a] p-2 rounded w-full" />
            <input type="email" name="email" value={profile.email} onChange={handleProfileChange} placeholder="Email" className="bg-[#1c2a3a] p-2 rounded w-full" readOnly />
            <select name="department" value={profile.department} onChange={handleProfileChange} className="bg-[#1c2a3a] p-2 rounded w-full">
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d._id} value={d.name}>{d.name}</option>
              ))}
            </select>
            <button type="submit" className="bg-[#cca050] text-black px-4 py-2 rounded font-semibold w-full">💾 Save Profile</button>
          </form>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">🔐 Change Password</h2>
          <form onSubmit={handlePasswordChange} className="bg-[#15202e] p-6 rounded-lg space-y-4">
            <input type="password" placeholder="Current Password" value={password.current} onChange={(e) => setPassword({ ...password, current: e.target.value })} className="bg-[#1c2a3a] p-2 rounded w-full" />
            <input type="password" placeholder="New Password" value={password.new} onChange={(e) => setPassword({ ...password, new: e.target.value })} className="bg-[#1c2a3a] p-2 rounded w-full" />
            <button type="submit" className="bg-[#cca050] text-black px-4 py-2 rounded font-semibold w-full">🔄 Change Password</button>
          </form>
        </section>

        {user?.role === "admin" && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">🏢 Manage Departments</h2>
            <div className="bg-[#15202e] p-6 rounded-lg space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New department name"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="bg-[#1c2a3a] p-2 rounded w-full"
                />
                <button onClick={handleNewDept} className="bg-[#cca050] text-black px-4 py-2 rounded font-semibold">➕ Add</button>
              </div>
              <ul className="text-sm text-gray-300 list-disc list-inside">
                {departments.map((d) => <li key={d._id}>{d.name}</li>)}
              </ul>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}