import { useState, useEffect } from "react";
import api from "../../utils/api";
import AdminWithdrawals from "./AdminWithdrawals";

const AdminDashboard = () => {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Paytm Pay");
  const [dashboardTab, setDashboardTab] = useState<'deposits' | 'withdrawals'>('deposits');

  const paymentMethods = ["Paytm Pay", "PhonePe", "Google Pay", "Others"];

  // Group deposits by method
  const groupedDeposits = paymentMethods.reduce((acc, method) => {
    acc[method] = deposits.filter(d => (d.method || "Others").toLowerCase() === method.toLowerCase());
    return acc;
  }, {} as Record<string, any[]>);
  groupedDeposits["Others"] = deposits.filter(d => !paymentMethods.slice(0,3).some(m => (d.method || "").toLowerCase() === m.toLowerCase()));

  useEffect(() => {
    const fetchDeposits = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("adminToken");
        const res = await api.get("/admin/deposits", { headers: { Authorization: `Bearer ${token}` } });
        setDeposits(res.data.deposits || []);
      } catch (err: any) {
        setError("Failed to load deposits");
      } finally {
        setLoading(false);
      }
    };
    fetchDeposits();
  }, []);

  const handleAction = async (id: number, action: "verify" | "reject") => {
    try {
      const token = localStorage.getItem("adminToken");
      await api.post(`/admin/deposits/${id}/${action}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setDeposits((prev: any[]) => prev.map((d: any) => d.id === id ? { ...d, status: action === "verify" ? "approved" : "rejected" } : d));
    } catch {
      alert("Action failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white p-8 rounded shadow relative">
      <button
        onClick={handleLogout}
        className="absolute top-6 right-8 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        title="Logout"
      >
        Logout
      </button>
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded font-semibold ${dashboardTab === 'deposits' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setDashboardTab('deposits')}
        >
          Deposits
        </button>
        <button
          className={`px-4 py-2 rounded font-semibold ${dashboardTab === 'withdrawals' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setDashboardTab('withdrawals')}
        >
          Withdrawals
        </button>
      </div>
      {dashboardTab === 'deposits' ? (
        <>
          <h2 className="text-2xl font-bold mb-6">Manual Deposit Requests</h2>
          <div className="flex gap-4 mb-6 border-b">
            {paymentMethods.map(method => (
              <button
                key={method}
                className={`px-3 py-1 rounded-t font-semibold border-b-2 ${activeTab === method ? 'border-blue-600 text-blue-700 bg-blue-100' : 'border-transparent text-gray-600 bg-gray-100'}`}
                onClick={() => setActiveTab(method)}
              >
                {method}
                <span className="ml-2 inline-block bg-blue-200 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                  {groupedDeposits[method]?.length || 0}
                </span>
              </button>
            ))}
          </div>
          {/* ...rest of deposits table rendering... */}
        </>
      ) : (
        <AdminWithdrawals />
      )}
      <div className="flex gap-4 mb-6 border-b">
        {paymentMethods.map(method => (
          <button
            key={method}
            className={`relative px-5 py-2 font-semibold border-b-2 transition-all duration-150 ${activeTab === method ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-green-600'}`}
            onClick={() => setActiveTab(method)}
          >
            {method}
            <span className={`ml-2 inline-block text-xs rounded-full px-2 py-0.5 ${groupedDeposits[method]?.length ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{groupedDeposits[method]?.length || 0}</span>
          </button>
        ))}
      </div>
      {loading ? <div>Loading...</div> : error ? <div className="text-red-600">{error}</div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-2">User</th>
                <th className="py-2 px-2">Amount</th>
                <th className="py-2 px-2">UTR</th>
                <th className="py-2 px-2">Method</th>
                <th className="py-2 px-2">Slip</th>
                <th className="py-2 px-2">Date</th>
                <th className="py-2 px-2">Status</th>
                <th className="py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(groupedDeposits[activeTab] || []).length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">No requests for {activeTab}.</td></tr>
              ) : (
                groupedDeposits[activeTab]?.map(d => (
                  <tr key={d.id} className="border-b hover:bg-gray-50 transition">
                    <td className="py-2 px-2">{d.name}</td>
                    <td className="py-2 px-2">₹{d.amount}</td>
                    <td className="py-2 px-2">{d.utr}</td>
                    <td className="py-2 px-2">{d.method}</td>
                    <td className="py-2 px-2">{d.slipUrl ? <a href={`https://rj-755j.onrender.com${d.slipUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a> : "-"}</td>
                    <td className="py-2 px-2">{new Date(d.createdAt).toLocaleString()}</td>
                    <td className="py-2 px-2 capitalize">{d.status}</td>
                    <td className="py-2 px-2">
                      {d.status === "pending" && (
                        <>
                          <button className="bg-green-600 text-white px-2 py-1 rounded mr-2 hover:bg-green-700" onClick={() => handleAction(d.id, "verify")}>Approve</button>
                          <button className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700" onClick={() => handleAction(d.id, "reject")}>Reject</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
