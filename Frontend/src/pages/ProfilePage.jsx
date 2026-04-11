import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../lib/axios";

const interestsList = [
  "Technology", "Music", "Gaming", "Travel", "Food",
  "Sports", "Art", "Fashion", "Business", "Management",
  "Movies", "Books", "Fitness", "Photography", "Science",
];

const CLOUDINARY_CLOUD_NAME = "dhcpaoxx1";
const CLOUDINARY_UPLOAD_PRESET = "gg5z1art";

const ProfilePage = () => {
  const { authUser, getMe, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(authUser?.interests || []);
  const [profilePic, setProfilePic] = useState(authUser?.profilePic || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  const toggleInterest = (interest) => {
    setSelected((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((i) => i !== interest);
      }
      // Strict 4 choice limit
      if (prev.length < 4) {
        return [...prev, interest];
      }
      return prev;
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      setProfilePic(data.secure_url);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (selected.length !== 4 && activeTab === "interests") return;
    setIsLoading(true);
    try {
      await axiosInstance.put("/users/update-interests", { interests: selected });
      await axiosInstance.put("/users/update-profile", { profilePic });
      await getMe();
      setSuccess("Profile updated! ✅");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-base-200/50 flex flex-col font-sans">
      {/* --- GLASS NAVIGATION --- */}
      <nav className="navbar bg-base-100/60 backdrop-blur-xl sticky top-0 z-50 border-b border-base-300 px-4 md:px-12 h-20 shadow-sm">
        <div className="flex-1">
          <button 
            className="btn btn-ghost hover:bg-base-200 rounded-2xl gap-2 transition-all group" 
            onClick={() => navigate("/")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
            <span className="font-black uppercase tracking-widest text-xs hidden sm:block">Back to Guff</span>
          </button>
        </div>
        <div className="flex-none">
          <div className="px-4 py-1.5 bg-base-300/50 rounded-full border border-base-300">
            <h1 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Control Center</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto w-full flex-1 flex flex-col md:flex-row p-4 md:p-12 gap-8">
        
        {/* --- LEFT SIDEBAR --- */}
        <aside className="w-full md:w-80 space-y-6">
          <div className="card bg-base-100 shadow-2xl border border-base-300 overflow-hidden rounded-[2.5rem]">
            <div className="h-32 bg-gradient-to-tr from-primary via-primary/80 to-secondary relative">
                <div className="absolute inset-0 bg-grid-white/10" />
            </div>

            <div className="px-8 pb-8">
              <div className="relative -mt-16 mb-6">
                <div className="avatar group">
                  <div className="w-32 rounded-[2.5rem] rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-2xl ring-8 ring-base-100">
                    <img src={profilePic || `https://api.dicebear.com/7.x/thumbs/svg?seed=${authUser?.username}`} alt="avatar" />
                  </div>
                </div>
                <label className="absolute -bottom-2 -right-2 bg-primary text-primary-content rounded-2xl p-3 shadow-xl cursor-pointer hover:scale-110 transition active:scale-95 border-4 border-base-100">
                  {isUploading ? <span className="loading loading-spinner loading-xs" /> : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                </label>
              </div>
              
              <h2 className="text-3xl font-black tracking-tighter leading-none mb-1">{authUser?.username}</h2>
              <p className="text-xs font-bold opacity-30 uppercase tracking-widest">{authUser?.email}</p>
            </div>

            {/* NAV MENU */}
            <div className="p-3 space-y-2 bg-base-200/30 border-t border-base-300">
              <button onClick={() => setActiveTab("profile")} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-primary text-primary-content shadow-lg' : 'hover:bg-base-300 opacity-50'}`}>
                <span>Identity</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </button>
              
              <button onClick={() => setActiveTab("interests")} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'interests' ? 'bg-primary text-primary-content shadow-lg' : 'hover:bg-base-300 opacity-50'}`}>
                <span>My Vibe</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
              </button>

              <button onClick={() => setActiveTab("settings")} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-primary text-primary-content shadow-lg' : 'hover:bg-base-300 opacity-50'}`}>
                <span>Preferences</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>

          <button onClick={handleLogout} className="btn btn-ghost w-full rounded-3xl text-error font-black uppercase tracking-[0.2em] text-[10px] hover:bg-error/10 border border-transparent hover:border-error/20">Sign Out</button>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="flex-1">
          {success && (
            <div className="alert alert-success shadow-2xl mb-6 rounded-3xl border-none font-black text-xs uppercase tracking-widest animate-in fade-in slide-in-from-top-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{success}</span>
            </div>
          )}

          <div className="card bg-base-100 shadow-2xl border border-base-300 min-h-[580px] rounded-[3rem] overflow-hidden">
            <div className="card-body p-8 md:p-14">
              
              {/* TAB 1: IDENTITY */}
              {activeTab === "profile" && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                  <header>
                    <h3 className="text-4xl font-black tracking-tighter mb-2">Identity Info</h3>
                    <p className="opacity-40 font-bold text-sm uppercase tracking-widest">Manage your public presence</p>
                  </header>
                  <div className="grid gap-6">
                    <div className="p-6 rounded-[2rem] bg-base-200/50 border border-base-300 flex items-center justify-between">
                      <div><p className="text-[10px] uppercase font-black opacity-30 mb-2">Username</p><p className="font-black text-lg">@{authUser?.username}</p></div>
                      <div className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">Active Member</div>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-base-200/50 border border-base-300 flex items-center justify-between">
                      <div><p className="text-[10px] uppercase font-black opacity-30 mb-2">Access Email</p><p className="font-black text-lg">{authUser?.email}</p></div>
                      <div className="px-4 py-1.5 bg-success/10 text-success rounded-full text-[10px] font-black uppercase tracking-widest">Verified</div>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-lg w-full rounded-[2rem] shadow-2xl border-none font-black uppercase tracking-[0.2em]" onClick={handleSave} disabled={isLoading || isUploading}>
                    {isLoading ? <span className="loading loading-spinner" /> : "Sync Changes"}
                  </button>
                </div>
              )}

              {/* TAB 2: MY VIBE (INTERESTS) - SOLVED UI OVERLAP + LIMIT */}
              {activeTab === "interests" && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                  <header>
                    <h3 className="text-4xl font-black tracking-tighter mb-2">My Vibe</h3>
                    <p className="opacity-40 font-bold text-sm uppercase tracking-widest">
                      Choose exactly <span className="text-primary font-black">4 interests</span>
                    </p>
                  </header>

                  {/* Clean Flex Wrap with proper Gaps */}
                  <div className="flex flex-wrap gap-3">
                    {interestsList.map((interest) => {
                      const isSel = selected.includes(interest);
                      const limitReached = selected.length >= 4;
                      return (
                        <button
                          key={interest}
                          disabled={!isSel && limitReached}
                          onClick={() => toggleInterest(interest)}
                          className={`btn btn-md rounded-2xl border-2 transition-all duration-300 font-bold px-6 
                            ${isSel 
                              ? "btn-primary border-primary shadow-xl scale-105" 
                              : limitReached 
                                ? "bg-base-200 border-base-300 opacity-20 grayscale cursor-not-allowed" 
                                : "btn-ghost border-base-300 opacity-60 hover:opacity-100"
                            }`}
                        >
                          {isSel && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="mr-2"><polyline points="20 6 9 17 4 12"/></svg>
                          )}
                          {interest}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-10 border-t border-base-300">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex gap-2">
                        {[1, 2, 3, 4].map((s) => (
                          <div key={s} className={`h-2 rounded-full transition-all duration-500 ${selected.length >= s ? "bg-primary w-12" : "bg-base-300 w-8"}`} />
                        ))}
                      </div>
                      <p className="font-black text-[10px] uppercase tracking-widest opacity-30">{selected.length}/4 selected</p>
                    </div>
                    <button className="btn btn-primary btn-lg w-full rounded-[2rem] shadow-2xl border-none font-black uppercase tracking-[0.2em]" onClick={handleSave} disabled={isLoading || selected.length !== 4}>
                      {isLoading ? <span className="loading loading-spinner" /> : "Update Vibe"}
                    </button>
                    {selected.length !== 4 && <p className="text-center mt-4 text-[9px] font-black opacity-20 uppercase tracking-[0.3em]">Selection required to save</p>}
                  </div>
                </div>
              )}

              {/* TAB 3: PREFERENCES */}
              {activeTab === "settings" && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                  <header>
                    <h3 className="text-4xl font-black tracking-tighter mb-2">Preferences</h3>
                    <p className="opacity-40 font-bold text-sm uppercase tracking-widest">Tailor the Guff interface</p>
                  </header>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-8 rounded-[2.5rem] bg-base-200/50 border border-base-300">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-base-100 flex items-center justify-center shadow-lg border border-base-300">{theme === 'dark' ? '🌙' : '☀️'}</div>
                        <div><p className="font-black text-xl tracking-tight">Display Mode</p><p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">{theme} mode active</p></div>
                      </div>
                      <input type="checkbox" className="toggle toggle-primary toggle-lg scale-125" checked={theme === "dark"} onChange={toggleTheme} />
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;