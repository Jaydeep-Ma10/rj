// src/pages/Deposit.tsx
import { ArrowLeft } from "lucide-react";
import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { buildApiUrl, API_ENDPOINTS } from "../config/api";

// Define types for the methods
interface PaymentMethod {
  id: string;
  name: string;
  details: Record<string, string>;
}

const methods: PaymentMethod[] = [
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
  const { user } = useAuth();
  const [selected, setSelected] = useState<PaymentMethod | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [utr, setUtr] = useState("");
  const [slip, setSlip] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected || !amount || !utr) return;

    // Debug: Log current user data
    console.log("🔍 Current user data:", user);
    console.log("🔍 Form data:", { amount, utr, selectedMethod: selected?.name, hasSlip: !!slip });

    // Validate required fields
    if (!user?.name) {
      setError("User name is required. Please log in again.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", user.name);
      // Use mobile from user or fallback to a default mobile number
      formData.append("mobile", user?.mobile || "0000000000");
      formData.append("amount", amount);
      formData.append("utr", utr);
      if (slip) {
        formData.append("slip", slip);
      }
      if (selected?.id) {
        formData.append("method", selected.name);
      }

      // Debug: Log FormData contents
      console.log("🔍 FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }

      const response = await fetch(
        buildApiUrl(API_ENDPOINTS.MANUAL_DEPOSIT),
        {
          method: "POST",
          body: formData,
        }
      );

      console.log("🔍 Response status:", response.status);
      console.log("🔍 Response headers:", [...response.headers.entries()]);

      const responseData = await response.json();
      console.log("🔍 Response data:", responseData);

      if (!response.ok) {
        // Handle specific error messages from backend
        const errorMessage = responseData.error || 
                            responseData.errors?.[0]?.msg || 
                            `Deposit request failed (${response.status})`;
        console.error("❌ Backend error:", errorMessage);
        console.error("❌ Full response:", responseData);
        throw new Error(errorMessage);
      }

      // Handle success
      alert("Deposit request submitted successfully!");
      console.log("✅ Deposit submitted successfully:", responseData);
      setAmount("");
      setUtr("");
      setSlip(null);
    } catch (err) {
      console.error("❌ Deposit error:", err);
      console.error("❌ Error details:", {
        message: err instanceof Error ? err.message : "Unknown error",
        stack: err instanceof Error ? err.stack : undefined,
        user: user,
        formData: { amount, utr, selectedMethod: selected?.name, hasSlip: !!slip }
      });
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="relative flex items-center justify-center w-full text-white px-2 py-3 bg-[#2B3270]">
        {/* Left Icon */}
        <ArrowLeft
          onClick={() => navigate(-1)}
          className="absolute left-2 cursor-pointer"
        />

        {/* Center Title */}
        <h2 className="text-lg font-bold ">Deposit Funds</h2>
      </div>
      <div className="container mx-auto p-4 max-w-4xl">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Select Payment Method
            </h2>
            <div className="space-y-2">
              {methods.map((method) => (
                <div
                  key={method.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors bg-[#2B3270] ${
                    selected?.id === method.id
                      ? "border-blue-500 bg-[#61a9ff]"
                      : ""
                  }`}
                  onClick={() => setSelected(method)}
                >
                  <h3 className="font-medium">{method.name}</h3>
                </div>
              ))}
            </div>
          </div>

          {selected && (
            <div className="border p-6 rounded-lg bg-[#2B3270]">
              <h2 className="text-xl font-semibold mb-4">Payment Details</h2>

              <div className="mb-6 space-y-2">
                <h3 className="font-medium">{selected.name}</h3>
                <div className="bg-[#374992] p-4 rounded border">
                  {Object.entries(selected.details).map(([key, value]) => (
                    <div key={key} className="mb-2">
                      <span className="font-medium">
                        {key.replace(/([A-Z])/g, " $1").trim()}:{" "}
                      </span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 mb-10">
                <div>
                  <label className="block text-sm font-medium mb-1 ">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-2 rounded bg-[#374992] placeholder:text-white"
                    placeholder="Enter amount"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Transaction ID / UTR
                  </label>
                  <input
                    type="text"
                    value={utr}
                    onChange={(e) => setUtr(e.target.value)}
                    className="w-full p-2 rounded bg-[#374992] placeholder:text-white"
                    placeholder="Enter transaction ID / UTR"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Payment Proof (Screenshot/Receipt)
                  </label>
                  <div>
                    <input
                      id="fileInput"
                      type="file"
                      onChange={(e) => setSlip(e.target.files?.[0] || null)}
                      className="hidden"
                      accept="image/*,.pdf"
                      required
                    />
                    <label
                      htmlFor="fileInput"
                      className="cursor-pointer bg-[#374992] text-white px-4 py-1 rounded inline-block"
                    >
                      Choose File
                    </label>
                    {slip && (
                      <p className="mt-2 text-sm text-white">
                        Selected: {slip.name}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-2 px-4 rounded text-white font-medium ${
                    isSubmitting
                      ? "bg-blue-400"
                      : "bg-[#61a9ff] hover:bg-blue-700"
                  }`}
                >
                  {isSubmitting ? "Processing..." : "Submit Payment"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Deposit;
