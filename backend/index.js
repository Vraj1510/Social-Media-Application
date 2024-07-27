const express = require('express');
const app = express();
const server = require('http').createServer(app);
const multer = require('multer');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
require('dotenv').config();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'user_uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });
const {initializeSocket} = require('../backend/Components/SocketHandler');
const chatHandlers = require('../backend/Components/ChatUtils');
const postHandlers = require('../backend/Components/PostUtils');
const commentFunctions = require('../backend/Components/Commentutils');
const peopleFunctions=require('../backend/Components/PeopleUtils');
const profileFunctions = require('../backend/Components/ProfileUtils');
const AuthFunctions = require('../backend/Components/AuthUtils');
initializeSocket(server);
app.use(helmet());
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['POST', 'GET', 'PUT'],
    credentials: true,
  }),
);
app.use(express.json());
app.use(bodyParser.json());
app.post('/checksession', AuthFunctions.verifyUser, (req, res) => {
  console.log('Check Session API');
  if (res.locals.userData === undefined) {
    return res.json({ valid: false, message: 'unauthorized' });
  } else {
    const { username } = res.locals.userData;
    return res.json({ valid: true, message: 'authorized', username });
  }
});
app.post('/logout', (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  return res.json({ message: 'Logout successful' });
});
app.post('/insert', AuthFunctions.handleInsert);
app.post('/handlelogin', AuthFunctions.handleLogin);
app.post('/registerjwttoken', AuthFunctions.registerJwtToken);
app.post('/checkuser', AuthFunctions.checkUser);
app.post('/sendemail', AuthFunctions.sendEmail);
app.post('/resetpassword', AuthFunctions.resetPassword);
app.post('/sendotp', AuthFunctions.sendOtp);

///CHATAPISrouter.put('/getmessages', chatHandlers.getMessages);
app.post('/insertmessage', upload.single('file'), chatHandlers.insertMessage);
app.post('/deleteforall', chatHandlers.deleteForAll);
app.post('/deleteforme', chatHandlers.deleteForMe);
app.post('/editmessage', chatHandlers.editMessage);
app.put('/seeMessages', chatHandlers.seeMessages);
app.put('/findfriend', chatHandlers.findFriend);
app.put('/fetchunseen', chatHandlers.fetchUnseen);
app.post('/addchat', chatHandlers.addChat);
app.put('/fetchchats', chatHandlers.fetchChats);
app.post('/deletechat', chatHandlers.deleteChat);

//POSTAPIS
app.post('/addpost', upload.array('files', 10), postHandlers.addPost);
app.put('/fetchpost', postHandlers.fetchPost);
app.put('/handlelikes', postHandlers.handleLikes);
app.put('/checklike', postHandlers.checkLike);
app.put('/getlike', postHandlers.getLike);
app.put('/listlike', postHandlers.listLike);
app.post('/editpost', upload.array('files'), postHandlers.editPost);
app.put('/deletepost', postHandlers.deletePost);

//commentAPIS
app.put('/checkcommentlike', commentFunctions.checkCommentLike);
app.put('/handlecommentlikes', commentFunctions.handleCommentLikes);
app.put('/fetchcommentlikes', commentFunctions.fetchCommentLikes);
app.post('/deletecomment', commentFunctions.deleteComment);
app.put('/fetchcommentbyid', commentFunctions.fetchCommentById);
app.put('/fetchcomment', commentFunctions.fetchCommentsByPostId);
app.post('/insertcomment', commentFunctions.insertComment);

//follow unfollow req mutual
app.post('/unfollow', peopleFunctions.unfollow);
app.post('/sentrequest', peopleFunctions.sentRequest);
app.put('/deleterequest', peopleFunctions.deleteRequest);
app.put('/checkfollower', peopleFunctions.checkFollower);
app.post('/removefollower', peopleFunctions.removeFollower);
app.put('/deleterequest1', peopleFunctions.deleteRequest1);
app.post('/addfollowing', peopleFunctions.addFollowing);
app.put('/updatenotification', peopleFunctions.updateNotification);
app.put('/follow', peopleFunctions.follow);
app.put('/requestsent', peopleFunctions.requestSent);
app.put('/followers', peopleFunctions.followers);
app.put('/following', peopleFunctions.following);
app.put('/followersofuser', peopleFunctions.followersOfUser);
app.put('/userfollowing', peopleFunctions.getUserFollowing);
app.put('/mutual', peopleFunctions.getMutualFollowers);
app.put('/notfollowing', peopleFunctions.getUsersNotFollowing);
app.put('/getrequests', peopleFunctions.getRequestsSent);

//REMAININGAPIS
app.post('/updateprofile', upload.single('file'), profileFunctions.updateProfile);
app.put('/fetchImage', profileFunctions.fetchImage);
app.put('/fetchnotifications', profileFunctions.fetchNotifications);
app.post('/seenNotifications', profileFunctions.seenNotifications);
app.put('/updatenote', profileFunctions.updateNote);
app.get('/fetch1', profileFunctions.fetchAllProfiles);
app.put('/fetchnote', profileFunctions.fetchNoteByUsername);
app.put('/fetchpostcount', profileFunctions.fetchPostCount);
app.put('/fetchpostuserbyid', profileFunctions.fetchPostById);
app.put('/getonline', profileFunctions.getOnlineUsers);
app.put('/fetchprofile', profileFunctions.fetchUserProfile);


server.listen(3001, () => {
  console.log('Server has started');
});
