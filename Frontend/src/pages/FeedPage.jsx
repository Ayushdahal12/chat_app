import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { usePostStore } from "../store/usePostStore";
import { ArrowLeft, Heart, MessageCircle, X, Plus, Loader2, Trash2, ImagePlus } from "lucide-react";

const CLOUDINARY_CLOUD_NAME = "dhcpaoxx1";
const CLOUDINARY_UPLOAD_PRESET = "gg5z1art";

const FeedPage = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const { posts, isLoading, getFeedPosts, createPost, likePost, commentPost, deletePost } = usePostStore();

  const [showCreate, setShowCreate] = useState(false);
  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [activeComment, setActiveComment] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [doubleTapPost, setDoubleTapPost] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const imageInputRef = useRef(null);
  const lastTapRef = useRef({});

  useEffect(() => { getFeedPosts(); }, []);

  // ✅ Fix 1: All helper functions must be inside the FeedPage component
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUploadAndPost = async () => {
    if (!imagePreview) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", imageInputRef.current?.files[0]);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
      const data = await res.json();
      setImageUrl(data.secure_url);
    } catch (err) { console.log(err); }
    finally { setIsUploading(false); }
  };

  const handlePost = async () => {
    if (!imageUrl) { await handleUploadAndPost(); return; }
    setIsPosting(true);
    const res = await createPost(imageUrl, caption);
    if (res.success) {
      setShowCreate(false); setCaption(""); setImagePreview(null); setImageUrl("");
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
    setIsPosting(false);
  };

  useEffect(() => { if (imagePreview && !imageUrl) handleUploadAndPost(); }, [imagePreview]);

  const handleDoubleTap = (postId) => {
    const now = Date.now();
    const lastTap = lastTapRef.current[postId] || 0;
    if (now - lastTap < 300) {
      likePost(postId);
      setDoubleTapPost(postId);
      setLikedPosts(p => ({ ...p, [postId]: true }));
      setTimeout(() => setDoubleTapPost(null), 900);
    }
    lastTapRef.current[postId] = now;
  };

  const handleLike = (postId, isLiked) => {
    likePost(postId);
    setLikedPosts(p => ({ ...p, [postId]: !isLiked }));
  };

  const formatTime = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  if (!authUser) return <div className="feed-loader"><Loader2 className="animate-spin" /></div>;

  return (
    <>
      {/* ✅ Keeping your exact original Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

        :root {
          --ink: #0d0d0d; --ink-soft: #6b7280; --ink-faint: #d1d5db;
          --paper: #fafaf8; --paper-2: #f3f2ef; --accent: #e84040;
          --accent-2: #ff6b35; --gold: #f5a623; --blue: #1a56db;
          --surface: #ffffff; --border: rgba(0,0,0,0.07);
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
          --shadow-md: 0 4px 16px rgba(0,0,0,0.08);
          --radius: 20px; --radius-sm: 12px;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        .feed-root { min-height: 100vh; background: var(--paper); font-family: 'DM Sans', sans-serif; color: var(--ink); }
        .feed-header { position: sticky; top: 0; z-index: 100; background: rgba(250,250,248,0.88); backdrop-filter: blur(24px); border-bottom: 1px solid var(--border); padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; }
        .feed-header-left { display: flex; align-items: center; gap: 12px; }
        .back-btn { width: 38px; height: 38px; border-radius: 50%; border: 1.5px solid var(--border); background: var(--surface); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
        .feed-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: var(--ink); }
        .feed-logo span { color: #1960F1; }
        .post-btn { display: flex; align-items: center; gap: 6px; background: var(--ink); color: white; border: none; cursor: pointer; padding: 10px 18px; border-radius: 100px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; }
        .feed-container { max-width: 520px; margin: 0 auto; padding: 24px 16px 100px; display: flex; flex-direction: column; gap: 20px; }
        
        .post-card { background: var(--surface); border-radius: var(--radius); border: 1px solid var(--border); box-shadow: var(--shadow-sm); overflow: hidden; animation: fadeUp 0.4s ease both; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        
        .post-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; }
        .post-user { display: flex; align-items: center; gap: 10px; }
        .post-avatar { width: 42px; height: 42px; border-radius: 14px; object-fit: cover; border: 1.5px solid var(--border); }
        .post-username { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; }
        .post-image-wrap { width: 100%; aspect-ratio: 1/1; position: relative; overflow: hidden; background: var(--paper-2); }
        .post-image-wrap img { width: 100%; height: 100%; object-fit: cover; }
        
        .post-actions { padding: 12px 16px 4px; display: flex; align-items: center; gap: 16px; }
        .action-btn { background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; color: var(--ink-soft); }
        .action-btn.liked { color: var(--accent); }
        .post-body { padding: 4px 16px 16px; }
        .post-caption { font-size: 14px; line-height: 1.55; }
        .post-caption strong { font-weight: 700; margin-right: 6px; }

        /* Modal Styles */
        .modal-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(10,10,10,0.6); backdrop-filter: blur(12px); display: flex; align-items: flex-end; justify-content: center; }
        @media (min-width: 640px) { .modal-overlay { align-items: center; padding: 20px; } }
        .create-modal { background: var(--surface); width: 100%; max-width: 480px; border-radius: 28px 28px 0 0; padding: 28px 24px 32px; max-height: 90vh; overflow-y: auto; }
        @media (min-width: 640px) { .create-modal { border-radius: 28px; } }
        .upload-zone { width: 100%; aspect-ratio: 1/1; border-radius: var(--radius); border: 2px dashed var(--ink-faint); display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; overflow: hidden; }
        .upload-zone img { width: 100%; height: 100%; object-fit: cover; }
        .caption-input { width: 100%; margin-top: 14px; padding: 14px 16px; border-radius: var(--radius-sm); border: 1.5px solid var(--border); background: var(--paper-2); resize: none; outline: none; }
        .share-btn { width: 100%; margin-top: 14px; padding: 16px; background: var(--ink); color: white; border: none; border-radius: var(--radius-sm); font-family: 'Syne', sans-serif; font-weight: 800; cursor: pointer; }
        .feed-loader { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
      `}</style>

      <div className="feed-root">
        <header className="feed-header">
          <div className="feed-header-left">
            <button className="back-btn" onClick={() => navigate("/")}><ArrowLeft size={18} /></button>
            <h1 className="feed-logo">गफ <span>Feed</span></h1>
          </div>
          <button className="post-btn" onClick={() => setShowCreate(true)}><Plus size={15} /> New Post</button>
        </header>

        <div className="feed-container">
          {isLoading ? (
            <div className="feed-loader"><Loader2 className="animate-spin" /></div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <p className="empty-title">Nothing here yet</p>
              <button className="empty-cta" onClick={() => setShowCreate(true)}>Create First Post</button>
            </div>
          ) : (
            posts.map((post, idx) => {
              // ✅ Fix 2: Add optional chaining to prevent the _id crash
              const isLiked = authUser && post.likes ? post.likes.includes(authUser._id) : false;
              const isMyPost = authUser && post.userId?._id === authUser._id;

              // Skip rendering if user data is missing for a post
              if (!post.userId) return null;

              return (
                <div key={post._id} className="post-card" style={{ animationDelay: `${idx * 0.07}s` }}>
                  <div className="post-header">
                    <div className="post-user">
                      <img className="post-avatar" src={post.userId?.profilePic || `https://api.dicebear.com/7.x/thumbs/svg?seed=${post.userId?.username}`} alt="user" />
                      <div>
                        <p className="post-username">{post.userId?.username}</p>
                        <p className="post-time">{formatTime(post.createdAt)} ago</p>
                      </div>
                    </div>
                    {isMyPost && <button className="delete-btn" onClick={() => deletePost(post._id)}><Trash2 size={16} /></button>}
                  </div>

                  <div className="post-image-wrap" onClick={() => handleDoubleTap(post._id)}>
                    <img src={post.image} alt="post" />
                    {doubleTapPost === post._id && (
                      <div className="heart-burst"><Heart size={90} fill="#e84040" color="#e84040" /></div>
                    )}
                  </div>

                  <div className="post-actions">
                    <button className={`action-btn ${isLiked ? "liked" : ""}`} onClick={() => handleLike(post._id, isLiked)}>
                      <Heart size={24} fill={isLiked ? "#e84040" : "none"} />
                      <span className="action-count">{post.likes?.length || 0}</span>
                    </button>
                    <button className="action-btn" onClick={() => setActiveComment(post._id)}>
                      <MessageCircle size={24} />
                      <span className="action-count">{post.comments?.length || 0}</span>
                    </button>
                  </div>

                  <div className="post-body">
                    {post.caption && (
                      <p className="post-caption"><strong>{post.userId?.username}</strong> {post.caption}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {showCreate && (
          <div className="modal-overlay" onClick={() => setShowCreate(false)}>
            <div className="create-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">New Post</h2>
                <button className="modal-close" onClick={() => setShowCreate(false)}><X size={18} /></button>
              </div>
              <input type="file" hidden ref={imageInputRef} onChange={handleImageSelect} accept="image/*" />
              <div className="upload-zone" onClick={() => imageInputRef.current.click()}>
                {imagePreview ? <img src={imagePreview} /> : <div className="upload-placeholder"><ImagePlus /> <p>Click to upload</p></div>}
                {isUploading && <div className="uploading-overlay"><Loader2 className="animate-spin" /><p>Uploading...</p></div>}
              </div>
              <textarea className="caption-input" placeholder="Write a caption..." value={caption} onChange={(e) => setCaption(e.target.value)} />
              <button className="share-btn" disabled={isUploading || isPosting || !imagePreview} onClick={handlePost}>
                {isPosting ? "Posting..." : "Share Post"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FeedPage;