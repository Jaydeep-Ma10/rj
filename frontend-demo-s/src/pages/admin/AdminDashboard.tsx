import { useState, useEffect } from "react";
import api from "../../utils/api";
import { buildAssetUrl } from "../../config/api";
import AdminWithdrawals from "./AdminWithdrawals";
import { FaPowerOff } from "react-icons/fa";

const AdminDashboard = () => {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Paytm Pay");
  const [dashboardTab, setDashboardTab] = useState<"deposits" | "withdrawals">(
    "deposits"
  );

  const paymentMethods = ["Paytm Pay", "PhonePe", "Google Pay", "Others"];

  // Helper function to construct proper slip URL
  const getSlipUrl = (deposit: any) => {
    // Priority: slipViewUrl (signed S3 URL) > absolute slipUrl > relative slipUrl with base
    if (deposit.slipViewUrl) {
      return deposit.slipViewUrl;
    }

    if (deposit.slipUrl) {
      // If it's already an absolute URL (starts with http/https), use it directly
      if (
        deposit.slipUrl.startsWith("http://") ||
        deposit.slipUrl.startsWith("https://")
      ) {
        return deposit.slipUrl;
      }

      // Otherwise, it's a relative URL, prepend the base URL
      return buildAssetUrl(deposit.slipUrl);
    }

    return null;
  };

  // Group deposits by method
  const groupedDeposits = paymentMethods.reduce((acc, method) => {
    acc[method] = deposits.filter(
      (d) => (d.method || "Others").toLowerCase() === method.toLowerCase()
    );
    return acc;
  }, {} as Record<string, any[]>);
  groupedDeposits["Others"] = deposits.filter(
    (d) =>
      !paymentMethods
        .slice(0, 3)
        .some((m) => (d.method || "").toLowerCase() === m.toLowerCase())
  );

  useEffect(() => {
    const fetchDeposits = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("adminToken");
        const res = await api.get("/admin/deposits", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Fetched deposits:", res.data.deposits);
        setDeposits(res.data.deposits || []);
      } catch (err: any) {
        setError("Failed to load deposits");
      } finally {
        setLoading(false);
      }
    };
    fetchDeposits();
  }, []);

  const handleAction = async (id: number, action: "approve" | "reject") => {
    try {
      const token = localStorage.getItem("adminToken");
      const endpoint = action === "approve" ? "verify" : "reject";

      // Use POST method and correct endpoint
      await api.post(
        `/admin/deposits/${id}/${endpoint}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update the UI optimistically
      setDeposits((prev: any[]) =>
        prev.map((d: any) =>
          d.id === id
            ? {
                ...d,
                status: action === "approve" ? "approved" : "rejected",
              }
            : d
        )
      );

      alert(`Deposit request ${action}d successfully!`);
    } catch (error: any) {
      console.error(`Failed to ${action} deposit:`, error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Unknown error occurred";
      alert(`Failed to ${action} deposit: ${errorMessage}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  };

  return (
    <>
      <div className="relative flex flex-col items-center justify-center w-full text-white px-2 py-3 bg-[#2B3270]">
        <div className="flex items-center justify-center">
          <h2 className="text-lg font-bold">Admin Dashboard</h2>
        </div>
      </div>
      <div className="max-w-5xl mx-auto mt-10 p-8 rounded shadow relative">
        <div className="flex justify-center items-center gap-4 mb-6">
          <button
            className={`relative px-4 py-2 rounded font-semibold transition-all
      ${
        dashboardTab === "deposits"
          ? " text-white after:content-[''] after:absolute after:bottom-[-6px] after:left-0 after:right-0 after:h-[2px] after:bg-[#66A9FF]"
          : " text-white"
      }`}
            onClick={() => setDashboardTab("deposits")}
          >
            Deposits
          </button>

          <button
            className={`relative px-4 py-2 rounded font-semibold transition-all
      ${
        dashboardTab === "withdrawals"
          ? " text-white after:content-[''] after:absolute after:bottom-[-6px] after:left-0 after:right-0 after:h-[2px] after:bg-[#66A9FF]"
          : " text-white"
      }`}
            onClick={() => setDashboardTab("withdrawals")}
          >
            Withdrawals
          </button>
        </div>

        {dashboardTab === "deposits" ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 px-4 mb-6 text-center  py-4 rounded">
              {paymentMethods.map((method) => (
                <button
                  key={method}
                  className={`relative px-5 py-2 font-semibold border-b-2 transition-all duration-150 rounded ${
                    activeTab === method
                      ? "bg-[#61A9FF] border-green-600 text-white"
                      : "bg-[#2B3270] border-transparent text-gray-200 hover:text-white hover:border-[#61A9FF]"
                  }`}
                  onClick={() => setActiveTab(method)}
                >
                  {method} <br />
                  <span
                    className={`ml-2 inline-block text-xs rounded-full px-2 py-0.5 ${
                      groupedDeposits[method]?.length
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {groupedDeposits[method]?.length || 0}
                  </span>
                </button>
              ))}
            </div>

           {loading ? (
  <div className="bg-[#1e2d5c] text-white rounded-xl p-3 sm:p-4 md:p-6 mt-3 md:mt-4">
    <h2 className="text-base md:text-lg lg:text-xl font-bold mb-3 md:mb-4 text-center">
      💳 Deposits
    </h2>
    <div className="text-center text-gray-400 py-8">
      <div className="text-3xl mb-2">⏳</div>
      <p className="text-sm md:text-base">Loading...</p>
    </div>
  </div>
) : error ? (
  <div className="bg-[#1e2d5c] text-white rounded-xl p-3 sm:p-4 md:p-6 mt-3 md:mt-4">
    <h2 className="text-base md:text-lg lg:text-xl font-bold mb-3 md:mb-4 text-center">
      💳 Deposits
    </h2>
    <div className="text-center text-red-400 py-8">
      <div className="text-3xl mb-2">❌</div>
      <p className="text-sm md:text-base">{error}</p>
    </div>
  </div>
) : (
  <div className="bg-[#2B3270] text-white rounded-xl">
    {/* Mobile View */}
    <div className="block sm:hidden overflow-x-auto">
      <table className="w-full text-xs sm:text-sm md:text-base table-auto">
        <thead>
          <tr className="bg-[#374992] text-white">
            <th className="py-3 px-3 text-center font-semibold">User</th>
            <th className="py-3 px-3 text-center font-semibold">Amount</th>
            <th className="py-3 px-3 text-center font-semibold">UTR</th>
            <th className="py-3 px-3 text-center font-semibold">Method</th>
            <th className="py-3 px-3 text-center font-semibold">Slip</th>
            <th className="py-3 px-3 text-center font-semibold">Date</th>
            <th className="py-3 px-3 text-center font-semibold">Status</th>
            <th className="py-3 px-3 text-center font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {(groupedDeposits[activeTab] || []).length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="text-center py-8 text-gray-400"
              >
                <div className="text-3xl mb-2">📋</div>
                <p className="text-sm md:text-base">No requests for {activeTab}</p>
              </td>
            </tr>
          ) : (
            groupedDeposits[activeTab]?.map((d, index) => (
              <tr
                key={d.id}
                className={`border-b border-gray-700 hover:bg-[#33416d] ${
                  index === 0 ? ' bg-green-900/20' : ''
                }`}
              >
                <td className="py-2 px-3 text-center text-xs">{d.name}</td>
                <td className="py-2 px-3 text-center">
                  <span className="font-bold text-lg text-green-500">₹{d.amount}</span>
                </td>
                <td className="py-2 px-3 text-center text-xs font-mono">{d.utr}</td>
                <td className="py-2 px-3 text-center">
                  <span className="px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300">
                    {d.method}
                  </span>
                </td>
                <td className="py-2 px-3 text-center">
                  {getSlipUrl(d) ? (
                    <a
                      href={getSlipUrl(d)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 underline hover:text-blue-300 text-xs"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="py-2 px-3 text-center text-xs">
                  {new Date(d.createdAt).toLocaleDateString()}
                </td>
                <td className="py-2 px-3 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs capitalize ${
                      String(d.status).toLowerCase() === "approved"
                        ? "bg-green-500/20 text-green-300"
                        : String(d.status).toLowerCase() === "rejected"
                        ? "bg-red-500/20 text-red-300"
                        : "bg-orange-500/20 text-orange-300"
                    }`}
                  >
                    {d.status}
                  </span>
                </td>
                <td className="py-2 px-3 text-center">
                  <div className="flex justify-center items-center space-x-1">
                    {d.status &&
                      String(d.status).toLowerCase() === "pending" && (
                        <>
                          <button
                            className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 text-xs"
                            onClick={() =>
                              handleAction(d.id, "approve")
                            }
                          >
                            ✓
                          </button>
                          <button
                            className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-xs"
                            onClick={() => handleAction(d.id, "reject")}
                          >
                            ✕
                          </button>
                        </>
                      )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {/* Desktop View */}
    <div className="hidden sm:block overflow-x-auto">
      <table className="w-full text-sm md:text-base table-auto">
        <thead>
          <tr className="bg-[#293b6a] text-white">
            <th className="py-3 px-4 text-left font-semibold">User</th>
            <th className="py-3 px-4 text-center font-semibold">Amount</th>
            <th className="py-3 px-4 text-center font-semibold">UTR</th>
            <th className="py-3 px-4 text-center font-semibold">Method</th>
            <th className="py-3 px-4 text-center font-semibold">Slip</th>
            <th className="py-3 px-4 text-center font-semibold">Date</th>
            <th className="py-3 px-4 text-center font-semibold">Status</th>
            <th className="py-3 px-4 text-center font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {(groupedDeposits[activeTab] || []).length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="text-center py-8 text-gray-400"
              >
                <div className="text-3xl mb-2">📋</div>
                <p className="text-sm md:text-base">No requests for {activeTab}</p>
              </td>
            </tr>
          ) : (
            groupedDeposits[activeTab]?.map((d, index) => (
              <tr
                key={d.id}
                className={`border-b border-gray-700 hover:bg-[#33416d] ${
                  index === 0 ? 'animate-pulse bg-green-900/20' : ''
                }`}
              >
                <td className="py-2 px-4 font-mono text-sm md:text-base">{d.name}</td>
                <td className="py-2 px-4 text-center">
                  <span className="font-bold text-lg md:text-xl text-green-500">₹{d.amount}</span>
                </td>
                <td className="py-2 px-4 text-center font-mono">{d.utr}</td>
                <td className="py-2 px-4 text-center">
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300">
                    {d.method}
                  </span>
                </td>
                <td className="py-2 px-4 text-center">
                  {getSlipUrl(d) ? (
                    <a
                      href={getSlipUrl(d)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 underline hover:text-blue-300"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="py-2 px-4 text-center">
                  {new Date(d.createdAt).toLocaleString()}
                </td>
                <td className="py-2 px-4 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs capitalize ${
                      String(d.status).toLowerCase() === "approved"
                        ? "bg-green-500/20 text-green-300"
                        : String(d.status).toLowerCase() === "rejected"
                        ? "bg-red-500/20 text-red-300"
                        : "bg-orange-500/20 text-orange-300"
                    }`}
                  >
                    {d.status}
                  </span>
                </td>
                <td className="py-2 px-4 text-center">
                  <div className="flex justify-center items-center space-x-2">
                    {d.status &&
                      String(d.status).toLowerCase() === "pending" && (
                        <>
                          <button
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                            onClick={() =>
                              handleAction(d.id, "approve")
                            }
                          >
                            Approve
                          </button>
                          <button
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                            onClick={() => handleAction(d.id, "reject")}
                          >
                            Reject
                          </button>
                        </>
                      )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
)}
          </>
        ) : (
          <AdminWithdrawals />
        )}
      </div>
      <div className="flex justify-center items-center ">
        <button
          onClick={handleLogout}
          className="w-full border border-[#61A9FF]  text-[#61A9FF] py-2 mx-4 rounded-3xl font-bold hover:bg-red-700 transition"
        >
          <FaPowerOff className="inline mr-1 text-xl" />
          Logout
        </button>
      </div>
    </>
  );
};

export default AdminDashboard;
