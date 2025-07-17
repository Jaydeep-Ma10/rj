// src/pages/Deposit.tsx
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const methods = [
  {
    id: "paytm",
    name: "Paytm Pay",
    details: {
      accountName: "XYZ Pvt Ltd",
      upi: "paytm-xyz@paytm",
      number: "9876543210",
    },
  },
  {
    id: "whatsapp",
    name: "WhatsApp Pay",
    details: {
      upi: "wa-pay@upi",
      number: "9123456780",
    },
  },
  {
    id: "netbanking",
    name: "Net Banking",
    details: {
      bankName: "HDFC Bank",
      accNo: "1234567890",
      ifsc: "HDFC0001234",
      accountHolder: "XYZ Pvt Ltd",
    },
  },
  {
    id: "googlepay",
    name: "Google Pay",
    details: {
      upi: "xyz@okhdfcbank",
      number: "9988776655",
    },
  },
];

const Deposit = () => {
  const [selected, setSelected] = useState<any>(null);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    mobile: "",
    amount: "",
    utr: "",
    slip: null as File | null,
  });

  const handleChange = (e: any) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };


  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitStatus(null);
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", user?.name || "");
      fd.append("mobile", formData.mobile);
      fd.append("amount", formData.amount);
      fd.append("utr", formData.utr);
      if (formData.slip) fd.append("slip", formData.slip);
      if (selected?.id) fd.append("method", selected.name);
      const res = await fetch("https://rj-755j.onrender.com/api/manual-deposit", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitStatus("success");
      setFormData({ mobile: "", amount: "", utr: "", slip: null });
      setSelected(null);
    } catch (err: any) {
      let msg = "Submission failed. Please try again or check your internet connection.";
      if (err instanceof Response) {
        try {
          const data = await err.json();
          if (data.errors && data.errors.length > 0) {
            msg = data.errors.map((e: any) => e.msg).join(", ");
          } else if (data.error) {
            msg = data.error;
          }
        } catch {}
      }
      setSubmitStatus(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Select Payment Method
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {methods.map((method) => (
          <div
            key={method.id}
            className="border p-4 rounded-lg shadow cursor-pointer hover:bg-gray-100"
            onClick={() => setSelected(method)}
          >
            <h3 className="text-lg font-semibold">{method.name}</h3>
          </div>
        ))}
      </div>

      {selected && (
        <div className="mt-6 border p-4 rounded-lg bg-gray-50">
          <h3 className="text-xl font-bold mb-2">Pay via {selected.name}</h3>
          <ul className="mb-4 text-gray-700">
            {Object.entries(selected.details).map(([key, value]) => (
              <li key={key}>
                <strong>{key.replace(/([A-Z])/g, " $1")}: </strong>
                {value}
              </li>
            ))}
          </ul>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="w-full p-2 border rounded bg-gray-100 text-gray-700 font-semibold cursor-not-allowed">
              Name: {user?.name || "-"}
            </div>
            <input
              type="tel"
              name="mobile"
              placeholder="Mobile Number"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="number"
              name="amount"
              placeholder="Amount Paid"
              value={formData.amount}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              name="utr"
              placeholder="Transaction ID / UTR"
              value={formData.utr}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="file"
              name="slip"
              accept="image/*"
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />

            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Payment Confirmation"}
            </button>
            {submitStatus === "success" && (
              <div className="mt-3 text-green-700 text-center font-semibold">Payment submitted! Awaiting admin approval.</div>
            )}
            {submitStatus && submitStatus !== "success" && (
              <div className="mt-3 text-red-700 text-center font-semibold">{typeof submitStatus === 'string' ? submitStatus : 'Submission failed. Please try again.'}</div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default Deposit;
