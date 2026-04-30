# GUFF - Real-Time Chat Application

A modern, full-stack chat application built with the MERN stack, featuring real-time messaging, video calling, and social feed capabilities.

## Features

- **Real-Time Messaging** - Instant message delivery with Socket.io
- **Video Calling** - Peer-to-peer video calls using WebRTC
- **Message Reactions** - Add emoji reactions to messages
- **Social Feed** - Share photos, like posts, and comment
- **User Authentication** - Secure OTP-based email verification
- **User Matching** - Find users based on shared interests
- **Typing Indicators** - See when others are typing
- **Message Status** - Track read receipts with message seen indicators
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **PWA Support** - Installable as a native app

## Technology Stack

### Frontend
- **React.js** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - State management
- **Socket.io Client** - Real-time communication
- **WebRTC** - Peer-to-peer video calling

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.io** - Real-time bidirectional communication
- **JWT** - Authentication and authorization
- **Nodemailer** - Email service for OTP

### Infrastructure
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **MongoDB Atlas** - Cloud database
- **Cloudinary** - Image storage and CDN

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB local or MongoDB Atlas account
- Cloudinary account
- Gmail account (for OTP email service)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Ayushdahal12/Chat_app.git
cd Chat_app
```

2. **Setup Backend**
```bash
cd Backend
npm install
```

Create `.env` file in Backend directory:
```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=8080
NODE_ENV=development
GMAIL_USER=your_gmail
GMAIL_PASS=your_app_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_UPLOAD_PRESET=your_preset
FRONTEND_URL=http://localhost:5173
```

3. **Setup Frontend**
```bash
cd Frontend
npm install
```

Create `.env.development` file in Frontend directory:
```
VITE_BACKEND_URL=http://localhost:8080
```

4. **Run the Application**

Backend:
```bash
cd Backend
npm run dev
```

Frontend:
```bash
cd Frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

## Project Structure

```
Chat_app/
├── Backend/
│   ├── models/              # MongoDB schemas
│   ├── controllers/         # Business logic
│   ├── routes/              # API endpoints
│   ├── middleware/          # Custom middleware
│   ├── utils/               # Utility functions
│   ├── socket/              # Socket.io configuration
│   ├── server.js            # Main server file
│   └── .env                 # Environment variables
│
└── Frontend/
    ├── src/
    │   ├── pages/           # Page components
    │   ├── components/      # Reusable components
    │   ├── store/           # Zustand state management
    │   ├── lib/             # Helper functions
    │   ├── assets/          # Images and static files
    │   ├── App.jsx          # Main app component
    │   └── main.jsx         # Entry point
    ├── public/              # Static assets
    ├── index.html           # HTML template
    └── vite.config.js       # Vite configuration
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Initiate password reset
- `POST /api/auth/verify-forgot-otp` - Verify reset OTP
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users/me` - Get current user
- `GET /api/users/suggested` - Get suggested users
- `PUT /api/users/interests` - Update user interests
- `PUT /api/users/profile` - Update user profile

### Messages
- `GET /api/messages/:id` - Get chat history
- `POST /api/messages/send/:id` - Send message
- `PUT /api/messages/seen/:id` - Mark messages as seen
- `PUT /api/messages/react/:id` - Add reaction to message

### Posts
- `GET /api/posts` - Get feed posts
- `POST /api/posts/create` - Create new post
- `PUT /api/posts/like/:id` - Like a post
- `POST /api/posts/comment/:id` - Comment on post
- `DELETE /api/posts/:id` - Delete post

## Socket.io Events

### Client to Server
- `callUser` - Initiate video call
- `answerCall` - Accept incoming call
- `iceCandidate` - Send ICE candidate for WebRTC
- `endCall` - End video call
- `typing` - Send typing indicator
- `stopTyping` - Stop typing indicator
- `messageSeen` - Mark messages as seen

### Server to Client
- `getOnlineUsers` - Receive list of online users
- `receiveCall` - Receive incoming call
- `callAccepted` - Call was accepted
- `callEnded` - Call ended
- `typing` - User is typing
- `stopTyping` - User stopped typing
- `messageSeen` - Messages seen by recipient
- `newMessage` - New message received
- `messageReaction` - Message reaction added

## Key Features Implementation

### Real-Time Messaging
Messages are delivered instantly using Socket.io with automatic read receipt tracking and typing indicators for enhanced user experience.

### Video Calling
Implements WebRTC for peer-to-peer video calling with fallback TURN servers for different network conditions. Includes camera and microphone controls.

### Authentication
Uses OTP-based email verification via Nodemailer for secure registration. JWT tokens stored in HTTP-only cookies for API requests.

### Message Reactions
Users can react to messages with 6 emoji options. Reactions are real-time and show count for multiple users reacting with same emoji.

### Social Feed
Instagram-style feed with photo sharing, likes, and comments. Double-tap to like, comment sections in modal, and ability to delete own posts.

## Security Features

- HTTP-only cookies for JWT storage
- CORS configuration for cross-origin requests
- Password hashing with bcryptjs
- Environment variable protection
- Input validation and sanitization
- SQL injection prevention with Mongoose

## Performance Optimization

- Code splitting with Vite
- Lazy loading of components
- Optimized images with Cloudinary
- Socket.io connection pooling
- Efficient MongoDB queries with indexing
- Service worker caching

## Deployment

### Frontend (Vercel)
```bash
# Push to GitHub, Vercel auto-deploys from main branch
git push origin main
```

### Backend (Render)
```bash
# Push to GitHub, Render auto-deploys from main branch
git push origin main
```

### Environment Variables
Update environment variables in respective hosting platforms for production.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Author

**Ayush Dahal**
- GitHub: [@Ayushdahal12](https://github.com/Ayushdahal12)

## Support

For support, please open an issue on GitHub or contact via email.

## Acknowledgments

- Socket.io for real-time communication
- WebRTC for peer-to-peer video calling
- Cloudinary for image storage
- MongoDB for database services
- Vercel and Render for hosting infrastructure
