const Activity = () => {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">Recent Activity</h1>
      <div className="bg-white rounded shadow p-6">
        {/* This could be a feed of recent games, deposits, withdrawals, etc. */}
        <p className="text-gray-500">Your recent game plays, deposits, withdrawals, and referral activity will appear here. (Coming soon!)</p>
      </div>
    </div>
  );
};

export default Activity;
