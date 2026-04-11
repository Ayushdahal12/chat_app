import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useUserStore } from "../store/useUserStore";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const { authUser, logout } = useAuthStore();
  const { suggestedUsers, getSuggestedUsers, isLoading } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    getSuggestedUsers();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow px-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">GUFF</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="avatar">
              <div className="w-9 rounded-full">
                <img
                  src={authUser?.profilePic || "https://api.dicebear.com/7.x/thumbs/svg?seed=" + authUser?.username}
                  alt="avatar"
                />
              </div>
            </div>
            <span className="font-medium">{authUser?.username}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-1">People You May Know 👋</h2>
        <p className="text-base-content/60 mb-6">
          Based on your vibe — {authUser?.interests?.join(", ")}
        </p>

        {isLoading ? (
          <div className="flex justify-center mt-20">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : suggestedUsers.length === 0 ? (
          <div className="text-center mt-20 text-base-content/50">
            <p className="text-xl">No matches yet 😢</p>
            <p className="text-sm mt-2">Try adding more interests!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {suggestedUsers.map((user) => (
              <div key={user._id} className="card bg-base-100 shadow-md">
                <div className="card-body items-center text-center">
                  <div className="avatar mb-2">
                    <div className="w-16 rounded-full">
                      <img
                        src={user.profilePic || "https://api.dicebear.com/7.x/thumbs/svg?seed=" + user.username}
                        alt="avatar"
                      />
                    </div>
                  </div>
                  <h3 className="card-title text-lg">{user.username}</h3>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {user.interests?.slice(0, 3).map((interest) => (
                      <span key={interest} className="badge badge-primary badge-sm">
                        {interest}
                      </span>
                    ))}
                  </div>
                  <button
                    className="btn btn-primary btn-sm mt-3 w-full"
                    onClick={() => navigate(`/chat/${user._id}`)}
                  >
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;