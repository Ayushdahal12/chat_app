import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../lib/axios";
import { 
  User, 
  Heart, 
  Settings, 
  LogOut, 
  Camera, 
  Check, 
  ArrowLeft, 
  Loader2,
  ShieldCheck
} from "lucide-react";

const interestsList = [
  "Technology", "Music", "Gaming", "Travel", "Food", 
  "Sports", "Art", "Fashion", "Business", "Management", 
  "Movies", "Books", "Fitness", "Photography", "Science"
];

const ProfilePage = () => {
  const { authUser, getMe, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  
  const [selected, setSelected] = useState(authUser?.interests || []);
  const [profilePic, setProfilePic] = useState(authUser?.profilePic || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const toggleInterest = (i) => {
    setSelected(prev => prev.includes(i) ? prev.filter(x => x !== i) : (prev.length < 4 ? [...prev, i] : prev));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await axiosInstance.put("/users/update-interests", { interests: selected });
      await axiosInstance.put("/users/update-profile", { profilePic });
      await getMe();
      // Optional: Add a toast notification here
    } catch (err) { 
      console.error(err); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "gg5z1art");
      const res = await fetch(`https://api.cloudinary.com/v1_1/dhcpaoxx1/image/upload`, { 
        method: "POST", 
        body: formData 
      });
      const data = await res.json();
      setProfilePic(data.secure_url);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setIsUploading(false); 
    }
  };

  return (
    // data-theme={theme} is the magic key for Dark Mode visibility
    <div className="min-h-screen bg-base-200 flex flex-col font-sans transition-colors duration-300" data-theme={theme}>
      
      {/* --- TOP NAVIGATION --- */}
      <nav className="h-20 md:h-24 bg-base-100/80 backdrop-blur-xl border-b border-base-300 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
        <button 
          onClick={() => navigate("/")} 
          className="flex items-center gap-3 p-3 rounded-2xl hover:bg-base-300 text-base-content transition-all group"
        >
          <ArrowLeft size={20} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-black text-[10px] uppercase tracking-widest hidden sm:block">Back to Guff</span>
        </button>
        <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20">
          <ShieldCheck size={14} className="text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Secure Profile</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto w-full flex-1 flex flex-col lg:flex-row p-4 md:p-12 gap-8 md:gap-12">
        
        {/* --- ADAPTIVE SIDEBAR --- */}
        <aside className="w-full lg:w-96 space-y-6">
          <div className="bg-base-100 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl border border-base-300 overflow-hidden transition-all">
            {/* Branding Header */}
            <div className="h-32 md:h-40 bg-primary relative overflow-hidden">
               <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            </div>

            <div className="px-8 pb-10">
              <div className="relative -mt-16 md:-mt-20 mb-6 flex justify-center lg:justify-start">
                <div className="relative group">
                  <img 
                    src={profilePic || `https://api.dicebear.com/7.x/thumbs/svg?seed=${authUser?.username}`} 
                    className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] md:rounded-[3rem] border-8 border-base-100 shadow-2xl object-cover transition-transform group-hover:scale-[1.02]" 
                    alt="profile"
                  />
                  <label className="absolute -bottom-2 -right-2 bg-primary text-primary-content p-3.5 rounded-2xl shadow-xl cursor-pointer hover:scale-110 active:scale-95 transition-all border-4 border-base-100">
                    {isUploading ? <Loader2 className="animate-spin w-5 h-5" /> : <Camera size={20} strokeWidth={2.5} />}
                    <input type="file" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-black text-base-content tracking-tighter uppercase mb-1">{authUser?.username}</h2>
                <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-[0.2em]">{authUser?.email}</p>
              </div>
              
              {/* SIDEBAR OPTIONS (Dark Mode Fix Applied) */}
              <nav className="mt-10 flex lg:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
                {[
                  { id: 'profile', label: 'Identity', icon: User },
                  { id: 'interests', label: 'My Vibe', icon: Heart },
                  { id: 'settings', label: 'Preferences', icon: Settings }
                ].map(item => (
                  <button 
                    key={item.id} 
                    onClick={() => setActiveTab(item.id)} 
                    className={`flex-shrink-0 flex items-center gap-4 px-6 py-4 rounded-2xl md:rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest transition-all
                    ${activeTab === item.id 
                      ? 'bg-primary text-primary-content shadow-lg shadow-primary/20 scale-[1.02]' 
                      : 'bg-base-200 text-base-content/60 hover:bg-base-300'}`}
                  >
                    <item.icon size={18} strokeWidth={3} /> 
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <button 
            onClick={async () => { await logout(); navigate("/login"); }} 
            className="w-full p-5 rounded-[2rem] bg-error/10 text-error font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-error hover:text-white transition-all border border-error/20"
          >
            <LogOut size={18} strokeWidth={3} /> Sign Out Account
          </button>
        </aside>

        {/* --- CONTENT AREA --- */}
        <section className="flex-1 bg-base-100 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl border border-base-300 p-8 md:p-16 min-h-[600px] transition-all">
          
          {activeTab === "profile" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-4xl md:text-5xl font-black text-base-content tracking-tighter uppercase">Identity</h3>
              <div className="grid gap-6">
                 <div className="p-8 bg-base-200 rounded-[2.5rem] border border-base-300">
                    <p className="text-[10px] font-black text-base-content/30 uppercase tracking-widest mb-3">Display Handle</p>
                    <p className="text-2xl md:text-3xl font-black text-base-content leading-none">@{authUser?.username}</p>
                 </div>
                 <div className="p-8 bg-base-200 rounded-[2.5rem] border border-base-300">
                    <p className="text-[10px] font-black text-base-content/30 uppercase tracking-widest mb-3">Linked Email</p>
                    <p className="text-2xl md:text-3xl font-black text-base-content leading-none">{authUser?.email}</p>
                 </div>
              </div>
              <button 
                onClick={handleSave} 
                disabled={isLoading}
                className="w-full py-6 bg-primary text-primary-content rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
              >
                {isLoading ? <Loader2 className="animate-spin mx-auto" /> : "Sync Changes"}
              </button>
            </div>
          )}

          {activeTab === "interests" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
              <header>
                <h3 className="text-4xl md:text-5xl font-black text-base-content tracking-tighter uppercase mb-4">My Vibe</h3>
                <p className="text-base-content/50 font-bold text-sm">Choose <span className="text-primary">4 interests</span> to personalize your Guff experience.</p>
              </header>
              <div className="flex flex-wrap gap-3">
                {interestsList.map(i => {
                  const isSel = selected.includes(i);
                  return (
                    <button 
                      key={i} 
                      onClick={() => toggleInterest(i)} 
                      disabled={!isSel && selected.length >= 4} 
                      className={`px-6 py-3 md:px-8 md:py-4 rounded-2xl font-bold text-sm transition-all border-2 
                      ${isSel 
                        ? 'bg-primary border-primary text-primary-content shadow-lg' 
                        : 'bg-base-200 border-base-300 text-base-content/40 hover:border-primary/50'}`}
                    >
                      <div className="flex items-center gap-2">
                        {isSel && <Check size={16} strokeWidth={4} />}
                        {i}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="pt-10 border-t border-base-300">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map(dot => (
                      <div key={dot} className={`h-2 rounded-full transition-all duration-500 ${selected.length >= dot ? 'bg-primary w-12' : 'bg-base-300 w-8'}`} />
                    ))}
                  </div>
                  <span className="text-[10px] font-black text-base-content/30 uppercase tracking-widest">{selected.length}/4 Selected</span>
                </div>
                <button 
                  onClick={handleSave} 
                  disabled={selected.length !== 4 || isLoading} 
                  className="w-full py-6 bg-primary text-primary-content rounded-[2rem] font-black text-xs uppercase tracking-widest disabled:opacity-20 shadow-xl transition-all"
                >
                  Update Vibe
                </button>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
               <h3 className="text-4xl md:text-5xl font-black text-base-content tracking-tighter uppercase">Preferences</h3>
               <div className="p-10 bg-base-200 rounded-[3rem] flex items-center justify-between border border-base-300 group">
                  <div className="flex items-center gap-6 md:gap-8">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-base-100 rounded-3xl flex items-center justify-center text-3xl shadow-sm transition-transform group-hover:rotate-12">
                      {theme === 'dark' ? '🌙' : '☀️'}
                    </div>
                    <div>
                      <p className="text-xl md:text-2xl font-black text-base-content tracking-tight">Appearance</p>
                      <p className="text-[10px] font-black uppercase text-base-content/30 tracking-widest">{theme} Mode Active</p>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary toggle-lg scale-125 md:scale-150" 
                    checked={theme === 'dark'} 
                    onChange={toggleTheme} 
                  />
               </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ProfilePage;