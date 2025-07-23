import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    const { user } = useAuth();
    const [selected, setSelected] = useState(null);
    const [error, setError] = useState(null);
    const [amount, setAmount] = useState('');
    const [utr, setUtr] = useState('');
    const [slip, setSlip] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selected || !amount || !utr)
            return;
        setIsSubmitting(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('name', user?.name || '');
            formData.append('mobile', user?.mobile || '');
            formData.append('amount', amount);
            formData.append('utr', utr);
            if (slip) {
                formData.append('slip', slip);
            }
            if (selected?.id) {
                formData.append('method', selected.name);
            }
            const response = await fetch('https://rj-755j.onrender.com/api/manual-deposit', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                throw new Error('Deposit request failed');
            }
            // Handle success
            alert('Deposit request submitted successfully!');
            setAmount('');
            setUtr('');
            setSlip(null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsxs("div", { className: "container mx-auto p-4 max-w-4xl", children: [_jsx("h1", { className: "text-2xl font-bold mb-6", children: "Deposit Funds" }), error && (_jsx("div", { className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4", children: error })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Select Payment Method" }), _jsx("div", { className: "space-y-2", children: methods.map((method) => (_jsx("div", { className: `p-4 border rounded-lg cursor-pointer transition-colors ${selected?.id === method.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`, onClick: () => setSelected(method), children: _jsx("h3", { className: "font-medium", children: method.name }) }, method.id))) })] }), selected && (_jsxs("div", { className: "border p-6 rounded-lg bg-gray-50", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Payment Details" }), _jsxs("div", { className: "mb-6 space-y-2", children: [_jsx("h3", { className: "font-medium", children: selected.name }), _jsx("div", { className: "bg-white p-4 rounded border", children: Object.entries(selected.details).map(([key, value]) => (_jsxs("div", { className: "mb-2", children: [_jsxs("span", { className: "font-medium", children: [key.replace(/([A-Z])/g, ' $1').trim(), ": "] }), _jsx("span", { children: value })] }, key))) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Amount (\u20B9)" }), _jsx("input", { type: "number", value: amount, onChange: (e) => setAmount(e.target.value), className: "w-full p-2 border rounded", placeholder: "Enter amount", min: "1", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Transaction ID / UTR" }), _jsx("input", { type: "text", value: utr, onChange: (e) => setUtr(e.target.value), className: "w-full p-2 border rounded", placeholder: "Enter transaction ID / UTR", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Payment Proof (Screenshot/Receipt)" }), _jsx("input", { type: "file", onChange: (e) => setSlip(e.target.files?.[0] || null), className: "w-full p-2 border rounded", accept: "image/*,.pdf", required: true })] }), _jsx("button", { type: "submit", disabled: isSubmitting, className: `w-full py-2 px-4 rounded text-white font-medium ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`, children: isSubmitting ? 'Processing...' : 'Submit Payment' })] })] }))] })] }));
};
export default Deposit;
