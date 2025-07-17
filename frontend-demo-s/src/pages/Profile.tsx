import { useAuth } from "../hooks/useAuth";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-md w-full bg-white shadow rounded p-6 mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Profile</h2>
      <div className="space-y-2">
        <div>
          <strong>Name:</strong> {user?.name}
        </div>
        <div>
          <strong>Mobile:</strong> {user?.mobile || "-"}
        </div>
        <div>
          <strong>Referral Code:</strong> <span className="font-mono bg-gray-100 px-2 py-1 rounded">{user?.referralCode}</span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
