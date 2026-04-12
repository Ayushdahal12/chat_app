import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useUserStore } from "../store/useUserStore";
import { useSocketStore } from "../store/useSocketStore";
import { useThemeStore } from "../store/useThemeStore";
import { useNavigate } from "react-router-dom";
import {
  LogOut, Sparkles, Settings2, ChevronRight, Zap, Camera, MessageCircle, Users,
} from "lucide-react";

const HomePage = () => {
  const { authUser, logout } = useAuthStore();
  const { suggestedUsers, getSuggestedUsers, isLoading, unreadCounts, clearUnread } = useUserStore();
  const { onlineUsers } = useSocketStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();

  useEffect(() => { getSuggestedUsers(); }, [getSuggestedUsers]);

  const handleMessage = (userId) => { clearUnread(userId); navigate(`/chat/${userId}`); };
  const handleLogout = async () => { await logout(); navigate("/login"); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

        .hp-root {
          min-height: 100dvh;
          background: #f0f4ff;
          font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
          color: #0f172a;
          display: flex;
          flex-direction: column;
        }

        /* ── NAVBAR ── */
        .hp-nav {
          position: sticky; top: 0; z-index: 60;
          background: #1960F1;
          height: 64px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 20px;
          box-shadow: 0 4px 24px rgba(25,96,241,0.35);
        }
 
        @media(min-width:768px){ .hp-nav{ height:72px; padding:0 48px; } }

        .hp-logo { display:flex; align-items:flex-end; cursor:pointer; gap:1px; }
        .hp-logo-text { color:#fff; font-size:30px; font-weight:900; line-height:1; letter-spacing:-1px; }
        @media(min-width:768px){ .hp-logo-text{ font-size:36px; } }
        .hp-logo-dot { color:#89CFF0; font-size:42px; line-height:0.55; font-weight:900; }

        .hp-nav-feed {
          display:flex; align-items:center; gap:8px;
          padding:8px 18px;
          background:rgba(255,255,255,0.15);
          border:1px solid rgba(255,255,255,0.2);
          border-radius:100px;
          cursor:pointer;
          transition:all 0.2s;
          color:#fff;
          font-size:11px; font-weight:800;
          text-transform:uppercase; letter-spacing:2px;
        }
        .hp-nav-feed:hover { background:rgba(255,255,255,0.25); }

        .hp-nav-right { display:flex; align-items:center; gap:8px; }
        .hp-profile-btn {
          display:flex; align-items:center; gap:10px;
          padding:4px 16px 4px 4px;
          background:rgba(255,255,255,0.12);
          border:1px solid rgba(255,255,255,0.2);
          border-radius:100px; cursor:pointer;
          transition:all 0.2s;
        }
        .hp-profile-btn:hover { background:rgba(255,255,255,0.22); }
        .hp-avatar-ring {
          width:36px; height:36px; border-radius:50%;
          overflow:hidden;
          border:2px solid rgba(137,207,240,0.5);
        }
        @media(min-width:768px){ .hp-avatar-ring{ width:42px; height:42px; } }
        .hp-avatar-ring img { width:100%; height:100%; object-fit:cover; }
        .hp-username {
          display:none; color:#fff;
          font-size:11px; font-weight:800;
          text-transform:uppercase; letter-spacing:1.5px;
        }
        @media(min-width:640px){ .hp-username{ display:block; } }
        .hp-logout {
          background:none; border:none; cursor:pointer;
          color:rgba(255,255,255,0.6); padding:8px;
          transition:color 0.2s;
        }
        .hp-logout:hover { color:#fff; }

        /* ── MAIN ── */
        .hp-main { max-width:1280px; margin:0 auto; padding:28px 16px 80px; }
        @media(min-width:768px){ .hp-main{ padding:40px 40px 80px; } }

        /* ── HERO ── */
        .hp-hero {
          background:#fff;
          border-radius:28px;
          padding:32px 28px;
          margin-bottom:24px;
          display:flex; flex-direction:column;
          gap:24px;
          box-shadow:0 2px 20px rgba(15,23,42,0.06);
          border:1px solid rgba(15,23,42,0.05);
          position:relative; overflow:hidden;
        }
        @media(min-width:1024px){ .hp-hero{ flex-direction:row; align-items:center; justify-content:space-between; padding:40px 48px; } }

        /* decorative blobs */
        .hp-hero::before {
          content:'';
          position:absolute; top:-60px; right:-60px;
          width:240px; height:240px;
          background:radial-gradient(circle, rgba(25,96,241,0.08) 0%, transparent 70%);
          border-radius:50%; pointer-events:none;
        }
        .hp-hero::after {
          content:'';
          position:absolute; bottom:-40px; left:10%;
          width:160px; height:160px;
          background:radial-gradient(circle, rgba(137,207,240,0.12) 0%, transparent 70%);
          border-radius:50%; pointer-events:none;
        }

        .hp-hero-left { position:relative; z-index:1; }
        .hp-badge {
          display:inline-flex; align-items:center; gap:6px;
          padding:6px 14px;
          background:#eef3ff; color:#1960F1;
          border-radius:100px; margin-bottom:16px;
          font-size:10px; font-weight:800;
          text-transform:uppercase; letter-spacing:2px;
        }
        .hp-hero-title {
          font-size:32px; font-weight:900;
          line-height:1.1; letter-spacing:-1px;
          margin-bottom:16px; color:#0f172a;
        }
        @media(min-width:768px){ .hp-hero-title{ font-size:44px; } }
        .hp-hero-title span { color:#1960F1; }

        .hp-interest-tags { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
        .hp-tag {
          padding:6px 14px;
          background:#f1f5f9; color:#64748b;
          border-radius:10px;
          font-size:10px; font-weight:800;
          text-transform:uppercase; letter-spacing:1.5px;
        }
        .hp-settings-btn {
          background:none; border:none; cursor:pointer;
          color:#94a3b8; padding:4px;
          transition:color 0.2s;
        }
        .hp-settings-btn:hover { color:#1960F1; }

        .hp-hero-stats { display:flex; gap:12px; position:relative; z-index:1; }
        @media(min-width:1024px){ .hp-hero-stats{ flex-shrink:0; } }
        .hp-stat {
          background:#f8faff;
          border:1px solid #e2e8f0;
          border-radius:20px;
          padding:24px 28px;
          text-align:center;
          min-width:110px;
          flex:1;
        }
        .hp-stat-num {
          font-size:36px; font-weight:900;
          color:#1960F1; line-height:1;
          margin-bottom:6px; letter-spacing:-1px;
        }
        .hp-stat-num.green { color:#22c55e; }
        .hp-stat-label {
          font-size:9px; font-weight:800;
          text-transform:uppercase; letter-spacing:2px;
          color:#94a3b8;
        }

        /* ── FEED BANNER ── */
        .hp-feed-banner {
          background:linear-gradient(135deg, #1960F1 0%, #0a46b3 100%);
          border-radius:24px;
          padding:22px 28px;
          display:flex; align-items:center; justify-content:space-between;
          cursor:pointer; margin-bottom:32px;
          box-shadow:0 8px 32px rgba(25,96,241,0.3);
          transition:all 0.25s;
        }
        .hp-feed-banner:hover { transform:translateY(-2px); box-shadow:0 12px 40px rgba(25,96,241,0.4); }
        .hp-feed-banner:active { transform:scale(0.99); }
        .hp-feed-left { display:flex; align-items:center; gap:16px; }
        .hp-feed-icon {
          width:52px; height:52px;
          background:rgba(255,255,255,0.2);
          border-radius:16px;
          display:flex; align-items:center; justify-content:center;
        }
        .hp-feed-title { color:#fff; font-size:18px; font-weight:900; letter-spacing:-0.5px; margin-bottom:2px; }
        .hp-feed-sub { color:rgba(255,255,255,0.6); font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:2px; }

        /* ── SECTION HEADER ── */
        .hp-section-head {
          display:flex; align-items:center; gap:12px; margin-bottom:20px; padding:0 4px;
        }
        .hp-section-label {
          font-size:10px; font-weight:800;
          text-transform:uppercase; letter-spacing:4px;
          color:#94a3b8;
        }
        .hp-section-line { height:1px; flex:1; background:#e2e8f0; }

        /* ── LOADING ── */
        .hp-loading {
          display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          padding:80px 20px; gap:16px;
        }
        .hp-loading p {
          font-size:10px; font-weight:800;
          text-transform:uppercase; letter-spacing:4px;
          color:#94a3b8;
        }

        /* ── EMPTY ── */
        .hp-empty { text-align:center; padding:80px 20px; }
        .hp-empty-emoji { font-size:52px; margin-bottom:16px; }
        .hp-empty-title { font-size:22px; font-weight:900; color:#0f172a; margin-bottom:8px; }
        .hp-empty-sub { font-size:14px; color:#94a3b8; margin-bottom:20px; }
        .hp-empty-btn {
          display:inline-block; padding:12px 28px;
          background:#1960F1; color:#fff;
          border:none; border-radius:100px; cursor:pointer;
          font-size:13px; font-weight:800;
          letter-spacing:1px;
          transition:all 0.2s;
          box-shadow:0 4px 14px rgba(25,96,241,0.3);
        }
        .hp-empty-btn:hover { transform:translateY(-2px); }

        /* ── GRID ── */
        .hp-grid {
          display:grid;
          grid-template-columns:1fr;
          gap:20px;
        }
        @media(min-width:640px){ .hp-grid{ grid-template-columns:repeat(2,1fr); } }
        @media(min-width:1024px){ .hp-grid{ grid-template-columns:repeat(3,1fr); } }
        @media(min-width:1280px){ .hp-grid{ grid-template-columns:repeat(4,1fr); } }

        /* ── USER CARD ── */
        .hp-card {
          background:#fff;
          border-radius:28px;
          border:1px solid rgba(15,23,42,0.06);
          padding:28px 22px 22px;
          cursor:pointer; position:relative;
          transition:all 0.35s cubic-bezier(0.34,1.2,0.64,1);
          box-shadow:0 2px 12px rgba(15,23,42,0.05);
          display:flex; flex-direction:column; align-items:center; text-align:center;
          animation:cardIn 0.45s ease both;
        }
        .hp-card:hover {
          transform:translateY(-6px);
          box-shadow:0 20px 50px rgba(25,96,241,0.12);
          border-color:rgba(25,96,241,0.2);
        }

        @keyframes cardIn {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* Avatar */
        .hp-card-avatar-wrap {
          width:88px; height:88px;
          border-radius:26px;
          padding:3px;
          margin-bottom:18px;
          transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
          background:#e2e8f0;
        }
        .hp-card-avatar-wrap.online {
          background:linear-gradient(135deg, #22c55e, #86efac);
          box-shadow:0 4px 16px rgba(34,197,94,0.3);
        }
        .hp-card:hover .hp-card-avatar-wrap { transform:rotate(6deg) scale(1.05); }

        .hp-card-avatar-inner {
          width:100%; height:100%;
          border-radius:23px;
          overflow:hidden;
          background:#f1f5f9;
          border:3px solid #fff;
        }
        .hp-card-avatar-inner img { width:100%; height:100%; object-fit:cover; }

        .hp-online-dot {
          position:absolute; top:108px; right:calc(50% - 56px);
          width:14px; height:14px;
          background:#22c55e;
          border-radius:50%;
          border:3px solid #fff;
          box-shadow:0 0 0 3px rgba(34,197,94,0.2);
          animation:pulse 2s infinite;
        }
        @keyframes pulse {
          0%,100%{ box-shadow:0 0 0 3px rgba(34,197,94,0.2); }
          50%{ box-shadow:0 0 0 6px rgba(34,197,94,0.1); }
        }

        .hp-card-name {
          font-size:17px; font-weight:900;
          letter-spacing:-0.5px; color:#0f172a;
          margin-bottom:4px;
          transition:color 0.2s;
        }
        .hp-card:hover .hp-card-name { color:#1960F1; }

        .hp-card-status {
          font-size:9px; font-weight:800;
          text-transform:uppercase; letter-spacing:2px;
          color:#94a3b8; margin-bottom:20px;
        }
        .hp-card-status.online { color:#22c55e; }

        /* Tags */
        .hp-card-tags {
          display:flex; flex-wrap:wrap;
          justify-content:center; gap:6px;
          min-height:48px; margin-bottom:20px;
        }
        .hp-card-tag {
          padding:5px 12px;
          background:#f1f5f9;
          color:#475569;
          border-radius:8px;
          font-size:10px; font-weight:700;
          text-transform:uppercase; letter-spacing:1px;
          transition:all 0.2s;
        }
        .hp-card:hover .hp-card-tag { background:#eef3ff; color:#1960F1; }

        /* CTA button */
        .hp-card-btn {
          width:100%; padding:14px;
          background:#0f172a; color:#fff;
          border:none; border-radius:18px; cursor:pointer;
          font-size:13px; font-weight:800;
          letter-spacing:0.5px;
          display:flex; align-items:center; justify-content:center; gap:8px;
          transition:all 0.25s cubic-bezier(0.34,1.2,0.64,1);
          box-shadow:0 4px 12px rgba(15,23,42,0.15);
        }
        .hp-card:hover .hp-card-btn {
          background:#1960F1;
          transform:scale(1.03);
          box-shadow:0 8px 24px rgba(25,96,241,0.35);
        }
        .hp-card-btn:active { transform:scale(0.97); }

        /* Unread badge */
        .hp-unread {
          position:absolute; top:-8px; right:-8px;
          width:32px; height:32px;
          background:#ef4444; color:#fff;
          border-radius:12px;
          border:3px solid #f0f4ff;
          display:flex; align-items:center; justify-content:center;
          font-size:12px; font-weight:900;
          box-shadow:0 4px 12px rgba(239,68,68,0.4);
          animation:badgeBounce 0.5s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes badgeBounce {
          from{ transform:scale(0); }
          to{ transform:scale(1); }
        }

        /* Skeleton */
        .hp-skeleton-card {
          background:#fff; border-radius:28px;
          border:1px solid rgba(15,23,42,0.06);
          padding:28px 22px 22px;
          display:flex; flex-direction:column; align-items:center; gap:16px;
        }
        .hp-skel {
          background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);
          background-size:600px 100%;
          animation:shimmer 1.6s infinite;
          border-radius:12px;
        }
        @keyframes shimmer {
          from{ background-position:-600px 0; }
          to{ background-position:600px 0; }
        }
        .hp-skel-avatar { width:88px; height:88px; border-radius:26px; }
        .hp-skel-line { height:11px; }
        .hp-skel-btn { width:100%; height:46px; border-radius:18px; }

        /* ── FOOTER ── */
        .hp-footer {
          margin-top: auto;
          padding: 40px 20px;
          background: #fff;
          border-top: 1px solid #e2e8f0;
          text-align: center;
        }
        .hp-footer-text {
          font-size: 13px;
          font-weight: 700;
          color: #64748b;
          margin-bottom: 8px;
        }
        .hp-footer-email {
          font-size: 12px;
          font-weight: 800;
          color: #1960F1;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .hp-footer-email:hover {
          opacity: 0.8;
          text-decoration: underline;
        }
      `}</style>

      <div className="hp-root" data-theme={theme}>

        {/* ── NAVBAR ── */}
        <nav className="hp-nav">
          <div className="hp-logo" onClick={() => navigate("/")}>
            <span className="hp-logo-text">गफ</span>
            <span className="hp-logo-dot">.</span>
          </div>

          <button className="hp-nav-feed" onClick={() => navigate("/feed")}>
            <Camera size={15} strokeWidth={2.5} />
            Feed
          </button>

          <div className="hp-nav-right">
            <button className="hp-profile-btn" onClick={() => navigate("/profile")}>
              <div className="hp-avatar-ring">
                <img
                  src={authUser?.profilePic || `https://api.dicebear.com/7.x/thumbs/svg?seed=${authUser?.username}`}
                  alt="profile"
                />
              </div>
              <span className="hp-username">{authUser?.username}</span>
            </button>
            <button className="hp-logout" onClick={handleLogout}>
              <LogOut size={18} strokeWidth={2.5} />
            </button>
          </div>
        </nav>

        {/* ── MAIN ── */}
        <main className="hp-main">

          {/* HERO */}
          <section className="hp-hero">
            <div className="hp-hero-left">
              <div className="hp-badge">
                <Sparkles size={11} />
                Live Network
              </div>
              <h2 className="hp-hero-title">
                Find Your <span> Partner</span>
              </h2>
              <div className="hp-interest-tags">
                {authUser?.interests?.slice(0, 4).map(i => (
                  <span key={i} className="hp-tag">#{i}</span>
                ))}
                <button className="hp-settings-btn" onClick={() => navigate("/profile")}>
                  <Settings2 size={16} />
                </button>
              </div>
            </div>
            <div className="hp-hero-stats">
              <div className="hp-stat">
                <p className="hp-stat-num">{suggestedUsers.length}</p>
                <p className="hp-stat-label">Matches</p>
              </div>
              <div className="hp-stat">
                <p className="hp-stat-num green">{Math.max(0, onlineUsers.length - 1)}</p>
                <p className="hp-stat-label">Online</p>
              </div>
            </div>
          </section>

          {/* FEED BANNER */}
          <div className="hp-feed-banner" onClick={() => navigate("/feed")}>
            <div className="hp-feed-left">
              <div className="hp-feed-icon">
                <Camera size={24} color="#fff" />
              </div>
              <div>
                <p className="hp-feed-title">गफ  Feed</p>
                <p className="hp-feed-sub">Share photos · Like · Comment</p>
              </div>
            </div>
            <ChevronRight size={22} color="rgba(255,255,255,0.6)" strokeWidth={3} />
          </div>

          {/* SECTION HEADER */}
          <div className="hp-section-head">
            <p className="hp-section-label">Recommended Guffies</p>
            <div className="hp-section-line" />
          </div>

          {/* GRID */}
          {isLoading ? (
            <div className="hp-grid">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="hp-skeleton-card">
                  <div className="hp-skel hp-skel-avatar" />
                  <div className="hp-skel hp-skel-line" style={{ width: "55%" }} />
                  <div className="hp-skel hp-skel-line" style={{ width: "35%" }} />
                  <div style={{ display: "flex", gap: 8, width: "100%", justifyContent: "center" }}>
                    <div className="hp-skel hp-skel-line" style={{ width: 70, height: 30, borderRadius: 8 }} />
                    <div className="hp-skel hp-skel-line" style={{ width: 70, height: 30, borderRadius: 8 }} />
                  </div>
                  <div className="hp-skel hp-skel-btn" />
                </div>
              ))}
            </div>
          ) : suggestedUsers.length === 0 ? (
            <div className="hp-empty">
              <div className="hp-empty-emoji">😢</div>
              <p className="hp-empty-title">No matches yet</p>
              <p className="hp-empty-sub">Try adding more interests to find your perfect guff partner!</p>
              <button className="hp-empty-btn" onClick={() => navigate("/profile")}>
                Update Interests
              </button>
            </div>
          ) : (
            <div className="hp-grid">
              {suggestedUsers.map((user, idx) => {
                const isOnline = onlineUsers.includes(user._id);
                const unread = unreadCounts[user._id] || 0;
                return (
                  <div
                    key={user._id}
                    className="hp-card"
                    style={{ animationDelay: `${idx * 0.06}s` }}
                    onClick={() => handleMessage(user._id)}
                  >
                    {/* Avatar */}
                    <div className={`hp-card-avatar-wrap ${isOnline ? "online" : ""}`}>
                      <div className="hp-card-avatar-inner">
                        <img
                          src={user.profilePic || `https://api.dicebear.com/7.x/thumbs/svg?seed=${user.username}`}
                          alt={user.username}
                        />
                      </div>
                    </div>
                    {isOnline && <div className="hp-online-dot" />}

                    <p className="hp-card-name">{user.username}</p>
                    <p className={`hp-card-status ${isOnline ? "online" : ""}`}>
                      {isOnline ? "● Active now" : "Offline"}
                    </p>

                    {/* Tags */}
                    <div className="hp-card-tags">
                      {user.interests?.slice(0, 3).map(tag => (
                        <span key={tag} className="hp-card-tag">{tag}</span>
                      ))}
                    </div>

                    {/* CTA */}
                    <button className="hp-card-btn">
                      <MessageCircle size={15} strokeWidth={2.5} />
                      Start Guff
                      <ChevronRight size={14} strokeWidth={3} />
                    </button>

                    {/* Unread */}
                    {unread > 0 && (
                      <div className="hp-unread">{unread}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* ── FOOTER ── */}
        <footer className="hp-footer">
          <p className="hp-footer-text">
            Created By{" "}
            <a
              href="https://ayushdahal.info.np"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#0f172a", textDecoration: "none" }}
            >
              Ayush Dahal
            </a>
          </p>
          <a href="mailto:ayushdahal98@gmail.com" className="hp-footer-email">
            For any query: ayushdahal98@gmail.com
          </a>
        </footer>
      </div>
    </>
  );
};

export default HomePage;
