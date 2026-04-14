// // import { useEffect, useState, useRef } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { useAuthStore } from "../store/useAuthStore";
// // import { usePostStore } from "../store/usePostStore";
// // import { ArrowLeft, Heart, MessageCircle, X, Plus, Loader2, Trash2, Send, Sparkles, ImagePlus } from "lucide-react";

// // const CLOUDINARY_CLOUD_NAME = "dhcpaoxx1";
// // const CLOUDINARY_UPLOAD_PRESET = "gg5z1art";

// // const FeedPage = () => {
// //   const navigate = useNavigate();
// //   const { authUser } = useAuthStore();
// //   const { posts, isLoading, getFeedPosts, createPost, likePost, commentPost, deletePost } = usePostStore();

// //   const [showCreate, setShowCreate] = useState(false);
// //   const [caption, setCaption] = useState("");
// //   const [imagePreview, setImagePreview] = useState(null);
// //   const [imageUrl, setImageUrl] = useState("");
// //   const [isUploading, setIsUploading] = useState(false);
// //   const [isPosting, setIsPosting] = useState(false);
// //   const [activeComment, setActiveComment] = useState(null);
// //   const [commentText, setCommentText] = useState("");
// //   const [doubleTapPost, setDoubleTapPost] = useState(null);
// //   const [likedPosts, setLikedPosts] = useState({});
// //   const imageInputRef = useRef(null);
// //   const lastTapRef = useRef({});


// //   useEffect(() => { getFeedPosts(); }, []);

// //   // ✅ GUARD — after ALL hooks
// //   if (!authUser) {
// //     return (
// //       <div style={{
// //         minHeight: "100vh",
// //         display: "flex",
// //         alignItems: "center",
// //         justifyContent: "center",
// //         background: "#fafaf8",
// //       }}>
// //         <div style={{
// //           width: 40, height: 40,
// //           border: "3px solid #e84040",
// //           borderTopColor: "transparent",
// //           borderRadius: "50%",
// //           animation: "spin 0.8s linear infinite",
// //         }} />
// //         <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
// //       </div>
// //     );
// //   }
// // }

// // const handleImageSelect = (e) => {

// //   const handleImageSelect = (e) => {
// //     const file = e.target.files[0];
// //     if (!file) return;
// //     const reader = new FileReader();
// //     reader.onload = () => setImagePreview(reader.result);
// //     reader.readAsDataURL(file);
// //   };

// //   const handleUploadAndPost = async () => {
// //     if (!imagePreview) return;
// //     setIsUploading(true);
// //     try {
// //       const formData = new FormData();
// //       formData.append("file", imageInputRef.current?.files[0]);
// //       formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
// //       const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
// //       const data = await res.json();
// //       setImageUrl(data.secure_url);
// //     } catch (err) { console.log(err); }
// //     finally { setIsUploading(false); }
// //   };

// //   const handlePost = async () => {
// //     if (!imageUrl) { await handleUploadAndPost(); return; }
// //     setIsPosting(true);
// //     const res = await createPost(imageUrl, caption);
// //     if (res.success) {
// //       setShowCreate(false); setCaption(""); setImagePreview(null); setImageUrl("");
// //       if (imageInputRef.current) imageInputRef.current.value = "";
// //     }
// //     setIsPosting(false);
// //   };

// //   useEffect(() => { if (imagePreview && !imageUrl) handleUploadAndPost(); }, [imagePreview]);

// //   const handleDoubleTap = (postId) => {
// //     const now = Date.now();
// //     const lastTap = lastTapRef.current[postId] || 0;
// //     if (now - lastTap < 300) {
// //       likePost(postId);
// //       setDoubleTapPost(postId);
// //       setLikedPosts(p => ({ ...p, [postId]: true }));
// //       setTimeout(() => setDoubleTapPost(null), 900);
// //     }
// //     lastTapRef.current[postId] = now;
// //   };

// //   const handleLike = (postId, isLiked) => {
// //     likePost(postId);
// //     setLikedPosts(p => ({ ...p, [postId]: !isLiked }));
// //   };

// //   const handleComment = async (postId) => {
// //     if (!commentText.trim()) return;
// //     await commentPost(postId, commentText);
// //     setCommentText("");
// //   };

// //   const formatTime = (date) => {
// //     const diff = Math.floor((new Date() - new Date(date)) / 1000);
// //     if (diff < 60) return "just now";
// //     if (diff < 3600) return `${Math.floor(diff / 60)}m`;
// //     if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
// //     return `${Math.floor(diff / 86400)}d`;
// //   };

// //   return (
// //     <>
// //       <style>{`
// //         @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

// //         :root {
// //           --ink: #0d0d0d;
// //           --ink-soft: #6b7280;
// //           --ink-faint: #d1d5db;
// //           --paper: #fafaf8;
// //           --paper-2: #f3f2ef;
// //           --accent: #e84040;
// //           --accent-2: #ff6b35;
// //           --gold: #f5a623;
// //           --blue: #1a56db;
// //           --surface: #ffffff;
// //           --border: rgba(0,0,0,0.07);
// //           --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
// //           --shadow-md: 0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
// //           --shadow-lg: 0 20px 60px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.06);
// //           --radius: 20px;
// //           --radius-sm: 12px;
// //         }

// //         * { box-sizing: border-box; margin: 0; padding: 0; }

// //         .feed-root {
// //           min-height: 100vh;
// //           background: var(--paper);
// //           font-family: 'DM Sans', sans-serif;
// //           color: var(--ink);
// //         }

// //         /* ── HEADER ── */
// //         .feed-header {
// //           position: sticky; top: 0; z-index: 100;
// //           background: rgba(250,250,248,0.88);
// //           backdrop-filter: blur(24px) saturate(180%);
// //           -webkit-backdrop-filter: blur(24px) saturate(180%);
// //           border-bottom: 1px solid var(--border);
// //           padding: 14px 20px;
// //           display: flex; align-items: center; justify-content: space-between;
// //         }
// //         .feed-header-left { display: flex; align-items: center; gap: 12px; }
// //         .back-btn {
// //           width: 38px; height: 38px; border-radius: 50%;
// //           border: 1.5px solid var(--border);
// //           background: var(--surface);
// //           display: flex; align-items: center; justify-content: center;
// //           cursor: pointer; color: var(--ink);
// //           box-shadow: var(--shadow-sm);
// //           transition: all 0.2s;
// //         }
// //         .back-btn:hover { transform: translateX(-2px); box-shadow: var(--shadow-md); }
// //         .feed-logo {
// //           font-family: 'Syne', sans-serif;
// //           font-weight: 800; font-size: 22px;
// //           letter-spacing: -0.5px;
// //           color: var(--ink);
// //         }
// //        .feed-logo span { 
// //   color: #1960F1; 
// // }
// //         .post-btn {
// //           display: flex; align-items: center; gap: 6px;
// //           background: var(--ink);
// //           color: white;
// //           border: none; cursor: pointer;
// //           padding: 10px 18px;
// //           border-radius: 100px;
// //           font-family: 'Syne', sans-serif;
// //           font-weight: 700; font-size: 13px;
// //           letter-spacing: 0.3px;
// //           box-shadow: 0 4px 14px rgba(0,0,0,0.2);
// //           transition: all 0.2s;
// //         }
// //         .post-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.25); }
// //         .post-btn:active { transform: scale(0.96); }

// //         /* ── FEED CONTAINER ── */
// //         .feed-container {
// //           max-width: 520px; margin: 0 auto;
// //           padding: 24px 16px 100px;
// //           display: flex; flex-direction: column; gap: 20px;
// //         }

// //         /* ── STORIES STRIP ── */
// //         .stories-strip {
// //           display: flex; gap: 12px; overflow-x: auto;
// //           padding: 4px 2px;
// //           scrollbar-width: none;
// //         }
// //         .stories-strip::-webkit-scrollbar { display: none; }
// //         .story-item {
// //           display: flex; flex-direction: column; align-items: center; gap: 6px;
// //           flex-shrink: 0; cursor: pointer;
// //         }
// //         .story-ring {
// //           width: 58px; height: 58px; border-radius: 50%;
// //           background: linear-gradient(135deg, var(--accent), var(--gold));
// //           padding: 2.5px;
// //           box-shadow: 0 2px 8px rgba(232,64,64,0.3);
// //         }
// //         .story-ring img {
// //           width: 100%; height: 100%; border-radius: 50%;
// //           object-fit: cover;
// //           border: 2.5px solid var(--paper);
// //         }
// //         .story-name {
// //           font-size: 10px; font-weight: 600;
// //           color: var(--ink-soft); letter-spacing: 0.2px;
// //           max-width: 58px; text-align: center;
// //           white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
// //         }

// //         /* ── POST CARD ── */
// //         .post-card {
// //           background: var(--surface);
// //           border-radius: var(--radius);
// //           border: 1px solid var(--border);
// //           box-shadow: var(--shadow-sm);
// //           overflow: hidden;
// //           transition: box-shadow 0.3s;
// //           animation: fadeUp 0.4s ease both;
// //         }
// //         .post-card:hover { box-shadow: var(--shadow-md); }

// //         @keyframes fadeUp {
// //           from { opacity: 0; transform: translateY(16px); }
// //           to   { opacity: 1; transform: translateY(0); }
// //         }

// //         .post-header {
// //           display: flex; align-items: center; justify-content: space-between;
// //           padding: 14px 16px;
// //         }
// //         .post-user { display: flex; align-items: center; gap: 10px; }
// //         .post-avatar {
// //           width: 42px; height: 42px; border-radius: 14px;
// //           object-fit: cover;
// //           border: 1.5px solid var(--border);
// //         }
// //         .post-username {
// //           font-family: 'Syne', sans-serif;
// //           font-weight: 700; font-size: 14px; color: var(--ink);
// //         }
// //         .post-time {
// //           font-size: 11px; color: var(--ink-faint);
// //           font-weight: 500; letter-spacing: 0.3px;
// //           margin-top: 1px;
// //         }
// //         .delete-btn {
// //           width: 34px; height: 34px; border-radius: 10px;
// //           border: none; background: transparent; cursor: pointer;
// //           display: flex; align-items: center; justify-content: center;
// //           color: var(--ink-faint); transition: all 0.2s;
// //         }
// //         .delete-btn:hover { background: #fee2e2; color: var(--accent); }

// //         /* ── POST IMAGE ── */
// //         .post-image-wrap {
// //           width: 100%; aspect-ratio: 1/1;
// //           position: relative; overflow: hidden; cursor: pointer;
// //           background: var(--paper-2);
// //         }
// //         .post-image-wrap img {
// //           width: 100%; height: 100%; object-fit: cover;
// //           transition: transform 0.4s ease;
// //         }
// //         .post-image-wrap:hover img { transform: scale(1.02); }

// //         /* Heart animation */
// //         .heart-burst {
// //           position: absolute; inset: 0;
// //           display: flex; align-items: center; justify-content: center;
// //           pointer-events: none;
// //           animation: heartPop 0.9s ease forwards;
// //         }
// //         .heart-burst-icon {
// //           filter: drop-shadow(0 0 20px rgba(232,64,64,0.6));
// //           animation: heartScale 0.9s ease forwards;
// //         }
// //         @keyframes heartPop {
// //           0%   { opacity: 0; }
// //           20%  { opacity: 1; }
// //           80%  { opacity: 1; }
// //           100% { opacity: 0; }
// //         }
// //         @keyframes heartScale {
// //           0%   { transform: scale(0.3); }
// //           40%  { transform: scale(1.3); }
// //           70%  { transform: scale(0.95); }
// //           100% { transform: scale(1.1); }
// //         }

// //         /* ── POST ACTIONS ── */
// //         .post-actions {
// //           padding: 12px 16px 4px;
// //           display: flex; align-items: center; gap: 16px;
// //         }
// //         .action-btn {
// //           background: none; border: none; cursor: pointer;
// //           display: flex; align-items: center; gap: 6px;
// //           padding: 6px 0; color: var(--ink-soft);
// //           transition: all 0.2s;
// //         }
// //         .action-btn:hover { color: var(--ink); }
// //         .action-btn:active { transform: scale(0.9); }
// //         .like-btn.liked { color: var(--accent); }
// //         .like-btn.liked svg { fill: var(--accent); }
// //         .action-count {
// //           font-size: 13px; font-weight: 600; color: inherit;
// //         }

// //         /* ── POST BODY ── */
// //         .post-body { padding: 4px 16px 16px; }
// //         .post-likes {
// //           font-family: 'Syne', sans-serif;
// //           font-weight: 700; font-size: 13px;
// //           color: var(--ink); margin-bottom: 6px;
// //         }
// //         .post-caption { font-size: 14px; line-height: 1.55; color: var(--ink); }
// //         .post-caption strong { font-weight: 700; margin-right: 6px; }
// //         .view-comments {
// //           background: none; border: none; cursor: pointer;
// //           font-size: 12px; font-weight: 600;
// //           color: var(--ink-soft); letter-spacing: 0.3px;
// //           margin-top: 6px; display: block;
// //           transition: color 0.2s;
// //         }
// //         .view-comments:hover { color: var(--blue); }

// //         /* ── LOADING / EMPTY ── */
// //         .feed-loader {
// //           display: flex; flex-direction: column;
// //           align-items: center; justify-content: center;
// //           min-height: 60vh; gap: 16px; color: var(--ink-soft);
// //         }
// //         .empty-state {
// //           display: flex; flex-direction: column;
// //           align-items: center; justify-content: center;
// //           min-height: 55vh; gap: 12px; text-align: center;
// //         }
// //         .empty-icon {
// //           width: 80px; height: 80px; border-radius: 24px;
// //           background: var(--paper-2);
// //           display: flex; align-items: center; justify-content: center;
// //           font-size: 36px; margin-bottom: 8px;
// //         }
// //         .empty-title {
// //           font-family: 'Syne', sans-serif;
// //           font-weight: 800; font-size: 20px; color: var(--ink);
// //         }
// //         .empty-sub { font-size: 14px; color: var(--ink-soft); max-width: 200px; }
// //         .empty-cta {
// //           margin-top: 8px; padding: 12px 28px;
// //           background: var(--ink); color: white;
// //           border: none; border-radius: 100px;
// //           font-family: 'Syne', sans-serif;
// //           font-weight: 700; font-size: 14px;
// //           cursor: pointer; transition: all 0.2s;
// //           box-shadow: 0 4px 14px rgba(0,0,0,0.2);
// //         }
// //         .empty-cta:hover { transform: translateY(-2px); }

// //         /* ── MODAL OVERLAY ── */
// //         .modal-overlay {
// //           position: fixed; inset: 0; z-index: 200;
// //           background: rgba(10,10,10,0.6);
// //           backdrop-filter: blur(12px);
// //           display: flex; align-items: flex-end;
// //           justify-content: center;
// //           padding: 0;
// //           animation: overlayIn 0.2s ease;
// //         }
// //         @keyframes overlayIn {
// //           from { opacity: 0; }
// //           to   { opacity: 1; }
// //         }
// //         @media (min-width: 640px) {
// //           .modal-overlay { align-items: center; padding: 20px; }
// //         }

// //         /* ── CREATE POST MODAL ── */
// //         .create-modal {
// //           background: var(--surface);
// //           width: 100%; max-width: 480px;
// //           border-radius: 28px 28px 0 0;
// //           padding: 28px 24px 32px;
// //           animation: slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1);
// //           max-height: 90vh; overflow-y: auto;
// //         }
// //         @media (min-width: 640px) {
// //           .create-modal { border-radius: 28px; }
// //         }
// //         @keyframes slideUp {
// //           from { transform: translateY(60px); opacity: 0; }
// //           to   { transform: translateY(0); opacity: 1; }
// //         }
// //         .modal-header {
// //           display: flex; align-items: center; justify-content: space-between;
// //           margin-bottom: 22px;
// //         }
// //         .modal-title {
// //           font-family: 'Syne', sans-serif;
// //           font-weight: 800; font-size: 20px; color: var(--ink);
// //         }
// //         .modal-close {
// //           width: 36px; height: 36px; border-radius: 50%;
// //           border: 1.5px solid var(--border);
// //           background: var(--paper-2);
// //           display: flex; align-items: center; justify-content: center;
// //           cursor: pointer; color: var(--ink-soft); transition: all 0.2s;
// //         }
// //         .modal-close:hover { background: var(--ink); color: white; }

// //         .upload-zone {
// //           width: 100%; aspect-ratio: 1/1;
// //           border-radius: var(--radius);
// //           overflow: hidden;
// //           border: 2px dashed var(--ink-faint);
// //           background: var(--paper-2);
// //           display: flex; align-items: center; justify-content: center;
// //           cursor: pointer; transition: all 0.3s;
// //           position: relative;
// //         }
// //         .upload-zone:hover { border-color: var(--ink-soft); background: #f0f0ec; }
// //         .upload-zone.has-image { border: none; }
// //         .upload-zone img { width: 100%; height: 100%; object-fit: cover; }
// //         .upload-placeholder {
// //           display: flex; flex-direction: column;
// //           align-items: center; gap: 10px; color: var(--ink-faint);
// //         }
// //         .upload-placeholder svg { opacity: 0.5; }
// //         .upload-placeholder p { font-size: 13px; font-weight: 600; }
// //         .upload-placeholder span { font-size: 11px; }

// //         .uploading-overlay {
// //           position: absolute; inset: 0;
// //           background: rgba(255,255,255,0.85);
// //           display: flex; align-items: center; justify-content: center;
// //           flex-direction: column; gap: 8px;
// //         }
// //         .uploading-overlay p { font-size: 12px; font-weight: 600; color: var(--ink-soft); }

// //         .caption-input {
// //           width: 100%; margin-top: 14px;
// //           padding: 14px 16px;
// //           border-radius: var(--radius-sm);
// //           border: 1.5px solid var(--border);
// //           background: var(--paper-2);
// //           font-family: 'DM Sans', sans-serif;
// //           font-size: 14px; color: var(--ink);
// //           resize: none; outline: none;
// //           transition: border-color 0.2s;
// //           line-height: 1.6;
// //         }
// //         .caption-input:focus { border-color: var(--ink); background: white; }
// //         .caption-input::placeholder { color: var(--ink-faint); }

// //         .share-btn {
// //           width: 100%; margin-top: 14px;
// //           padding: 16px;
// //           background: var(--ink);
// //           color: white; border: none; cursor: pointer;
// //           border-radius: var(--radius-sm);
// //           font-family: 'Syne', sans-serif;
// //           font-weight: 800; font-size: 15px;
// //           letter-spacing: 0.3px;
// //           box-shadow: 0 4px 20px rgba(0,0,0,0.2);
// //           transition: all 0.2s;
// //           display: flex; align-items: center; justify-content: center; gap: 8px;
// //         }
// //         .share-btn:hover:not(:disabled) { background: #1a1a1a; transform: translateY(-1px); }
// //         .share-btn:active:not(:disabled) { transform: scale(0.98); }
// //         .share-btn:disabled { opacity: 0.4; cursor: not-allowed; }

// //         /* ── COMMENT MODAL ── */
// //         .comment-modal {
// //           background: var(--surface);
// //           width: 100%; max-width: 520px;
// //           border-radius: 28px 28px 0 0;
// //           max-height: 85vh;
// //           display: flex; flex-direction: column;
// //           animation: slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1);
// //         }
// //         @media (min-width: 640px) {
// //           .comment-modal { border-radius: 28px; max-height: 70vh; }
// //         }
// //         .comment-modal-header {
// //           padding: 22px 22px 0;
// //           display: flex; align-items: center; justify-content: space-between;
// //           border-bottom: 1px solid var(--border);
// //           padding-bottom: 16px;
// //           flex-shrink: 0;
// //         }
// //         .comment-list {
// //           flex: 1; overflow-y: auto; padding: 16px 20px;
// //           display: flex; flex-direction: column; gap: 14px;
// //         }
// //         .comment-list::-webkit-scrollbar { width: 3px; }
// //         .comment-list::-webkit-scrollbar-track { background: transparent; }
// //         .comment-list::-webkit-scrollbar-thumb { background: var(--ink-faint); border-radius: 10px; }
// //         .comment-item { display: flex; align-items: flex-start; gap: 10px; }
// //         .comment-avatar {
// //           width: 36px; height: 36px; border-radius: 12px;
// //           object-fit: cover; flex-shrink: 0;
// //           border: 1px solid var(--border);
// //         }
// //         .comment-bubble {
// //           flex: 1; background: var(--paper-2);
// //           border-radius: 4px 16px 16px 16px;
// //           padding: 10px 14px;
// //         }
// //         .comment-author {
// //           font-family: 'Syne', sans-serif;
// //           font-weight: 700; font-size: 12px;
// //           color: var(--blue); margin-bottom: 3px;
// //         }
// //         .comment-text { font-size: 13px; color: var(--ink); line-height: 1.5; }
// //         .no-comments {
// //           text-align: center; padding: 40px 20px;
// //           color: var(--ink-faint); font-size: 14px; font-weight: 500;
// //         }
// //         .comment-input-row {
// //           padding: 14px 16px;
// //           border-top: 1px solid var(--border);
// //           display: flex; align-items: center; gap: 10px;
// //           flex-shrink: 0;
// //         }
// //         .comment-my-avatar {
// //           width: 36px; height: 36px; border-radius: 12px;
// //           object-fit: cover; flex-shrink: 0;
// //         }
// //         .comment-input-wrap {
// //           flex: 1; display: flex; align-items: center; gap: 8px;
// //           background: var(--paper-2); border-radius: 100px;
// //           padding: 10px 14px;
// //           border: 1.5px solid transparent;
// //           transition: border-color 0.2s;
// //         }
// //         .comment-input-wrap:focus-within { border-color: var(--ink); background: white; }
// //         .comment-input {
// //           flex: 1; background: none; border: none; outline: none;
// //           font-family: 'DM Sans', sans-serif;
// //           font-size: 13px; color: var(--ink);
// //         }
// //         .comment-input::placeholder { color: var(--ink-faint); }
// //         .send-btn {
// //           width: 32px; height: 32px; border-radius: 50%;
// //           background: var(--ink); border: none; cursor: pointer;
// //           display: flex; align-items: center; justify-content: center;
// //           color: white; flex-shrink: 0;
// //           transition: all 0.2s;
// //         }
// //         .send-btn:hover:not(:disabled) { background: var(--accent); transform: scale(1.1); }
// //         .send-btn:disabled { opacity: 0.3; cursor: not-allowed; }

// //         /* ── SKELETON LOADER ── */
// //         .skeleton-card {
// //           background: var(--surface);
// //           border-radius: var(--radius);
// //           border: 1px solid var(--border);
// //           overflow: hidden;
// //         }
// //         .skeleton-header { padding: 14px 16px; display: flex; align-items: center; gap: 10px; }
// //         .skeleton-avatar { width: 42px; height: 42px; border-radius: 14px; }
// //         .skeleton-lines { display: flex; flex-direction: column; gap: 6px; flex: 1; }
// //         .skeleton-line { height: 10px; border-radius: 6px; }
// //         .skeleton-image { width: 100%; aspect-ratio: 1/1; }
// //         .skeleton-footer { padding: 14px 16px; display: flex; gap: 16px; }
// //         .skeleton-action { width: 50px; height: 10px; border-radius: 6px; }
// //         @keyframes shimmer {
// //           0%   { background-position: -400px 0; }
// //           100% { background-position: 400px 0; }
// //         }
// //         .shimmer {
// //           background: linear-gradient(90deg, var(--paper-2) 25%, #e8e8e4 50%, var(--paper-2) 75%);
// //           background-size: 800px 100%;
// //           animation: shimmer 1.6s infinite;
// //         }
// //       `}</style>

// //       <div className="feed-root">

// //         {/* ── HEADER ── */}
// //         <header className="feed-header">
// //           <div className="feed-header-left">
// //             <button className="back-btn" onClick={() => navigate("/")}>
// //               <ArrowLeft size={18} strokeWidth={2.5} />
// //             </button>
// //             <h1 className="feed-logo">गफ <span>Feed</span></h1>
// //           </div>
// //           <button className="post-btn" onClick={() => setShowCreate(true)}>
// //             <Plus size={15} strokeWidth={3} />
// //             New Post
// //           </button>
// //         </header>

// //         {/* ── MAIN FEED ── */}
// //         <div className="feed-container">

// //           {isLoading ? (
// //             /* Skeleton loaders */
// //             [1, 2, 3].map(i => (
// //               <div key={i} className="skeleton-card">
// //                 <div className="skeleton-header">
// //                   <div className="skeleton-avatar shimmer" />
// //                   <div className="skeleton-lines">
// //                     <div className="skeleton-line shimmer" style={{ width: "40%" }} />
// //                     <div className="skeleton-line shimmer" style={{ width: "25%" }} />
// //                   </div>
// //                 </div>
// //                 <div className="skeleton-image shimmer" />
// //                 <div className="skeleton-footer">
// //                   <div className="skeleton-action shimmer" />
// //                   <div className="skeleton-action shimmer" />
// //                 </div>
// //               </div>
// //             ))
// //           ) : posts.length === 0 ? (
// //             <div className="empty-state">
// //               <div className="empty-icon">📸</div>
// //               <p className="empty-title">Nothing here yet</p>
// //               <p className="empty-sub">Be the first to share a moment!</p>
// //               <button className="empty-cta" onClick={() => setShowCreate(true)}>
// //                 Create First Post
// //               </button>
// //             </div>
// //           ) : !authUser ? (
// //             <div className="empty-state">
// //               <div className="empty-icon">🔒</div>
// //               <p className="empty-title">Please login first</p>
// //             </div>
// //           ) : (
// //             posts.map((post, idx) => {
// //               const isLiked = authUser ? post.likes.includes(authUser._id) : false;
// //               const isMyPost = authUser ? post.userId?._id === authUser._id : false;

// //               return (
// //                 <div
// //                   key={post._id}
// //                   className="post-card"
// //                   style={{ animationDelay: `${idx * 0.07}s` }}
// //                 >
// //                   {/* Header */}
// //                   <div className="post-header">
// //                     <div className="post-user">
// //                       <img
// //                         className="post-avatar"
// //                         src={post.userId.profilePic || `https://api.dicebear.com/7.x/thumbs/svg?seed=${post.userId.username}`}
// //                         alt={post.userId.username}
// //                       />
// //                       <div>
// //                         <p className="post-username">{post.userId.username}</p>
// //                         <p className="post-time">{formatTime(post.createdAt)} ago</p>
// //                       </div>
// //                     </div>
// //                     {isMyPost && (
// //                       <button className="delete-btn" onClick={() => deletePost(post._id)}>
// //                         <Trash2 size={16} />
// //                       </button>
// //                     )}
// //                   </div>

// //                   {/* Image */}
// //                   <div className="post-image-wrap" onClick={() => handleDoubleTap(post._id)}>
// //                     <img src={post.image} alt="post" />
// //                     {doubleTapPost === post._id && (
// //                       <div className="heart-burst">
// //                         <Heart size={90} className="heart-burst-icon" fill="#e84040" color="#e84040" />
// //                       </div>
// //                     )}
// //                   </div>

// //                   {/* Actions */}
// //                   <div className="post-actions">
// //                     <button
// //                       className={`action-btn like-btn ${isLiked ? "liked" : ""}`}
// //                       onClick={() => handleLike(post._id, isLiked)}
// //                     >
// //                       <Heart
// //                         size={24}
// //                         strokeWidth={isLiked ? 0 : 2}
// //                         fill={isLiked ? "#e84040" : "none"}
// //                         color={isLiked ? "#e84040" : "currentColor"}
// //                         style={{ transition: "all 0.2s" }}
// //                       />
// //                       <span className="action-count">{post.likes.length}</span>
// //                     </button>
// //                     <button className="action-btn" onClick={() => setActiveComment(post._id)}>
// //                       <MessageCircle size={24} strokeWidth={2} />
// //                       <span className="action-count">{post.comments.length}</span>
// //                     </button>
// //                   </div>

// //                   {/* Body */}
// //                   <div className="post-body">
// //                     <p className="post-likes">
// //                       {post.likes.length} {post.likes.length === 1 ? "love" : "loves"}
// //                     </p>
// //                     {post.caption && (
// //                       <p className="post-caption">
// //                         <strong>{post.userId.username}</strong>
// //                         {post.caption}
// //                       </p>
// //                     )}
// //                     {post.comments.length > 0 && (
// //                       <button className="view-comments" onClick={() => setActiveComment(post._id)}>
// //                         View all {post.comments.length} comment{post.comments.length !== 1 ? "s" : ""}
// //                       </button>
// //                     )}
// //                   </div>
// //                 </div>
// //               );
// //             })
// //           )}
// //         </div>

// //         {/* ── CREATE POST MODAL ── */}
// //         {showCreate && (
// //           <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}>
// //             <div className="create-modal">
// //               <div className="modal-header">
// //                 <h2 className="modal-title">New Post</h2>
// //                 <button
// //                   className="modal-close"
// //                   onClick={() => { setShowCreate(false); setImagePreview(null); setImageUrl(""); setCaption(""); }}
// //                 >
// //                   <X size={18} />
// //                 </button>
// //               </div>

// //               <label className={`upload-zone ${imagePreview ? "has-image" : ""}`}>
// //                 {imagePreview ? (
// //                   <>
// //                     <img src={imagePreview} alt="preview" />
// //                     {isUploading && (
// //                       <div className="uploading-overlay">
// //                         <Loader2 size={28} color="#0d0d0d" style={{ animation: "spin 1s linear infinite" }} />
// //                         <p>Uploading...</p>
// //                       </div>
// //                     )}
// //                   </>
// //                 ) : !authUser ? (
// //                   <div className="empty-state">
// //                     <p className="empty-title">Please login first</p>
// //                   </div>
// //                 ) : (
// //                   <div className="upload-placeholder">
// //                     <ImagePlus size={40} />
// //                     <p>Tap to add photo</p>
// //                     <span>Square 1:1 recommended</span>
// //                   </div>
// //                 )}
// //                 <input
// //                   ref={imageInputRef}
// //                   type="file"
// //                   accept="image/*"
// //                   style={{ display: "none" }}
// //                   onChange={handleImageSelect}
// //                 />
// //               </label>

// //               <textarea
// //                 className="caption-input"
// //                 placeholder="Write something..."
// //                 rows={3}
// //                 value={caption}
// //                 onChange={(e) => setCaption(e.target.value)}
// //               />

// //               <button
// //                 className="share-btn"
// //                 onClick={handlePost}
// //                 disabled={!imagePreview || isUploading || isPosting}
// //               >
// //                 {isUploading || isPosting ? (
// //                   <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
// //                 ) : !authUser ? (
// //                   <div className="empty-state">
// //                     <p className="empty-title">Please login first</p>
// //                   </div>
// //                 ) : (
// //                   <>
// //                     <Sparkles />
// //                     Share Post
// //                   </>
// //                 )}
// //               </button>
// //             </div>
// //           </div>
// //         )}

// //         {/* ── COMMENT MODAL ── */}
// //         {activeComment && (
// //           <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setActiveComment(null)}>
// //             <div className="comment-modal">
// //               <div className="comment-modal-header">
// //                 <h2 className="modal-title">Comments</h2>
// //                 <button className="modal-close" onClick={() => setActiveComment(null)}>
// //                   <X size={18} />
// //                 </button>
// //               </div>

// //               <div className="comment-list">
// //                 {posts.find(p => p._id === activeComment)?.comments.length === 0 ? (
// //                   <div className="no-comments">
// //                     <p style={{ fontSize: 32, marginBottom: 8 }}>💬</p>
// //                     <p>No comments yet. Be the first!</p>
// //                   </div>
// //                 ) : !authUser ? (
// //                   <div className="empty-state">
// //                     <p className="empty-title">Please login first</p>
// //                   </div>
// //                 ) : (
// //                   posts.find(p => p._id === activeComment)?.comments.map((c, i) => (
// //                     <div key={i} className="comment-item">
// //                       <img
// //                         className="comment-avatar"
// //                         src={c.profilePic || `https://api.dicebear.com/7.x/thumbs/svg?seed=${c.username}`}
// //                         alt={c.username}
// //                       />
// //                       <div className="comment-bubble">
// //                         <p className="comment-author">{c.username}</p>
// //                         <p className="comment-text">{c.text}</p>
// //                       </div>
// //                     </div>
// //                   ))
// //                 )}
// //               </div>

// //               <div className="comment-input-row">
// //                 <img
// //                   className="comment-my-avatar"
// //                   src={authUser?.profilePic || `https://api.dicebear.com/7.x/thumbs/svg?seed=${authUser?.username}`}
// //                   alt="me"
// //                 />
// //                 <div className="comment-input-wrap">
// //                   <input
// //                     className="comment-input"
// //                     type="text"
// //                     placeholder="Add a comment..."
// //                     value={commentText}
// //                     onChange={(e) => setCommentText(e.target.value)}
// //                     onKeyDown={(e) => e.key === "Enter" && handleComment(activeComment)}
// //                   />
// //                 </div>
// //                 <button
// //                   className="send-btn"
// //                   onClick={() => handleComment(activeComment)}
// //                   disabled={!commentText.trim()}
// //                 >
// //                   <Send size={14} />
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         )}

// //       </div>
// //     </>
// //   );
// // };

// // export default FeedPage;









// import { useEffect, useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuthStore } from "../store/useAuthStore";
// import { usePostStore } from "../store/usePostStore";
// import { ArrowLeft, Heart, MessageCircle, X, Plus, Loader2, Trash2, Send, Sparkles, ImagePlus } from "lucide-react";

// const CLOUDINARY_CLOUD_NAME = "dhcpaoxx1";
// const CLOUDINARY_UPLOAD_PRESET = "gg5z1art";

// const FeedPage = () => {
//   const navigate = useNavigate();
//   const { authUser } = useAuthStore();
//   const { posts, isLoading, getFeedPosts, createPost, likePost, commentPost, deletePost } = usePostStore();

//   const [showCreate, setShowCreate] = useState(false);
//   const [caption, setCaption] = useState("");
//   const [imagePreview, setImagePreview] = useState(null);
//   const [imageUrl, setImageUrl] = useState("");
//   const [isUploading, setIsUploading] = useState(false);
//   const [isPosting, setIsPosting] = useState(false);
//   const [activeComment, setActiveComment] = useState(null);
//   const [commentText, setCommentText] = useState("");
//   const [doubleTapPost, setDoubleTapPost] = useState(null);
//   const [likedPosts, setLikedPosts] = useState({});
//   const imageInputRef = useRef(null);
//   const lastTapRef = useRef({});

//   useEffect(() => { getFeedPosts(); }, []);

//   useEffect(() => { if (imagePreview && !imageUrl) handleUploadAndPost(); }, [imagePreview]);

//   // ✅ GUARD — after ALL hooks, before any functions
//   if (!authUser) {
//     return (
//       <div style={{
//         minHeight: "100vh",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         background: "#fafaf8",
//       }}>
//         <div style={{
//           width: 40, height: 40,
//           border: "3px solid #e84040",
//           borderTopColor: "transparent",
//           borderRadius: "50%",
//           animation: "spin 0.8s linear infinite",
//         }} />
//         <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
//       </div>
//     );
//   }

//   const handleImageSelect = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = () => setImagePreview(reader.result);
//     reader.readAsDataURL(file);
//   };

//   const handleUploadAndPost = async () => {
//     if (!imagePreview) return;
//     setIsUploading(true);
//     try {
//       const formData = new FormData();
//       formData.append("file", imageInputRef.current?.files[0]);
//       formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
//       const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
//       const data = await res.json();
//       setImageUrl(data.secure_url);
//     } catch (err) { console.log(err); }
//     finally { setIsUploading(false); }
//   };

//   const handlePost = async () => {
//     if (!imageUrl) { await handleUploadAndPost(); return; }
//     setIsPosting(true);
//     const res = await createPost(imageUrl, caption);
//     if (res.success) {
//       setShowCreate(false); setCaption(""); setImagePreview(null); setImageUrl("");
//       if (imageInputRef.current) imageInputRef.current.value = "";
//     }
//     setIsPosting(false);
//   };

//   const handleDoubleTap = (postId) => {
//     const now = Date.now();
//     const lastTap = lastTapRef.current[postId] || 0;
//     if (now - lastTap < 300) {
//       likePost(postId);
//       setDoubleTapPost(postId);
//       setLikedPosts(p => ({ ...p, [postId]: true }));
//       setTimeout(() => setDoubleTapPost(null), 900);
//     }
//     lastTapRef.current[postId] = now;
//   };

//   const handleLike = (postId, isLiked) => {
//     likePost(postId);
//     setLikedPosts(p => ({ ...p, [postId]: !isLiked }));
//   };

//   const handleComment = async (postId) => {
//     if (!commentText.trim()) return;
//     await commentPost(postId, commentText);
//     setCommentText("");
//   };

//   const formatTime = (date) => {
//     const diff = Math.floor((new Date() - new Date(date)) / 1000);
//     if (diff < 60) return "just now";
//     if (diff < 3600) return `${Math.floor(diff / 60)}m`;
//     if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
//     return `${Math.floor(diff / 86400)}d`;
//   };

//   return (
//     <>
//       <style>{`
//         :root {
//           --ink: #0d0d0d;
//           --ink-soft: #6b7280;
//           --ink-faint: #d1d5db;
//           --paper: #fafaf8;
//           --paper-2: #f3f2ef;
//           --accent: #e84040;
//           --gold: #f5a623;
//           --blue: #1960F1;
//           --surface: #ffffff;
//           --border: rgba(0,0,0,0.07);
//           --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
//           --shadow-md: 0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
//           --radius: 20px;
//           --radius-sm: 12px;
//           --font: ui-sans-serif, system-ui, -apple-system, sans-serif;
//         }
//         * { box-sizing: border-box; margin: 0; padding: 0; }
//         .feed-root { min-height: 100vh; background: var(--paper); font-family: var(--font); color: var(--ink); }
//         .feed-header {
//           position: sticky; top: 0; z-index: 100;
//           background: rgba(250,250,248,0.88);
//           backdrop-filter: blur(24px) saturate(180%);
//           border-bottom: 1px solid var(--border);
//           padding: 14px 20px;
//           display: flex; align-items: center; justify-content: space-between;
//         }
//         .feed-header-left { display: flex; align-items: center; gap: 12px; }
//         .back-btn {
//           width: 38px; height: 38px; border-radius: 50%;
//           border: 1.5px solid var(--border); background: var(--surface);
//           display: flex; align-items: center; justify-content: center;
//           cursor: pointer; color: var(--ink);
//           box-shadow: var(--shadow-sm); transition: all 0.2s;
//         }
//         .back-btn:hover { transform: translateX(-2px); box-shadow: var(--shadow-md); }
//         .feed-logo { font-weight: 800; font-size: 22px; letter-spacing: -0.5px; color: var(--ink); }
//         .feed-logo span { color: #1960F1; }
//         .post-btn {
//           display: flex; align-items: center; gap: 6px;
//           background: var(--ink); color: white;
//           border: none; cursor: pointer;
//           padding: 10px 18px; border-radius: 100px;
//           font-weight: 700; font-size: 13px;
//           box-shadow: 0 4px 14px rgba(0,0,0,0.2); transition: all 0.2s;
//         }
//         .post-btn:hover { transform: translateY(-1px); }
//         .post-btn:active { transform: scale(0.96); }
//         .feed-container {
//           max-width: 520px; margin: 0 auto;
//           padding: 24px 16px 100px;
//           display: flex; flex-direction: column; gap: 20px;
//         }
//         .post-card {
//           background: var(--surface);
//           border-radius: var(--radius);
//           border: 1px solid var(--border);
//           box-shadow: var(--shadow-sm);
//           overflow: hidden; transition: box-shadow 0.3s;
//           animation: fadeUp 0.4s ease both;
//         }
//         .post-card:hover { box-shadow: var(--shadow-md); }
//         @keyframes fadeUp {
//           from { opacity: 0; transform: translateY(16px); }
//           to   { opacity: 1; transform: translateY(0); }
//         }
//         .post-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; }
//         .post-user { display: flex; align-items: center; gap: 10px; }
//         .post-avatar { width: 42px; height: 42px; border-radius: 14px; object-fit: cover; border: 1.5px solid var(--border); }
//         .post-username { font-weight: 700; font-size: 14px; color: var(--ink); }
//         .post-time { font-size: 11px; color: var(--ink-faint); font-weight: 500; margin-top: 1px; }
//         .delete-btn {
//           width: 34px; height: 34px; border-radius: 10px;
//           border: none; background: transparent; cursor: pointer;
//           display: flex; align-items: center; justify-content: center;
//           color: var(--ink-faint); transition: all 0.2s;
//         }
//         .delete-btn:hover { background: #fee2e2; color: var(--accent); }
//         .post-image-wrap { width: 100%; aspect-ratio: 1/1; position: relative; overflow: hidden; cursor: pointer; background: var(--paper-2); }
//         .post-image-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
//         .post-image-wrap:hover img { transform: scale(1.02); }
//         .heart-burst { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; animation: heartPop 0.9s ease forwards; }
//         .heart-burst-icon { filter: drop-shadow(0 0 20px rgba(232,64,64,0.6)); animation: heartScale 0.9s ease forwards; }
//         @keyframes heartPop { 0%{opacity:0} 20%{opacity:1} 80%{opacity:1} 100%{opacity:0} }
//         @keyframes heartScale { 0%{transform:scale(0.3)} 40%{transform:scale(1.3)} 70%{transform:scale(0.95)} 100%{transform:scale(1.1)} }
//         .post-actions { padding: 12px 16px 4px; display: flex; align-items: center; gap: 16px; }
//         .action-btn { background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; padding: 6px 0; color: var(--ink-soft); transition: all 0.2s; }
//         .action-btn:hover { color: var(--ink); }
//         .action-btn:active { transform: scale(0.9); }
//         .like-btn.liked { color: var(--accent); }
//         .action-count { font-size: 13px; font-weight: 600; color: inherit; }
//         .post-body { padding: 4px 16px 16px; }
//         .post-likes { font-weight: 700; font-size: 13px; color: var(--ink); margin-bottom: 6px; }
//         .post-caption { font-size: 14px; line-height: 1.55; color: var(--ink); }
//         .post-caption strong { font-weight: 700; margin-right: 6px; }
//         .view-comments { background: none; border: none; cursor: pointer; font-size: 12px; font-weight: 600; color: var(--ink-soft); margin-top: 6px; display: block; transition: color 0.2s; }
//         .view-comments:hover { color: var(--blue); }
//         .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 55vh; gap: 12px; text-align: center; }
//         .empty-icon { width: 80px; height: 80px; border-radius: 24px; background: var(--paper-2); display: flex; align-items: center; justify-content: center; font-size: 36px; margin-bottom: 8px; }
//         .empty-title { font-weight: 800; font-size: 20px; color: var(--ink); }
//         .empty-sub { font-size: 14px; color: var(--ink-soft); max-width: 200px; }
//         .empty-cta { margin-top: 8px; padding: 12px 28px; background: var(--ink); color: white; border: none; border-radius: 100px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(0,0,0,0.2); }
//         .empty-cta:hover { transform: translateY(-2px); }
//         .modal-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(10,10,10,0.6); backdrop-filter: blur(12px); display: flex; align-items: flex-end; justify-content: center; padding: 0; animation: overlayIn 0.2s ease; }
//         @keyframes overlayIn { from{opacity:0} to{opacity:1} }
//         @media (min-width: 640px) { .modal-overlay { align-items: center; padding: 20px; } }
//         .create-modal { background: var(--surface); width: 100%; max-width: 480px; border-radius: 28px 28px 0 0; padding: 28px 24px 32px; animation: slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1); max-height: 90vh; overflow-y: auto; }
//         @media (min-width: 640px) { .create-modal { border-radius: 28px; } }
//         @keyframes slideUp { from{transform:translateY(60px);opacity:0} to{transform:translateY(0);opacity:1} }
//         .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
//         .modal-title { font-weight: 800; font-size: 20px; color: var(--ink); }
//         .modal-close { width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid var(--border); background: var(--paper-2); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--ink-soft); transition: all 0.2s; }
//         .modal-close:hover { background: var(--ink); color: white; }
//         .upload-zone { width: 100%; aspect-ratio: 1/1; border-radius: var(--radius); overflow: hidden; border: 2px dashed var(--ink-faint); background: var(--paper-2); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s; position: relative; }
//         .upload-zone:hover { border-color: var(--ink-soft); }
//         .upload-zone.has-image { border: none; }
//         .upload-zone img { width: 100%; height: 100%; object-fit: cover; }
//         .upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 10px; color: var(--ink-faint); }
//         .upload-placeholder p { font-size: 13px; font-weight: 600; }
//         .upload-placeholder span { font-size: 11px; }
//         .uploading-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.85); display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 8px; }
//         .caption-input { width: 100%; margin-top: 14px; padding: 14px 16px; border-radius: var(--radius-sm); border: 1.5px solid var(--border); background: var(--paper-2); font-family: var(--font); font-size: 14px; color: var(--ink); resize: none; outline: none; transition: border-color 0.2s; line-height: 1.6; }
//         .caption-input:focus { border-color: var(--ink); background: white; }
//         .caption-input::placeholder { color: var(--ink-faint); }
//         .share-btn { width: 100%; margin-top: 14px; padding: 16px; background: var(--ink); color: white; border: none; cursor: pointer; border-radius: var(--radius-sm); font-weight: 800; font-size: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; font-family: var(--font); }
//         .share-btn:hover:not(:disabled) { background: #1a1a1a; transform: translateY(-1px); }
//         .share-btn:disabled { opacity: 0.4; cursor: not-allowed; }
//         .comment-modal { background: var(--surface); width: 100%; max-width: 520px; border-radius: 28px 28px 0 0; max-height: 85vh; display: flex; flex-direction: column; animation: slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1); }
//         @media (min-width: 640px) { .comment-modal { border-radius: 28px; max-height: 70vh; } }
//         .comment-modal-header { padding: 22px 22px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); flex-shrink: 0; }
//         .comment-list { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 14px; }
//         .comment-item { display: flex; align-items: flex-start; gap: 10px; }
//         .comment-avatar { width: 36px; height: 36px; border-radius: 12px; object-fit: cover; flex-shrink: 0; border: 1px solid var(--border); }
//         .comment-bubble { flex: 1; background: var(--paper-2); border-radius: 4px 16px 16px 16px; padding: 10px 14px; }
//         .comment-author { font-weight: 700; font-size: 12px; color: var(--blue); margin-bottom: 3px; }
//         .comment-text { font-size: 13px; color: var(--ink); line-height: 1.5; }
//         .no-comments { text-align: center; padding: 40px 20px; color: var(--ink-faint); font-size: 14px; }
//         .comment-input-row { padding: 14px 16px; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
//         .comment-my-avatar { width: 36px; height: 36px; border-radius: 12px; object-fit: cover; flex-shrink: 0; }
//         .comment-input-wrap { flex: 1; display: flex; align-items: center; gap: 8px; background: var(--paper-2); border-radius: 100px; padding: 10px 14px; border: 1.5px solid transparent; transition: border-color 0.2s; }
//         .comment-input-wrap:focus-within { border-color: var(--ink); background: white; }
//         .comment-input { flex: 1; background: none; border: none; outline: none; font-family: var(--font); font-size: 13px; color: var(--ink); }
//         .comment-input::placeholder { color: var(--ink-faint); }
//         .send-btn { width: 32px; height: 32px; border-radius: 50%; background: var(--ink); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; transition: all 0.2s; }
//         .send-btn:hover:not(:disabled) { background: var(--accent); transform: scale(1.1); }
//         .send-btn:disabled { opacity: 0.3; cursor: not-allowed; }
//         .skeleton-card { background: var(--surface); border-radius: var(--radius); border: 1px solid var(--border); overflow: hidden; }
//         .skeleton-header { padding: 14px 16px; display: flex; align-items: center; gap: 10px; }
//         .skeleton-avatar { width: 42px; height: 42px; border-radius: 14px; }
//         .skeleton-lines { display: flex; flex-direction: column; gap: 6px; flex: 1; }
//         .skeleton-line { height: 10px; border-radius: 6px; }
//         .skeleton-image { width: 100%; aspect-ratio: 1/1; }
//         .skeleton-footer { padding: 14px 16px; display: flex; gap: 16px; }
//         .skeleton-action { width: 50px; height: 10px; border-radius: 6px; }
//         @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
//         .shimmer { background: linear-gradient(90deg, var(--paper-2) 25%, #e8e8e4 50%, var(--paper-2) 75%); background-size: 800px 100%; animation: shimmer 1.6s infinite; }
//         @keyframes spin { to { transform: rotate(360deg); } }
//       `}</style>

//       <div className="feed-root">

//         {/* HEADER */}
//         <header className="feed-header">
//           <div className="feed-header-left">
//             <button className="back-btn" onClick={() => navigate("/")}>
//               <ArrowLeft size={18} strokeWidth={2.5} />
//             </button>
//             <h1 className="feed-logo">गफ <span>Feed</span></h1>
//           </div>
//           <button className="post-btn" onClick={() => setShowCreate(true)}>
//             <Plus size={15} strokeWidth={3} />
//             New Post
//           </button>
//         </header>

//         {/* MAIN FEED */}
//         <div className="feed-container">
//           {isLoading ? (
//             [1, 2, 3].map(i => (
//               <div key={i} className="skeleton-card">
//                 <div className="skeleton-header">
//                   <div className="skeleton-avatar shimmer" />
//                   <div className="skeleton-lines">
//                     <div className="skeleton-line shimmer" style={{ width: "40%" }} />
//                     <div className="skeleton-line shimmer" style={{ width: "25%" }} />
//                   </div>
//                 </div>
//                 <div className="skeleton-image shimmer" />
//                 <div className="skeleton-footer">
//                   <div className="skeleton-action shimmer" />
//                   <div className="skeleton-action shimmer" />
//                 </div>
//               </div>
//             ))
//           ) : posts.length === 0 ? (
//             <div className="empty-state">
//               <div className="empty-icon">📸</div>
//               <p className="empty-title">Nothing here yet</p>
//               <p className="empty-sub">Be the first to share a moment!</p>
//               <button className="empty-cta" onClick={() => setShowCreate(true)}>
//                 Create First Post
//               </button>
//             </div>
//           ) : (
//             posts.filter(post => post.userId != null).map((post, idx) => {
//               // ✅ Safe null checks
//               const isLiked = authUser ? post.likes.includes(authUser._id) : false;
//               const isMyPost = authUser ? post.userId?._id === authUser._id : false;

//               return (
//                 <div key={post._id} className="post-card" style={{ animationDelay: `${idx * 0.07}s` }}>
//                   {/* Header */}
//                   <div className="post-header">
//                     <div className="post-user">
//                       <img
//                         className="post-avatar"
//                         src={post.userId?.profilePic || `https://api.dicebear.com/7.x/thumbs/svg?seed=${post.userId?.username}`}
//                         alt={post.userId?.username}
//                       />
//                       <div>
//                         <p className="post-username">{post.userId?.username}</p>
//                         <p className="post-time">{formatTime(post.createdAt)} ago</p>
//                       </div>
//                     </div>
//                     {isMyPost && (
//                       <button className="delete-btn" onClick={() => deletePost(post._id)}>
//                         <Trash2 size={16} />
//                       </button>
//                     )}
//                   </div>

//                   {/* Image */}
//                   <div className="post-image-wrap" onClick={() => handleDoubleTap(post._id)}>
//                     <img src={post.image} alt="post" />
//                     {doubleTapPost === post._id && (
//                       <div className="heart-burst">
//                         <Heart size={90} className="heart-burst-icon" fill="#e84040" color="#e84040" />
//                       </div>
//                     )}
//                   </div>

//                   {/* Actions */}
//                   <div className="post-actions">
//                     <button
//                       className={`action-btn like-btn ${isLiked ? "liked" : ""}`}
//                       onClick={() => handleLike(post._id, isLiked)}
//                     >
//                       <Heart
//                         size={24}
//                         strokeWidth={isLiked ? 0 : 2}
//                         fill={isLiked ? "#e84040" : "none"}
//                         color={isLiked ? "#e84040" : "currentColor"}
//                         style={{ transition: "all 0.2s" }}
//                       />
//                       <span className="action-count">{post.likes.length}</span>
//                     </button>
//                     <button className="action-btn" onClick={() => setActiveComment(post._id)}>
//                       <MessageCircle size={24} strokeWidth={2} />
//                       <span className="action-count">{post.comments.length}</span>
//                     </button>
//                   </div>

//                   {/* Body */}
//                   <div className="post-body">
//                     <p className="post-likes">{post.likes.length} {post.likes.length === 1 ? "love" : "loves"}</p>
//                     {post.caption && (
//                       <p className="post-caption">
//                         <strong>{post.userId?.username}</strong>
//                         {post.caption}
//                       </p>
//                     )}
//                     {post.comments.length > 0 && (
//                       <button className="view-comments" onClick={() => setActiveComment(post._id)}>
//                         View all {post.comments.length} comment{post.comments.length !== 1 ? "s" : ""}
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               );
//             })
//           )}
//         </div>

//         {/* CREATE POST MODAL */}
//         {showCreate && (
//           <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}>
//             <div className="create-modal">
//               <div className="modal-header">
//                 <h2 className="modal-title">New Post</h2>
//                 <button className="modal-close" onClick={() => { setShowCreate(false); setImagePreview(null); setImageUrl(""); setCaption(""); }}>
//                   <X size={18} />
//                 </button>
//               </div>

//               <label className={`upload-zone ${imagePreview ? "has-image" : ""}`}>
//                 {imagePreview ? (
//                   <>
//                     <img src={imagePreview} alt="preview" />
//                     {isUploading && (
//                       <div className="uploading-overlay">
//                         <Loader2 size={28} color="#0d0d0d" style={{ animation: "spin 1s linear infinite" }} />
//                         <p>Uploading...</p>
//                       </div>
//                     )}
//                   </>
//                 ) : (
//                   <div className="upload-placeholder">
//                     <ImagePlus size={40} />
//                     <p>Tap to add photo</p>
//                     <span>Square 1:1 recommended</span>
//                   </div>
//                 )}
//                 <input ref={imageInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageSelect} />
//               </label>

//               <textarea
//                 className="caption-input"
//                 placeholder="Write something..."
//                 rows={3}
//                 value={caption}
//                 onChange={(e) => setCaption(e.target.value)}
//               />

//               <button className="share-btn" onClick={handlePost} disabled={!imagePreview || isUploading || isPosting}>
//                 {isUploading || isPosting ? (
//                   <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
//                 ) : (
//                   <><Sparkles size={16} /> Share Post</>
//                 )}
//               </button>
//             </div>
//           </div>
//         )}

//         {/* COMMENT MODAL */}
//         {activeComment && (
//           <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setActiveComment(null)}>
//             <div className="comment-modal">
//               <div className="comment-modal-header">
//                 <h2 className="modal-title">Comments</h2>
//                 <button className="modal-close" onClick={() => setActiveComment(null)}>
//                   <X size={18} />
//                 </button>
//               </div>

//               <div className="comment-list">
//                 {posts.find(p => p._id === activeComment)?.comments.length === 0 ? (
//                   <div className="no-comments">
//                     <p style={{ fontSize: 32, marginBottom: 8 }}>💬</p>
//                     <p>No comments yet. Be the first!</p>
//                   </div>
//                 ) : (
//                   posts.find(p => p._id === activeComment)?.comments.map((c, i) => (
//                     <div key={i} className="comment-item">
//                       <img className="comment-avatar" src={c.profilePic || `https://api.dicebear.com/7.x/thumbs/svg?seed=${c.username}`} alt={c.username} />
//                       <div className="comment-bubble">
//                         <p className="comment-author">{c.username}</p>
//                         <p className="comment-text">{c.text}</p>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>

//               <div className="comment-input-row">
//                 <img className="comment-my-avatar" src={authUser?.profilePic || `https://api.dicebear.com/7.x/thumbs/svg?seed=${authUser?.username}`} alt="me" />
//                 <div className="comment-input-wrap">
//                   <input
//                     className="comment-input"
//                     type="text"
//                     placeholder="Add a comment..."
//                     value={commentText}
//                     onChange={(e) => setCommentText(e.target.value)}
//                     onKeyDown={(e) => e.key === "Enter" && handleComment(activeComment)}
//                   />
//                 </div>
//                 <button className="send-btn" onClick={() => handleComment(activeComment)} disabled={!commentText.trim()}>
//                   <Send size={14} />
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//       </div>
//     </>
//   );
// };

// export default FeedPage;


import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { Heart, MessageCircle } from "lucide-react";

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [authUser, setAuthUser] = useState(null);
  const [activeComment, setActiveComment] = useState(null);
  const [commentText, setCommentText] = useState("");

  // ✅ GET AUTH USER
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/users/me");
        setAuthUser(res.data);
      } catch (err) {
        console.log("User not logged in");
      }
    };
    fetchUser();
  }, []);

  // ✅ GET POSTS
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("/posts/feed");
        setPosts(res.data || []);
      } catch (err) {
        console.log("Error fetching posts");
      }
    };
    fetchPosts();
  }, []);

  // ✅ LIKE POST
  const handleLike = async (postId) => {
    try {
      const res = await axios.put(`/posts/like/${postId}`);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, likes: res.data.likes } : p
        )
      );
    } catch (err) {
      console.log("Like failed");
    }
  };

  // ✅ ADD COMMENT
  const handleComment = async (postId) => {
    if (!commentText.trim()) return;

    try {
      const res = await axios.post(`/posts/comment/${postId}`, {
        text: commentText,
      });

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, comments: [...(p.comments || []), res.data] }
            : p
        )
      );

      setCommentText("");
    } catch (err) {
      console.log("Comment failed");
    }
  };

  return (
    <div className="feed-container">
      {posts?.map((post) => {
        // 🔥 CRASH FIX (MAIN)
        if (!post || !post.userId) return null;

        const isLiked = authUser
          ? post.likes?.includes(authUser?._id)
          : false;

        const isMyPost = authUser
          ? post.userId?._id === authUser?._id
          : false;

        return (
          <div key={post._id} className="post-card">
            {/* USER */}
            <div className="post-header">
              <img
                src={
                  post.userId?.profilePic ||
                  `https://api.dicebear.com/7.x/thumbs/svg?seed=${
                    post.userId?.username || "user"
                  }`
                }
                alt={post.userId?.username || "user"}
                className="post-avatar"
              />
              <p className="post-username">
                {post.userId?.username || "Unknown"}
              </p>
            </div>

            {/* IMAGE */}
            <img
              src={post.image}
              alt="post"
              className="post-image"
            />

            {/* ACTIONS */}
            <div className="post-actions">
              <Heart
                className={`icon ${isLiked ? "liked" : ""}`}
                onClick={() => handleLike(post._id)}
              />
              <MessageCircle
                className="icon"
                onClick={() => setActiveComment(post._id)}
              />
            </div>

            {/* LIKES */}
            <p className="post-likes">
              {post.likes?.length || 0} likes
            </p>

            {/* CAPTION */}
            <p className="post-caption">
              <strong>
                {post.userId?.username || "Unknown"}
              </strong>{" "}
              {post.caption}
            </p>

            {/* COMMENTS PREVIEW */}
            <p
              className="view-comments"
              onClick={() => setActiveComment(post._id)}
            >
              View {post.comments?.length || 0} comments
            </p>

            {/* OPTIONAL DEBUG */}
            {isMyPost && (
              <p className="text-green-400 text-xs">
                Your post
              </p>
            )}
          </div>
        );
      })}

      {/* COMMENT MODAL */}
      {activeComment && (
        <div className="comment-modal">
          <div className="comment-box">
            <h3>
              Comments (
              {posts.find((p) => p._id === activeComment)?.comments
                ?.length || 0}
              )
            </h3>

            <div className="comment-list">
              {posts
                .find((p) => p._id === activeComment)
                ?.comments?.map((c, i) => (
                  <div key={i} className="comment-item">
                    <strong>{c.username}</strong> {c.text}
                  </div>
                ))}
            </div>

            <div className="comment-input">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button
                onClick={() => handleComment(activeComment)}
              >
                Send
              </button>
            </div>

            <button
              className="close-btn"
              onClick={() => setActiveComment(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedPage;
