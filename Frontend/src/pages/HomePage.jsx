import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useUserStore } from "../store/useUserStore";
import { useSocketStore } from "../store/useSocketStore";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const { authUser, logout } = useAuthStore();
  const { suggestedUsers, getSuggestedUsers, isLoading, unreadCounts, clearUnread } = useUserStore();
  const { onlineUsers } = useSocketStore();
  const navigate = useNavigate();

  useEffect(() => {
    getSuggestedUsers();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleMessage = (userId) => {
    clearUnread(userId);
    navigate(`/chat/${userId}`);
  };

  return (
    <div className="min-h-screen bg-base-200/50">
      {/* Modern Glass Navbar */}
      <nav className="navbar bg-base-100/80 backdrop-blur-md sticky top-0 z-50 border-b border-base-300 px-4 md:px-8">
        <div className="flex-1">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="bg-primary text-primary-content p-1.5 rounded-xl shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
            </div>
            <h1 className="text-5xl font-black text-black tracking-tighter leading-none mb-2">
            गफ<span className="text-primary text-6xl">.</span>
          </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn btn-ghost hover:bg-base-300 rounded-2xl gap-3 px-2 md:px-4"
            onClick={() => navigate("/profile")}
          >
            <div className="avatar">
              <div className="w-9 rounded-full ring-2 ring-primary ring-offset-base-100 ring-offset-2">
                <img
                  src={authUser?.profilePic || `https://api.dicebear.com/7.x/thumbs/svg?seed=${authUser?.username}`}
                  alt="avatar"
                />
              </div>
            </div>
            <span className="font-bold hidden sm:block">{authUser?.username}</span>
          </button>

          <div className="divider divider-horizontal mx-0"></div>

          <button className="btn btn-circle btn-ghost btn-sm text-error" onClick={handleLogout}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          </button>
        </div>
      </nav>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto p-4 md:p-8">
        
        {/* Header Section */}
        <header className="mb-10 text-center md:text-left">
          <div className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-widest uppercase bg-primary/10 text-primary rounded-full">
            Recommended for you
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-base-content mb-3">People You May Know 👋</h2>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-base-content/60">
            <span>Based on your vibe:</span>
            {authUser?.interests?.slice(0, 4).map(interest => (
              <span key={interest} className="px-2 py-0.5 bg-base-300 rounded text-xs font-medium">#{interest}</span>
            ))}
          </div>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center mt-20 gap-4">
            <span className="loading loading-spinner loading-lg text-primary" />
            <p className="text-base-content/50 animate-pulse">Finding your squad...</p>
          </div>
        ) : suggestedUsers.length === 0 ? (
          <div className="card bg-base-100 shadow-xl p-12 text-center items-center max-w-md mx-auto border border-base-300">
            <div className="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center text-4xl mb-6">🏜️</div>
            <h3 className="text-2xl font-bold mb-2">No matches yet</h3>
            <p className="text-base-content/60 mb-8">It's a bit quiet here. Try adding more interests to find people like you!</p>
            <button
              className="btn btn-primary rounded-2xl shadow-lg px-8"
              onClick={() => navigate("/profile")}
            >
              Update Interests
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {suggestedUsers.map((user) => {
              const isOnline = onlineUsers.includes(user._id);
              const unread = unreadCounts[user._id] || 0;

              return (
                <div 
                  key={user._id} 
                  className="group relative bg-base-100 rounded-[2rem] p-6 border border-base-300 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                >
                  <div className="flex flex-col items-center">
                    
                    {/* Avatar with dynamic border */}
                    <div className="relative mb-4">
                      <div className="avatar">
                        <div className={`w-24 rounded-full ring-4 ring-offset-4 ring-offset-base-100 transition-all duration-300 ${isOnline ? 'ring-success' : 'ring-base-300'}`}>
                          <img
                            src={user.profilePic || `https://api.dicebear.com/7.x/thumbs/svg?seed=${user.username}`}
                            alt="avatar"
                            className="bg-base-200"
                          />
                        </div>
                      </div>
                      {isOnline && (
                        <div className="absolute top-1 right-1 w-6 h-6 bg-success rounded-full border-4 border-base-100 animate-pulse" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-base-content group-hover:text-primary transition-colors">
                        {user.username}
                      </h3>
                      <span className={`text-[10px] uppercase tracking-widest font-bold ${isOnline ? 'text-success' : 'text-base-content/30'}`}>
                        {isOnline ? "Active Now" : "Offline"}
                      </span>
                    </div>

                    {/* Interests Chips */}
                    <div className="flex flex-wrap gap-1.5 justify-center h-16 overflow-hidden mb-6">
                      {user.interests?.slice(0, 3).map((interest) => (
                        <span key={interest} className="px-3 py-1 bg-secondary/10 text-secondary text-[11px] font-bold rounded-full border border-secondary/20">
                          {interest}
                        </span>
                      ))}
                    </div>

                    {/* Modern Action Button */}
                    <div className="relative w-full">
                      <button
                        className="btn btn-primary w-full rounded-2xl shadow-md group-hover:shadow-primary/20 transition-all"
                        onClick={() => handleMessage(user._id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
                        Message
                      </button>
                      
                      {unread > 0 && (
                        <div className="absolute -top-3 -right-2 bg-error text-error-content text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-base-100 shadow-lg">
                          {unread}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;