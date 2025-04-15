import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import api from "../utils/axios";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import { Link } from "react-router-dom";
import FeedbackModal from "../components/FeedbackModal";
import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:5173");


export default function Dashboard() {
  const { user, logout } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalIssues: 0,
    issuesByStatus: {},
    issuesByDepartment: {},
    issuesByPriority: {},
    recentIssues: [],
    totalForms: 0,
    formsByType: {},
    formsByStatus: {},
    recentActivity: [],
    departmentSummary: [],
  });

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // ⛏️ Add missing state for filtering and sorting
  const [filterText, setFilterText] = useState("");
  const [sortKey, setSortKey] = useState("department");
  const [sortOrder, setSortOrder] = useState("asc");

  const filteredAndSortedDepartments = analytics.departmentSummary
    .filter((d) =>
      d.department.toLowerCase().includes(filterText.toLowerCase())
    )
    .sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      return sortOrder === "asc"
        ? valA > valB
          ? 1
          : -1
        : valA < valB
        ? 1
        : -1;
    });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/admin/analytics");
        setAnalytics(res.data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
      }
    };

    const fetchNotifications = async () => {
      try {
        const res = await api.get("/admin/notifications");
        setNotifications(res.data);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchAnalytics();
    fetchNotifications();

    socket.on("new-activity", fetchAnalytics);
    socket.on("new-notification", fetchNotifications);

    return () => {
      socket.off("new-activity", fetchAnalytics);
      socket.off("new-notification", fetchNotifications);
    };
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 p-10 w-full min-h-screen bg-[#121620] text-white">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-lg">
              Welcome back, <strong>{user?.name}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                className="relative focus:outline-none"
              >
                🔔
                {notifications.some((n) => !n.isRead) && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {notifications.filter((n) => !n.isRead).length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-[#1f2e3d] text-sm rounded-lg shadow-xl z-50">
                  <div className="p-3 font-bold text-[#cca050] border-b border-[#2c3e50] flex justify-between items-center">
                    Notifications
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-white text-sm"
                    >
                      ×
                    </button>
                  </div>
                  <ul className="max-h-64 overflow-y-auto divide-y divide-[#2c3e50]">
                    {notifications.length > 0 ? (
                      notifications.map((note, i) => (
                        <li
                          key={i}
                          onClick={async () => {
                            if (!note.isRead) {
                              await api.patch(
                                `/admin/notifications/${note._id}/read`
                              );
                              setNotifications((prev) =>
                                prev.map((n) =>
                                  n._id === note._id
                                    ? { ...n, isRead: true }
                                    : n
                                )
                              );
                            }
                          }}
                          className={`p-3 cursor-pointer ${
                            note.isRead
                              ? "text-gray-400"
                              : "text-white font-semibold"
                          } hover:bg-[#2a3b4d]`}
                        >
                          {note.message}
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(note.createdAt).toLocaleString()}
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="p-3 text-gray-400">No notifications</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="flex gap-4 mb-6">
          <Link
            to="/issues"
            className="bg-[#cca050] text-black font-semibold px-4 py-2 rounded shadow hover:bg-yellow-600"
          >
            + New Issue
          </Link>
          <Link
            to="/form-requests"
            className="bg-[#cca050] text-black font-semibold px-4 py-2 rounded shadow hover:bg-yellow-600"
          >
            Submit Form
          </Link>
          <Link
            to="/workorders"
            className="bg-[#cca050] text-black font-semibold px-4 py-2 rounded shadow hover:bg-yellow-600"
          >
            Assign Work Order
          </Link>
        </div>

        <p className="text-sm text-gray-400 mb-6">
          Real-time updates enabled with Socket.IO ✅
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

          {/* ⬇️ Include all your widgets exactly as you wrote them */}
          {/* Keep your: */}
          {/* ✅ Recent Activity Widget */}
          {/* ✅ Department Summary Widget */}
          {/* ✅ Total Issues Widget */}
          {/* ✅ Form Requests Widget */}
          {/* ✅ Issues by Status Chart */}
          {/* ✅ Issues by Department Chart */}
          {/* ✅ Issues by Priority Chart */}
          {/* ✅ Feedback Modal at the bottom */}
          {/* ⬆️ They are already correct and placed inside the grid ✅ */}

        </div>

        


        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-10">

          {/* Recent Activity Widget */}
          <div className="bg-[#15202e] p-6 rounded-2xl shadow-xl col-span-full xl:col-span-2">
            <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>

            {analytics.recentActivity?.length > 0 ? (
              <>
                <ul className="space-y-3">
                  {(showAllActivity
                    ? analytics.recentActivity
                    : analytics.recentActivity.slice(0, 3)
                  ).map((log, i) => (
                    <li key={i} className="text-sm text-white border-b border-[#1f2e3d] pb-2">
                      <p className="font-semibold text-[#cca050]">{log.user?.name || "Unknown User"}</p>
                      <p className="text-gray-300">
                        {log.action} in <span className="text-[#cca050]">{log.module}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>

                {analytics.recentActivity.length > 3 && (
                  <button
                    onClick={() => setShowAllActivity((prev) => !prev)}
                    className="text-sm mt-3 text-[#cca050] hover:underline"
                  >
                    {showAllActivity ? "Show Less" : "→ View More"}
                  </button>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-400">No recent activity found.</p>
            )}
          </div>

               {/* Department Summary Widget */}
<div className="col-span-full bg-[#15202e] p-6 rounded-2xl shadow-xl mt-2">
  <h3 className="text-xl font-semibold mb-4">Department Summary</h3>
  <div className="overflow-auto">
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
  <input
    type="text"
    placeholder="Filter by department..."
    value={filterText}
    onChange={(e) => setFilterText(e.target.value)}
    className="bg-[#1c2a3a] text-white px-4 py-2 rounded text-sm w-full md:w-64"
  />

  <div className="flex gap-2">
    <select
      value={sortKey}
      onChange={(e) => setSortKey(e.target.value)}
      className="bg-[#1c2a3a] text-white px-3 py-2 rounded text-sm"
    >
      <option value="department">Department</option>
      <option value="openIssues">Open Issues</option>
      <option value="formCount">Form Requests</option>
    </select>

    <select
      value={sortOrder}
      onChange={(e) => setSortOrder(e.target.value)}
      className="bg-[#1c2a3a] text-white px-3 py-2 rounded text-sm"
    >
      <option value="asc">Asc</option>
      <option value="desc">Desc</option>
    </select>
  </div>
</div>

    <table className="w-full text-sm text-left text-white border-collapse">
      <thead className="text-xs uppercase bg-[#1c2a3a] text-[#cca050]">
        <tr>
          <th scope="col" className="px-4 py-3">Department</th>
          <th scope="col" className="px-4 py-3">Open Issues</th>
          <th scope="col" className="px-4 py-3">Form Requests</th>
        </tr>
      </thead>
      <tbody>
      {filteredAndSortedDepartments.map((row, idx) => (

          <tr key={idx} className="border-b border-[#1f2e3d]">
            <td className="px-4 py-2">{row.department}</td>
            <td className="px-4 py-2 text-[#34a853]">{row.openIssues}</td>
            <td className="px-4 py-2 text-[#4285f4]">{row.formCount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

          {/* Total Issues Widget */}
          <div className="bg-[#15202e] p-6 rounded-2xl shadow-xl">
            <h3 className="text-xl font-semibold mb-2">Total Issues</h3>
            <p className="text-4xl font-bold mb-4">{analytics.totalIssues}</p>

            <h4 className="text-md font-semibold text-gray-300 mb-2">Recent Issues</h4>
            {analytics.recentIssues?.length > 0 ? (
              <ul className="space-y-2 mb-4">
                {analytics.recentIssues.map((issue) => (
                  <li key={issue._id} className="text-sm text-white border-b border-[#1f2e3d] pb-2">
                    <p className="font-medium text-[#cca050]">{issue.title}</p>
                    <p className="text-gray-400 text-xs">
                      {issue.department} • {issue.status} •{" "}
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm mb-4">No recent issues.</p>
            )}

            <Link
              to="/issues"
              className="inline-block text-sm font-medium text-[#cca050] hover:underline"
            >
              → View All Issues
            </Link>
          </div>

          {/* Form Requests Widget */}
          <div className="bg-[#15202e] p-6 rounded-2xl shadow-xl">
            <h3 className="text-xl font-semibold mb-2">Form Requests</h3>
            <p className="text-4xl font-bold mb-4">{analytics.totalForms || 0}</p>

            <div className="text-sm text-gray-300 space-y-1 mb-4">
              {Object.entries(analytics.formsByType || {}).map(([type, count]) => (
                <p key={type}><span className="text-white font-semibold">{count}</span> {type}</p>
              ))}
            </div>

            <div className="text-sm text-gray-300 space-y-1 mb-4">
              <h4 className="text-white font-semibold mb-1">By Status:</h4>
              {Object.entries(analytics.formsByStatus || {}).map(([status, count]) => (
                <p key={status}><span className="text-white font-semibold">{count}</span> {status}</p>
              ))}
            </div>

            <Link
              to="/form-requests"
              className="inline-block text-sm font-medium text-[#cca050] hover:underline"
            >
              → View All Forms
            </Link>
          </div>

          {/* Issues by Status (Bar Chart) */}
          <div className="bg-[#15202e] p-6 rounded-2xl shadow-xl">
            <h3 className="text-xl font-semibold">Issues by Status</h3>
            <div style={{ height: "300px" }}>
              <ResponsiveBar
                data={Object.entries(analytics.issuesByStatus).map(([status, count]) => ({
                  status,
                  count,
                }))}
                keys={["count"]}
                indexBy="status"
                margin={{ top: 20, right: 30, bottom: 60, left: 40 }}
                padding={0.3}
                colors={['#cca050', '#34a853', '#4285f4']}
                axisBottom={{
                  tickRotation: -45,
                  legend: "Status",
                  legendPosition: "middle",
                  legendOffset: 40,
                  tickColor: "#cca050",
                  tickTextColor: "#fff",
                }}
                axisLeft={{
                  legend: "Issues",
                  legendPosition: "middle",
                  legendOffset: -40,
                  tickColor: "#cca050",
                  tickTextColor: "#fff",
                  tickValues: 5.0 // ✅ Force tick increment of 5
                }}
                
                enableLabel={false}
                theme={{
                  axis: {
                    domain: { line: { stroke: "#cca050" } },
                    ticks: {
                      line: { stroke: "#cca050" },
                      text: { fill: "#fff" },
                    },
                  },
                  legends: { text: { fill: "#cca050" } },
                  labels: { text: { fill: "#cca050" } },
                }}
              />
            </div>
          </div>

          {/* Issues by Department (Pie Chart) */}
          <div className="bg-[#15202e] p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center">
            <h3 className="text-xl font-semibold mb-2 text-center">Issues by Department</h3>
            <div className="w-full h-[300px]">
              <ResponsivePie
                data={Object.entries(analytics.issuesByDepartment).map(([dept, count]) => ({
                  id: dept,
                  label: dept,
                  value: count,
                }))}
                margin={{ top: 20, right: 80, bottom: 40, left: 80 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                colors={['#cca050', '#34a853', '#4285f4', '#fbbc05', '#db4437']}
                borderWidth={1}
                borderColor={{ from: "color", modifiers: [["darker", 0.6]] }}
                arcLabelsTextColor="#fff"
                arcLinkLabelsTextColor="#fff"
                arcLinkLabelsColor={{ from: "color" }}
                theme={{
                  tooltip: {
                    container: {
                      background: "#15202e",
                      color: "#fff",
                    },
                  },
                  legends: {
                    text: { fill: "#cca050" },
                  },
                }}
              />
            </div>
          </div>

 {/* Issues by Priority (Pie Chart) */}
<div className="bg-[#15202e] p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center xl:col-span-1">
  <h3 className="text-xl font-semibold mb-2 text-center">Issues by Priority</h3>
  <div className="w-full h-[300px]">
    <ResponsivePie
      data={Object.entries(analytics.issuesByPriority).map(([priority, count]) => ({
        id: priority,
        label: priority,
        value: count,
      }))}
      margin={{ top: 20, right: 80, bottom: 40, left: 80 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      colors={["#db4437", "#fbbc05", "#34a853"]}
      borderWidth={1}
      borderColor={{ from: "color", modifiers: [["darker", 0.6]] }}
      arcLabelsTextColor="#fff"
      arcLinkLabelsTextColor="#fff"
      arcLinkLabelsColor={{ from: "color" }}
      theme={{
        tooltip: {
          container: {
            background: "#15202e",
            color: "#fff",
          },
        },
        legends: {
          text: { fill: "#cca050" },
        },
      }}
    />
  </div>
</div>

{/* 📈 Issue Submission Trend (14 Days) */}
<div className="bg-[#15202e] p-6 rounded-2xl shadow-xl flex flex-col justify-center xl:col-span-1">
  <h3 className="text-xl font-semibold mb-2 text-center">Issue Trend (14 Days)</h3>
  <div className="w-full h-[300px]">
    <ResponsiveBar
      data={
        analytics.issueTrend?.map((entry) => ({
          date: entry._id,
          count: entry.count,
        })) || []
      }
      keys={["count"]}
      indexBy="date"
      margin={{ top: 20, right: 30, bottom: 60, left: 40 }}
      padding={0.3}
      colors={["#cca050"]}
      axisBottom={{
        tickRotation: -45,
        legend: "Date",
        legendPosition: "middle",
        legendOffset: 40,
        tickColor: "#cca050",
        tickTextColor: "#fff",
      }}
      axisLeft={{
        legend: "Issues",
        legendPosition: "middle",
        legendOffset: -40,
        tickColor: "#cca050",
        tickTextColor: "#fff",
      }}
      enableLabel={false}
      theme={{
        axis: {
          domain: { line: { stroke: "#cca050" } },
          ticks: {
            line: { stroke: "#cca050" },
            text: { fill: "#fff" },
          },
        },
        legends: { text: { fill: "#cca050" } },
        labels: { text: { fill: "#cca050" } },
        tooltip: {
          container: {
            background: "#1c2a3a",
            color: "#fff",
          },
        },
      }}
    />
  </div>
</div>



{/* 🧾 Recent Submitted Forms */}
<div className="bg-[#15202e] p-6 rounded-2xl shadow-xl col-span-full xl:col-span-2">
  <h3 className="text-xl font-semibold mb-4">Recent Form Submissions</h3>
  {analytics.recentForms?.length > 0 ? (
    <ul className="space-y-3">
      {analytics.recentForms.slice(0, 5).map((form, i) => (
        <li key={i} className="text-sm text-white border-b border-[#1f2e3d] pb-2">
          <p className="font-medium text-[#cca050]">{form.type}</p>
          <p className="text-gray-300">
            {form.user?.name || "Unknown"} • {form.department}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(form.createdAt).toLocaleString()}
          </p>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-sm text-gray-400">No recent forms found.</p>
  )}
</div>

{/* 🔧 Work Order Summary */}
<div className="bg-[#15202e] p-6 rounded-2xl shadow-xl">
  <h3 className="text-xl font-semibold mb-4">Work Order Summary</h3>
  <div className="flex flex-col gap-2">
    <div className="flex justify-between text-sm">
      <span className="text-white">Open Work Orders</span>
      <span className="text-[#34a853] font-semibold">{analytics.workOrders?.open || 0}</span>
    </div>
    <div className="flex justify-between text-sm">
      <span className="text-white">In Progress</span>
      <span className="text-yellow-400 font-semibold">{analytics.workOrders?.inProgress || 0}</span>
    </div>
    <div className="flex justify-between text-sm">
      <span className="text-white">Completed</span>
      <span className="text-[#4285f4] font-semibold">{analytics.workOrders?.completed || 0}</span>
    </div>
  </div>
</div>

{/* 👥 User Stats */}
<div className="bg-[#15202e] p-6 rounded-2xl shadow-xl">
  <h3 className="text-xl font-semibold mb-4">User Overview</h3>
  <div className="text-sm text-gray-300 space-y-2">
    <p><span className="text-white font-bold">{analytics.users?.total || 0}</span> total users</p>
    <p><span className="text-white font-bold">{analytics.users?.admins || 0}</span> admins</p>
    <p><span className="text-white font-bold">{analytics.users?.staff || 0}</span> staff</p>
    <p><span className="text-white font-bold">{analytics.users?.invited || 0}</span> pending invites</p>
  </div>
</div>


{/* ⏱️ Average Resolution Time */}
<div className="bg-[#15202e] p-6 rounded-2xl shadow-xl flex flex-col justify-center items-center">
  <h3 className="text-xl font-semibold mb-2 text-center">Avg Resolution Time</h3>
  <p className="text-4xl font-bold text-[#cca050]">
    {analytics.avgResolutionTime || "N/A"}
  </p>
  <p className="text-sm text-gray-400 mt-1">based on resolved issues</p>
</div>



          <FeedbackModal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />


        </div>
      </main>
    </div>
  );
}
