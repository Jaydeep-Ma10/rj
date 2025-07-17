import { useAuth } from "../hooks/useAuth";

const Referral = () => {
  const { user } = useAuth();
  const referralLink = `${window.location.origin}/signup?ref=${user?.referralCode || ""}`;

  return (
    <div className="max-w-md w-full bg-white shadow rounded p-6 mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Referral</h2>
      <div className="mb-4">
        <strong>Your Referral Code:</strong>
        <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">{user?.referralCode}</span>
      </div>
      <div className="mb-4">
        <strong>Referral Link:</strong>
        <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">{referralLink}</span>
      </div>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={() => navigator.clipboard.writeText(referralLink)}
      >
        Copy Referral Link
      </button>
    </div>
  );
};

export default Referral;
