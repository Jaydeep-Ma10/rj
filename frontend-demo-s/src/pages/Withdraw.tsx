import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const Withdraw = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    amount: "",
    accountHolder: "",
    accountNumber: "",
    ifsc: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus(null);
    setSubmitting(true);
    try {
      const res = await fetch("https://rj-755j.onrender.com/api/manual-withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user?.name || "",
          mobile: user?.mobile || "",
          amount: formData.amount,
          accountHolder: formData.accountHolder,
          accountNumber: formData.accountNumber,
          ifsc: formData.ifsc,
        })
      });
      if (!res.ok) {
        let msg = "Failed to submit withdrawal.";
        try {
          const data = await res.json();
          if (data.errors && data.errors.length > 0) {
            msg = data.errors.map((e: any) => e.msg).join(", ");
          } else if (data.error) {
            msg = data.error;
          }
        } catch {}
        setSubmitStatus(msg);
        return;
      }
      setSubmitStatus("success");
      setFormData({ amount: "", accountHolder: "", accountNumber: "", ifsc: "" });
    } catch (err: any) {
      setSubmitStatus("Error submitting withdrawal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white shadow rounded p-6 mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center text-purple-700">Withdraw Funds</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="amount"
          type="number"
          placeholder="Amount"
          value={formData.amount}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="accountHolder"
          type="text"
          placeholder="Account Holder Name"
          value={formData.accountHolder}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="accountNumber"
          type="text"
          placeholder="Account Number"
          value={formData.accountNumber}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="ifsc"
          type="text"
          placeholder="IFSC Code"
          value={formData.ifsc}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Request Withdrawal"}
        </button>
        {submitStatus === "success" && (
          <div className="mt-3 text-green-700 text-center font-semibold">Withdrawal request submitted! Awaiting admin approval.</div>
        )}
        {submitStatus && submitStatus !== "success" && (
          <div className="mt-3 text-red-700 text-center font-semibold">{submitStatus}</div>
        )}
      </form>
    </div>
  );
};

export default Withdraw;
