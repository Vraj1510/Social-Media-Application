const pool = require('./db');
const express = require('express');
const { Server } = require('socket.io');
const app = express();
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const Redis = require('ioredis');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const RedisStore = require('connect-redis').default;
require('dotenv').config();
const server = require('http').createServer(app);
const twilio = require('twilio');
const otpgenerator = require('otp-generator');
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'user_uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
function countFilesInFolder(folderPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files.length);
      }
    });
  });
}
const upload = multer({ storage: storage });

var nodemailer = require('nodemailer');

io.on('connection', (socket) => {
  let onlineUsers = []; // Declare onlineUsers within the connection event

  console.log('Connected');

  const addNewUser = async (username, socketId) => {
    try {
      const existingUser = await getUser({ username });
      console.log('Existing userrrrrrrrr');
      console.log(existingUser);
      if (existingUser) {
        await pool.query('UPDATE online SET socketid = $1 WHERE username = $2', [
          socketId,
          username,
        ]);
      } else {
        await pool.query(
          `
          INSERT INTO online (username, socketid)
          VALUES ($1, $2)
        `,
          [username, socketId],
        );
        console.log('User added successfully:', username);
      }
    } catch (error) {
      console.error('Error adding user:', error.message);
    }
  };

  const removeUser = async (socketId) => {
    console.log(socketId);
    try {
      await pool.query('DELETE FROM online WHERE socketid=$1', [socketId]);
      console.log('User removed successfully');
    } catch (error) {
      console.error('Error removing user:', error.message);
    }
  };

  const getUser = async (username) => {
    try {
      console.log('GetUser username');
      console.log(username);
      const response = await pool.query('SELECT * FROM online WHERE username=$1', [
        username.username,
      ]);
      return response.rows[0];
    } catch (error) {
      console.error('Error fetching user:', error.message);
    }
  };
  const handleNewNotif = async (username) => {
    try {
      const response = await pool.query(
        "SELECT * FROM notifications WHERE (person1 = $1 AND seen1='no') OR (person2 = $1 AND seen2='no')",
        [username],
      );
      return response.rows.length;
    } catch (error) {
      console.error('Error fetching user:', error.message);
    }
  };
  const getAllUnseen = async (user) => {
    try {
      const map1 = new Map();
      console.log(user);
      const response = await pool.query(
        'SELECT user1 as user FROM chats  WHERE user2=$1 UNION SELECT user2 as user FROM chats WHERE user1=$1',
        [user],
      );
      const data = response.rows;
      console.log(data);
      await Promise.all(
        data.map(async (users) => {
          console.log(users.user);
          const response1 = await pool.query(
            'SELECT * FROM messages WHERE user1=$1 AND user2=$3 AND seen2=$2',
            [users.user, 'no', user],
          );
          console.log(response1.rows.length);
          map1.set(users.user, response1.rows.length);
        }),
      );

      return map1;
    } catch (err) {
      console.error(err);
      throw err; // Rethrow the error to handle it at a higher level
    }
  };

  socket.on('send_message', async (user) => {
    try {
      const maps1 = await getAllUnseen(user);
      console.log('The maps is', JSON.stringify([...maps1]));

      const id1 = await getUser(user);
      console.log(id1);
      console.log([...maps1]);
      if (id1 !== undefined) {
        io.to(id1.socketid).emit('recieve_message', [...maps1]); // Sending array instead of Map
      }
    } catch (err) {
      console.error(err);
    }
  });

  socket.on('typing', () => {
    io.emit('istyping');
  });
  socket.on('newUser', async (username) => {
    console.log('new user');
    try {
      console.log('New user:', username);
      await addNewUser(username, socket.id);
      console.log('User added successfully:', username);
      const response = await pool.query('SELECT * FROM online');
      onlineUsers = [...response.rows];
      io.emit('user_online', onlineUsers); // Emit event to update all clients with online users
    } catch (error) {
      console.error('Error handling new user:', error.message);
    }
  });
  socket.on('notif', async (person) => {
    console.log('serverok');
    console.log(person);
    try {
      const count1 = await handleNewNotif(person);
      const count = count1;
      const id1 = await getUser(person);
      console.log(await getUser(person));
      console.log(id1);
      console.log(count);
      // io.to(id1.socketid).emit('notifCount', count);
      if (id1 !== undefined) {
        io.to(id1.socketid).emit('notifCount', count);
      }
    } catch (error) {
      console.error('Error handling new user:', error.message);
    }
  });
  socket.on('send_like', async (arr) => {
    console.log('recieving');
    const response = await pool.query('SELECT user_name FROM post WHERE id=$1', [arr[1]]);
    console.log(response.rows[0].user_name);
    console.log(arr);
    const id1 = await getUser(response.rows[0].user_name);
    const user = response.rows[0].user_name;
    const count1 = await handleNewNotif(user);
    const count = count1;
    const id2 = await getUser(arr[0]);
    console.log(id1);
    console.log(id2);
    if (id1 !== undefined) {
      io.to(id1.socketid).emit('liked');
    }
    if (id2 !== undefined) {
      io.to(id2.socketid).emit('liked');
    }
    if (id1 !== undefined) {
      io.to(id1.socketid).emit('notifCount', count);
    }
  });
  socket.on('delete_like', async (user1) => {
    console.log(user1);
    const id1 = await getUser(user1[0]);
    const count1 = await handleNewNotif(user1[0]);
    const count = count1;
    console.log(id1);
    const id2 = await getUser(user1[1]);
    console.log(id1);
    console.log(id2);
    if (id1 !== undefined) {
      io.to(id1.socketid).emit('liked');
    }
    if (id2 !== undefined) {
      io.to(id2.socketid).emit('liked');
    }
    if (id1 !== undefined) {
      io.to(id1.socketid).emit('notifCount', count);
    }
  });
  socket.on('send_comment_like', async (arr) => {
    console.log('recieving');
    const response = await pool.query('SELECT username FROM comments WHERE comment_id=$1', [
      arr[1],
    ]);
    console.log(response.rows[0].username);
    console.log(arr);
    const id1 = await getUser(response.rows[0].username);
    const user = response.rows[0].username;
    const count1 = await handleNewNotif(user);
    const count = count1;
    const id2 = await getUser(arr[0]);
    console.log(id1);
    console.log(id2);
    if (id1 !== undefined) {
      io.to(id1.socketid).emit('comment_liked');
    }
    if (id2 !== undefined) {
      io.to(id2.socketid).emit('comment_liked');
    }
    if (id1 !== undefined) {
      io.to(id1.socketid).emit('notifCount', count);
    }
  });
  socket.on('delete_comment_like', async (user1) => {
    console.log(user1);
    const id1 = await getUser(user1[0]);
    const count1 = await handleNewNotif(user1[0]);
    const count = count1;
    console.log(id1);
    const id2 = await getUser(user1[1]);
    console.log(id1);
    console.log(id2);
    if (id1 !== undefined) {
      io.to(id1.socketid).emit('comment_liked');
    }
    if (id2 !== undefined) {
      io.to(id2.socketid).emit('comment_liked');
    }
    if (id1 !== undefined) {
      io.to(id1.socketid).emit('notifCount', count);
    }
  });
  socket.on('send_comment', async (arr) => {
    console.log('recieving');
    const response = await pool.query('SELECT user_name FROM post WHERE id=$1', [arr.id]);
    console.log(response.rows);
    console.log(arr);
    const id1 = await getUser(response.rows[0].user_name);
    const user = response.rows[0].user_name;
    const count1 = await handleNewNotif(user);
    const count = count1;

    if (id1 !== undefined) {
      io.to(id1.socketid).emit('notifCount', count);
    }
    const id2 = await getUser(arr.username);
    console.log(response.rows[0].user_name);
    console.log(arr.username);
    console.log(id1);
    console.log(id2);

    if (id1 !== undefined) {
      io.to(id1.socketid).emit('liked');
      io.to(id1.socketid).emit('commented');
      console.log('Sending comment to him');
    }

    if (id2 !== undefined) {
      io.to(id2.socketid).emit('liked');
      io.to(id2.socketid).emit('commented');
      console.log('Sending comment to him');
    }
  });
  socket.on('replycomm', async (arr) => {
    console.log(arr[0]);
    console.log(arr[1]);
    const id1 = await getUser(arr[0]);
    if (id1 !== undefined) {
      io.to(id1.socketid).emit('commreply', arr[1]);
    }
  });
  // socket.on('replyingcomm', async (arr) => {
  //   console.log(arr[0]);//username
  //   console.log(arr[1]);//replyid
  //   const response=await pool.query(`SELECT user_name FROM comments WHERE comment_id=$1`,[arr[1]]);
  //   response.rows[0].user_name
  //   const id1 = await getUser(arr[0]);
  //   if (id1 !== undefined) {
  //     io.to(id1.socketid).emit('commreply', arr[1]);
  //   }
  // });

  socket.on('disconnect', async () => {
    console.log('Vraj1');
    try {
      await removeUser(socket.id);
      const response = await pool.query('SELECT * FROM online');
      onlineUsers = [...response.rows];
      io.emit('user_offline', onlineUsers); // Emit event to update all clients with online users
    } catch (error) {
      console.error('Error handling disconnect:', error.message);
    }
  });
});

app.use(helmet());
app.use(cookieParser());
// app.use(
//   session({
//     secret: 'vraj',
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: false,
//       maxAge: 1000 * 60 * 5,
//     },
//   }),
// );
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['POST', 'GET', 'PUT'],
    credentials: true,
  }),
);
app.use(express.json());
app.use(bodyParser.json());
// app.post('/checksession', (req, res) => {
//   console.log('checksession');
//   console.log(req.session.username);
//   if (req.session.username === undefined) {
//     return res.json({ valid: false });
//   } else if (req.session.username) {
//     console.log(req.session.username);
//     return res.json({ valid: true, username: req.session.username });
//   } else {
//     return res.json({ valid: false });
//   }
// });
// app.post('/logout', (req, res) => {
//   req.session.destroy(function (err) {
//     if (err) {
//       console.error('Error destroying session:', err);
//       res.status(500).send('Error destroying session');
//     } else {
//       res.sendStatus(200); // Send a success status
//     }
//   });
// });
// app.get('/checkaccesstoken',async(req,res)=>{
//   try{
//     const accesstoken=req.cookies.accessToken;
//     if(!accesstoken)
//     {

//     }
//     else{
//       jwt.verify(accesstoken,'jwt-access-secret-key',(err,decoded)=>{
//         if(err)
//         {
//           return res.json({ valid:false});
//         }
//         else{
//           req.username=decoded.username;
//           return res.json({ valid: true, username: decoded.username });
//         }
//       })
//     }
//   }
//   catch(err)
//   {
//     console.log(err.message);
//   }
// })
const verifyUser = (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      if (!renewToken(req, res)) {
        return res.json({ valid: false });
      }
    } else {
      jwt.verify(accessToken, 'jwt-access-token-secret-key', (err, decoded) => {
        if (err) {
          return res.json({ valid: false });
        } else {
          req.username = decoded.username;
          console.log('decoded username');
          console.log(decoded.username);
          res.locals.userData = { valid: true, username: decoded.username };
          next();
        }
      });
    }
  } catch (err) {
    console.log(err.message);
  }
};

const renewToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return false;
  } else {
    jwt.verify(refreshToken, 'jwt-refresh-token-secret-key', (err, decoded) => {
      if (err) {
        return false;
      } else {
        console.log(req.username);
        const accessToken = jwt.sign(
          { username: decoded.username },
          'jwt-access-token-secret-key',
          {
            expiresIn: '200m',
          },
        );
        res.cookie('accessToken', accessToken, { maxAge: 60000 });
        res.locals.userData = { valid: true, username: decoded.username };
        return true;
      }
    });
  }
};

app.post('/checksession', verifyUser, (req, res) => {
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

app.post('/handlelogin', async (req, res) => {
  try {
    // console.log(req.session);
    const allUsers = await pool.query('SELECT * FROM "user1"');
    const usersData = allUsers.rows;
    const { username, password } = req.body;
    // const password = await bcrypt.hash(plainTextPassword, salt);

    const isValidLogin = usersData.some(
      (user) => user.user_name === username && bcrypt.compare(password, user.password),
    );
    if (isValidLogin) {
      return res.json({ message: 'Login successful' });
    } else {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/registerjwttoken', async (req, res) => {
  try {
    console.log('registering token');
    const { username } = req.body;
    console.log(username);
    const accessToken = jwt.sign({ username: username }, 'jwt-access-token-secret-key', {
      expiresIn: '200m',
    });
    const refreshToken = jwt.sign({ username: username }, 'jwt-refresh-token-secret-key', {
      expiresIn: '500m',
    });
    res.cookie('accessToken', accessToken, { maxAge: 200 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, {
      maxAge: 500 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    res.json({ message: 'Registered' });
    console.log('token registered');
  } catch (err) {
    console.log(err.message);
  }
});
app.post('/checkuser', async (req, res) => {
  try {
    const { username } = req.body;
    const userQuery = 'SELECT user_name FROM "user1" WHERE user_name = $1';
    const { rowCount } = await pool.query(userQuery, [username]);

    if (rowCount > 0) {
      return res.status(401).json({ error: 'User Already Exists' });
    } else {
      return res.json({ message: 'SignUp successful' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.post('/updateprofile', upload.single('file'), async (req, res) => {
  try {
    const { newUsername, username, email, password, caption } = req.body;
    console.log(req.body);
    console.log('The file is');
    console.log(req.file);
    // const folderPath = 'backend/newImages';
    // var count1 = 0;
    // countFilesInFolder(folderPath).then((count) => {
    //   console.log(`Number of files in ${folderPath}: ${count}`);
    //   count1 = count + 1;
    // });
    if (req.file !== 'undefined') {
      const originalFilePath = req.file.path;
      const newFileName = req.file.originalname;
      const newFilePath = 'newImages/' + newFileName;
      fs.copyFile(originalFilePath, newFilePath, async (copyErr) => {
        if (copyErr) {
          console.error('Error copying file:', copyErr);
          return res.status(500).json({ message: 'Error copying file' });
        }

        console.log('File copied successfully');

        fs.unlink(originalFilePath, async (unlinkErr) => {
          if (unlinkErr) {
            console.error('Error deleting original file:', unlinkErr);
            return res.status(500).json({ message: 'Error deleting original file' });
          }

          try {
            console.log('Reaching here');
            const response1 = await pool.query('DELETE FROM user1 WHERE user_name=$1', [username]);
            const response = await pool.query('INSERT INTO user1 VALUES($1,$2,$3,$4,$5)', [
              newUsername,
              password,
              caption,
              email,
              newFilePath,
            ]);
            res.json({ message: 'Profile updated' });
          } catch (insertErr) {
            console.error('Error inserting data into the database:', insertErr);
            res
              .status(500)
              .json({ success: false, message: 'Error inserting data into the database' });
          }
        });
      });
    } else {
      const response = await pool.query(
        'UPDATE user1 SET password=$1, note=$2, email=$3, user_name=$4 WHERE user_name=$5',
        [password, caption, email, newUsername, username],
      );
      res.json({ message: 'Profile updated' });
    }
  } catch (err) {
    console.error('Error storing image data:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/unfollow', async (req, res) => {
  try {
    console.log('Unfollow');
    console.log(req.body);
    const { person1, person2 } = req.body;
    const query = `DELETE FROM following WHERE person1=$1 AND person2=$2`;
    await pool.query(query, [person1, person2]);
    const query1 = `DELETE FROM notifications WHERE person1=$1 AND person2=$2 AND id=$3`;
    await pool.query(query1, [person1, person2, 'following']);
    res.json('yes');
  } catch (err) {
    console.log(err.message);
  }
});
app.put('/fetchImage', async (req, res) => {
  try {
    const { username1 } = req.body;
    const result = await pool.query('SELECT profile FROM user1 WHERE user_name = $1', [username1]);
    console.log('Fetching images');
    console.log(result.rows);
    console.log(username1);
    console.log(result.rows[0].profile);
    fs.readFile(result.rows[0].profile, (err, data) => {
      if (err) {
        console.error('Error reading image file:', err);
        return res.status(500).json({ error: 'Error reading image file' });
      }
      const base64Image = Buffer.from(data).toString('base64');
      res.json({ imageContent: base64Image });
    });
  } catch (err) {
    console.error('Error fetching image data:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
app.post('/addpost', upload.array('files', 10), async (req, res) => {
  try {
    // formdata.append('username', username);
    // formdata.append('caption', caption);
    // formdata.append('minutes', date.getMinutes() % 60);
    // formdata.append('hours', date.getHours() % 60);
    // formdata.append('day', date.getDay());
    // formdata.append('date', date.getDate());
    // formdata.append('month', date.getMonth());
    // formdata.append('year', date.getFullYear());
    // var ampm = date.getHours() > 12 ? 'PM' : 'AM';
    // formdata.append('ampm', ampm);
    const { username, caption, minutes, hours, day, date, month, year, ampm } = req.body;
    const files = req.files;
    console.log(username);
    console.log(caption);
    const userExistsQuery = 'SELECT * FROM user1 WHERE user_name = $1';
    const userExistsResult = await pool.query(userExistsQuery, [username]);
    if (userExistsResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    var newFilePaths = [];
    console.log(files);
    // const folderPath = 'backend/newImages';
    // var count1 = 0;
    // countFilesInFolder(folderPath).then((count) => {
    //   console.log(`Number of files in ${folderPath}: ${count}`);
    //   count1 = count + 1;
    // });
    for (const file of files) {
      const originalFilePath = file.path;
      const newFileName = file.originalname;
      const newFilePath = 'newImages/' + newFileName;
      newFilePaths.push(newFilePath);
      fs.copyFile(originalFilePath, newFilePath, (copyErr) => {
        if (copyErr) {
          console.error('Error copying file:', copyErr);
          return res.status(500).json({ message: 'Error copying file' });
        }
        console.log('File copied successfully');
        fs.unlink(originalFilePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Error deleting original file:', unlinkErr);
            return res.status(500).json({ message: 'Error deleting original file' });
          }

          console.log('Original file deleted successfully');
        });
      });
    }
    const response1 = await pool.query(
      'INSERT INTO post(user_name,caption,pictures,minutes,hour,day,date,month,year,ampm) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
      [username, caption, newFilePaths, minutes, hours, day, date, month, year, ampm],
    );
    res.json({
      success: true,
      message: 'Files copied and originals deleted successfully',
      newFilePaths,
    });
  } catch (error) {
    console.error('Error adding post:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

app.post('/insert', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const password1 = await bcrypt.hash(password, salt);

    const fs = require('fs');
    const filePath = '/Users/vrajshah1510/Documents/SOCIALMEDIAAPP/frontend/src/Images/profile.png'; // Replace with the actual file path
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath);
      const newTodo = await pool.query(
        'INSERT INTO "user1" (user_name, password, email, profile) VALUES($1, $2, $3, $4) RETURNING *',
        [username, password1, email, fileContent],
      );
      await newTodo.json();
      req.session.user = {
        username,
        // id:newTodo.rows[0].id
      };
      res.json('YES');
    } else {
      res.status(404).json('File not found');
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json('Internal Server Error');
  }
});

app.post('/sentrequest', async (req, res) => {
  // console.log(req.body);
  try {
    var date = new Date();
    const { person1, person2, id, pid } = req.body;
    await pool.query(`INSERT INTO "requestsent" (person1, person2) VALUES ($1, $2)`, [
      person1,
      person2,
    ]);
    await pool.query(
      `INSERT INTO "notifications" (person1, person2, id, pid,seen1,seen2,minutes,hour,day,date,month,year,ampm) VALUES ($1, $2, $3, $4,'no','no',$5,$6,$7,$8,$9,$10,$11)`,
      [
        person1,
        person2,
        id,
        pid,
        date.getMinutes() % 60,
        date.getHours() % 60,
        date.getDay(),
        date.getDate(),
        date.getMonth(),
        date.getFullYear(),
        date.getHours() > 12 ? 'PM' : 'AM',
      ],
    );
    res.json('YES');
  } catch (err) {
    console.error(err.message);
  }
});
function readProfile(profilePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(profilePath, (err, data) => {
      if (err) {
        console.error(`Error reading profile file (${profilePath}):`, err);
        reject(err);
        return;
      }
      const base64Image = Buffer.from(data).toString('base64');
      resolve(base64Image);
    });
  });
}
app.put('/fetchnotifications', async (req, res) => {
  try {
    const { username } = req.body;

    const query = `
      SELECT n.*, u1.profile AS person1_profile, u2.profile AS person2_profile
      FROM notifications n
      LEFT JOIN user1 u1 ON n.person1 = u1.user_name
      LEFT JOIN user1 u2 ON n.person2 = u2.user_name
      WHERE n.person2 = $1 OR n.person1 = $1
    `;
    const result = await pool.query(query, [username]);
    const allNotifications = result.rows;
    res.writeHead(200, {
      'Content-Type': 'application/json',
    });
    const updatedNotificationsPromise = Promise.all(
      allNotifications.map((notification) =>
        Promise.all([
          readProfile(notification.person1_profile),
          readProfile(notification.person2_profile),
        ]).then(([person1Profile, person2Profile]) => ({
          ...notification,
          person1_profile: person1Profile,
          person2_profile: person2Profile,
        })),
      ),
    );
    updatedNotificationsPromise
      .then((updatedNotifications1) => {
        console.log(updatedNotifications1.length);
        const updatedNotifications = updatedNotifications1.filter((notification) => {
          return (
            (notification.person1 === username && notification.id === 'following') ||
            (notification.person2 === username &&
              (notification.id === 'follow' ||
                notification.id === 'following' ||
                notification.id === 'like' ||
                notification.id === 'comment' ||
                notification.id === 'commentlike' ||
                notification.id === 'commentreply'))
          );
        });

        // Now you can use the filteredNotifications array in your component

        updatedNotifications.map((notification) => {
          console.log(notification.person1 + ' ' + notification.person2 + ' ' + notification.id);
        });
        res.end(JSON.stringify(updatedNotifications));
      })
      .catch((error) => {
        res.end({ message: 'Error' });
      });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/deleterequest', async (req, res) => {
  // console.log(req.body);
  try {
    const { person1, person2 } = req.body;
    await pool.query('DELETE FROM requestsent WHERE person1=$1 AND person2=$2', [person1, person2]);
    await pool.query(
      'DELETE FROM notifications WHERE person1=$1 AND person2=$2 AND id=$3 AND pid=$4',
      [person1, person2, 'follow', '-1'],
    );
    res.json('YES');
  } catch (err) {
    console.error(err.message);
  }
});
app.put('/checkfollower', async (req, res) => {
  try {
    const { user1, user2 } = req.body;
    const response = await pool.query('SELECT * FROM following WHERE person1=$1 AND person2=$2', [
      user1,
      user2,
    ]);
    // const allTodos = response.rows;
    res.json({ success: true, data: response.rows });
  } catch (err) {
    console.error(err.message);
  }
});
app.post('/removeFollower', async (req, res) => {
  try {
    console.log('Removing as  a follower');
    console.log(req.body);
    const { user1, user2 } = req.body;
    const response = await pool.query('DELETE FROM following WHERE person1=$1 AND person2=$2', [
      user1,
      user2,
    ]);
    const allTodos = response.rows;
    const query1 = `DELETE FROM notifications WHERE person1=$1 AND person2=$2 AND id=$3`;
    await pool.query(query1, [user1, user2, 'following']);
    res.json({ success: true, data: allTodos.rows });
  } catch (err) {
    console.error(err.message);
  }
});
app.put('/deleterequest1', async (req, res) => {
  try {
    const { user1, user2 } = req.body;
    await pool.query('DELETE FROM requestsent WHERE person1 = $1 AND person2 = $2', [user1, user2]);
    res.status(200).json({ message: 'Request deleted successfully' });
  } catch (err) {
    console.error('Error deleting request:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/addfollowing', async (req, res) => {
  try {
    const { user1, user2 } = req.body;
    const newTodo = await pool.query('INSERT INTO following VALUES($1, $2) RETURNING *', [
      user1,
      user2,
    ]);
    res.status(200).json({ message: 'Request deleted successfully' });
  } catch (err) {
    console.error(err.message);
  }
});
app.put('/updatenotification', async (req, res) => {
  try {
    console.log(req.body);
    const { user1, user2, id1, pid1 } = req.body;
    var date = new Date();
    const deleteResult = await pool.query(
      'DELETE FROM notifications WHERE person1=$1 AND person2=$2 AND id=$3 AND pid=$4',
      [user1, user2, id1, pid1],
    );

    if (deleteResult.rowCount === 0) {
      res.status(404).json({ error: 'Notification not found' });
    } else {
      await pool.query(
        'INSERT INTO notifications VALUES($1, $2, $3, $4,$5,$6,$7,$8,$9,$10,$11,$12,$13)',
        [
          user1,
          user2,
          'following',
          pid1,
          'no',
          'yes',
          date.getMinutes() % 60,
          date.getHours() % 60,
          date.getDay(),
          date.getDate(),
          date.getMonth(),
          date.getFullYear(),
          date.getHours() > 12 ? 'PM' : 'AM',
        ],
      );
      res.status(200).json({ message: 'Notification updated successfully' });
    }
  } catch (err) {
    console.error(err.message);
    // Respond with an error status code and message
    return res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/seenNotifications', async (req, res) => {
  // Assuming you retrieve username from the request body
  const { username } = req.body;

  try {
    // Your logic to update notifications goes here
    // For example:
    await pool.query('UPDATE notifications SET seen1 = $1 WHERE person1 = $2', ['yes', username]);
    await pool.query('UPDATE notifications SET seen2 = $1 WHERE person2 = $2', ['yes', username]);

    // Respond with a JSON object indicating success
    res.json({ success: true, message: 'Notifications updated successfully' });
  } catch (error) {
    console.error('Error updating notifications:', error);
    res.status(500).json({ success: false, message: 'Error updating notifications' });
  }
});

app.put('/updatenote', async (req, res) => {
  try {
    const { username, inputValue } = req.body;
    const updateQuery = `
      UPDATE "user1"
      SET note = $2
      WHERE user_name = $1
      RETURNING *
    `;
    const updatedUser = await pool.query(updateQuery, [username, inputValue]);
    res.json({ success: true, message: 'Profile updated successfully', data: updatedUser.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/fetch1', async (req, res) => {
  try {
    const query = `
      SELECT user_name,profile FROM "user1";
    `;
    const result = await pool.query(query);
    const allTodos = result.rows;
    res.writeHead(200, {
      'Content-Type': 'application/json', // Assuming the response is JSON
    });

    // const updatedTodos = allTodos.map((todo) => ({
    //   user_name: todo.user_name,
    //   profile: todo.profile ? todo.profile.toString('base64') : null, // Assuming profile is a Buffer
    // }));
    // res.end(JSON.stringify(updatedTodos));
    const updatedTodosPromise = Promise.all(
      allTodos.map(
        (todo) =>
          new Promise((resolve, reject) => {
            fs.readFile(todo.profile, (err, data) => {
              if (err) {
                console.error('Error reading image file:', err);
                reject(err); // Reject the promise if there's an error
                return;
              }
              const base64Image = Buffer.from(data).toString('base64');
              resolve({ user_name: todo.user_name, profile: base64Image });
            });
          }),
      ),
    );

    updatedTodosPromise
      .then((updatedTodos) => {
        res.end(JSON.stringify(updatedTodos));
        // Now you can use updatedTodos array with base64Image stored in profile
      })
      .catch((error) => {
        res.end({ message: 'Error' });
        // Handle error
      });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.put('/fetchnote', async (req, res) => {
  try {
    const { username1 } = req.body;
    const allTodos = await pool.query('SELECT note FROM user1 WHERE user_name ILIKE $1', [
      username1,
    ]);
    res.json({ success: true, data: allTodos.rows[0].note });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
app.put('/follow', async (req, res) => {
  try {
    const { user1, user2 } = req.body;
    const allTodos = await pool.query('SELECT * FROM following WHERE person1=$1 AND person2=$2', [
      user1,
      user2,
    ]);
    res.json({ success: true, data: allTodos.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
app.put('/requestsent', async (req, res) => {
  try {
    const { person1, person2 } = req.body;
    const allTodos = await pool.query('SELECT * FROM requestsent WHERE person1=$1 AND person2=$2', [
      person1,
      person2,
    ]);
    res.json({ success: true, data: allTodos.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
app.put('/followers', async (req, res) => {
  try {
    const { person } = req.body;
    const allTodos = await pool.query('SELECT * FROM requestsent WHERE person2=$1', [person]);
    res.json({ success: true, data: allTodos.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
app.put('/following', async (req, res) => {
  try {
    const { person } = req.body;
    const allTodos = await pool.query('SELECT * FROM requestsent WHERE person1=$1', [person]);
    res.json({ success: true, data: allTodos.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
app.put('/followersofuser', async (req, res) => {
  const { username1 } = req.body;
  try {
    const query = `
      SELECT following.person2, user1.profile
      FROM following
      JOIN user1 ON following.person2 = user1.user_name
      WHERE following.person1 = $1;
    `;
    const result = await pool.query(query, [username1]);

    const allTodos = result.rows;
    res.writeHead(200, {
      'Content-Type': 'application/json', // Assuming the response is JSON
    });

    const updatedTodosPromise = Promise.all(
      allTodos.map(
        (todo) =>
          new Promise((resolve, reject) => {
            fs.readFile(todo.profile, (err, data) => {
              if (err) {
                console.error('Error reading image file:', err);
                reject(err); // Reject the promise if there's an error
                return;
              }
              const base64Image = Buffer.from(data).toString('base64');
              resolve({ person2: todo.person2, profile: base64Image });
            });
          }),
      ),
    );

    updatedTodosPromise
      .then((updatedTodos) => {
        res.end(JSON.stringify(updatedTodos));
        // Now you can use updatedTodos array with base64Image stored in profile
      })
      .catch((error) => {
        res.end({ message: 'Error' });
        // Handle error
      });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.put('/userfollowing', async (req, res) => {
  const { username1 } = req.body;
  try {
    const query = `
      SELECT following.person1, user1.profile
      FROM following
      JOIN user1 ON following.person1 = user1.user_name
      WHERE following.person2 = $1;
    `;
    const result = await pool.query(query, [username1]);
    const allTodos = result.rows;
    res.writeHead(200, {
      'Content-Type': 'application/json', // Assuming the response is JSON
    });

    const updatedTodosPromise = Promise.all(
      allTodos.map(
        (todo) =>
          new Promise((resolve, reject) => {
            fs.readFile(todo.profile, (err, data) => {
              if (err) {
                console.error('Error reading image file:', err);
                reject(err); // Reject the promise if there's an error
                return;
              }
              const base64Image = Buffer.from(data).toString('base64');
              resolve({ person1: todo.person1, profile: base64Image });
            });
          }),
      ),
    );

    updatedTodosPromise
      .then((updatedTodos) => {
        res.end(JSON.stringify(updatedTodos));
        // Now you can use updatedTodos array with base64Image stored in profile
      })
      .catch((error) => {
        res.end({ message: 'Error' });
        // Handle error
      });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.put('/mutual', async (req, res) => {
  console.log(req.body);
  const { user1, user2 } = req.body;
  try {
    const query = `SELECT t1.person2,u1.profile
                  FROM following t1 JOIN user1 u1 ON t1.person2=u1.user_name
                  WHERE t1.person1 =$1
                  INTERSECT
                  SELECT t2.person2,u2.profile
                  FROM following t2 JOIN user1 u2 ON t2.person2=u2.user_name
                  WHERE t2.person1 =$2;
                  `;
    const result = await pool.query(query, [user1, user2]);
    const allTodos = result.rows;
    console.log('Mutuals');
    console.log(user1);
    console.log(user2);
    console.log(allTodos);
    res.writeHead(200, {
      'Content-Type': 'application/json', // Assuming the response is JSON
    });
    const updatedTodos = allTodos.map((todo) => ({
      person2: todo.person2,
      profile: todo.profile ? todo.profile.toString('base64') : null, // Assuming profile is a Buffer
    }));
    res.end(JSON.stringify(updatedTodos));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// app.post('/addpost', upload.array('files', 10), async (req, res) => {
//   try {
//     const { username, caption } = req.body;
//     const files = req.files;
//     console.log(username);
//     console.log(caption);
//     const userExistsQuery = 'SELECT * FROM user1 WHERE user_name = $1';
//     const userExistsResult = await pool.query(userExistsQuery, [username]);
//     if (userExistsResult.rows.length === 0) {
//       return res.status(404).json({ success: false, message: 'User not found.' });
//     }
//   } catch (error) {
//     console.error('Error adding post:', error.message);
//     res.status(500).json({ success: false, message: 'Internal server error.' });
//   }
// });
// app.put('/fetchImage', async (req, res) => {
//   try {
//     const { username1 } = req.body;
//     const result = await pool.query('SELECT profile FROM user1 WHERE user_name = $1', [username1]);
//     console.log(result.rows[0].profile);
//     fs.readFile(result.rows[0].profile, (err, data) => {
//       if (err) {
//         console.error('Error reading image file:', err);
//         return res.status(500).json({ error: 'Error reading image file' });
//       }
//       const base64Image = Buffer.from(data).toString('base64');
//       res.json({ imageContent: base64Image });
//     });
//   } catch (err) {
//     console.error('Error fetching image data:', err);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// });
app.put('/fetchpost', async (req, res) => {
  try {
    const { username1 } = req.body;
    const result = await pool.query('SELECT id,caption, pictures FROM post WHERE user_name = $1', [
      username1,
    ]);
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'No posts found for the given username.' });
      return;
    }
    console.log('imagesofpost');
    const posts = await Promise.all(
      result.rows.map(async (post) => {
        const pictures = await Promise.all(
          post.pictures.map(
            (picture) =>
              new Promise((resolve, reject) => {
                fs.readFile(picture, (err, data) => {
                  if (err) {
                    console.error('Error reading image file:', err);
                    reject(err);
                  } else {
                    const base64Image = Buffer.from(data).toString('base64');
                    resolve(base64Image);
                  }
                });
              }),
          ),
        );
        return {
          id: post.id,
          caption: post.caption,
          pictures,
        };
      }),
    );

    // console.log(posts);
    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (err) {
    console.error('Error fetching posts data:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
app.put('/fetchpostcount', async (req, res) => {
  try {
    const { username1 } = req.body;
    const result = await pool.query('SELECT * FROM post WHERE user_name = $1', [username1]);
    res.status(200).json({
      success: true,
      data: result.rows.length,
    });
  } catch (err) {
    console.error('Error fetching posts data:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
app.put('/fetchpostuserbyid', async (req, res) => {
  try {
    console.log('Fetchpostuserbyid');
    console.log(req.body);
    const { id } = req.body;
    const result = await pool.query('SELECT * FROM post WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'No posts found for the given id.' });
      return;
    }
    const posts = await Promise.all(
      result.rows.map(async (post) => {
        const pictures = await Promise.all(
          post.pictures.map(
            (picture) =>
              new Promise((resolve, reject) => {
                fs.readFile(picture, (err, data) => {
                  if (err) {
                    console.error('Error reading image file:', err);
                    reject(err);
                  } else {
                    const base64Image = Buffer.from(data).toString('base64');
                    resolve(base64Image);
                  }
                });
              }),
          ),
        );
        return {
          id: post.id,
          caption: post.caption,
          pictures,
        };
      }),
    );

    res.status(200).json({
      success: true,
      data: result.rows[0],
      post: posts[0],
    });
  } catch (err) {
    console.error('Error fetching posts data:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
function isFile(data) {
  // Check if the data is a buffer or a stream
  return Buffer.isBuffer(data) || (typeof data === 'object' && typeof data.pipe === 'function');
}
app.post('/editpost', upload.array('files'), async (req, res) => {
  try {
    const { caption, id, length } = req.body;
    console.log(req.body);
    console.log(req.files);
    const response = await pool.query('SELECT pictures FROM post WHERE id=$1', [id]);
    response.rows[0].pictures;
    const newimagesArray = [...response.rows[0].pictures];
    console.log(newimagesArray);
    const finallength = newimagesArray.length;
    const folderPath = 'backend/newImages';
    var count1 = 0;
    countFilesInFolder(folderPath).then((count) => {
      console.log(`Number of files in ${folderPath}: ${count}`);
      count1 = count + 1;
    });
    req.files.forEach((file, index) => {
      const originalFilePath = file.path;
      const newFileName = file.originalname;
      const newFilePath = 'newImages/' + String(count1);
      count1++;
      fs.copyFile(originalFilePath, newFilePath, (copyErr) => {
        if (copyErr) {
          console.error('Error copying file:', copyErr);
          return res.status(500).json({ message: 'Error copying file' });
        }
        console.log('File copied successfully');
        fs.unlink(originalFilePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Error deleting original file:', unlinkErr);
            return res.status(500).json({ message: 'Error deleting original file' });
          }

          console.log('Original file deleted successfully');
        });
      });
      if (parseInt(file.filename) >= newimagesArray.length) {
        newimagesArray.push(newFilePath);
      } else {
        newimagesArray[parseInt(file.filename)] = newFilePath;
      }
    });
    newimagesArray.length = length;
    console.log(newimagesArray);
    const updateQuery = 'UPDATE post SET caption=$1, pictures=$2 WHERE id=$3';
    const updateValues = [caption, newimagesArray, id];
    await pool.query(updateQuery, updateValues);
    console.log('Array of buffers inserted into the database successfully.');
    res.status(200).json({ success: true, message: 'Post with images added successfully.' });
  } catch (error) {
    console.error('Error adding post:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});
app.put('/deletepost', async (req, res) => {
  try {
    const { id } = req.body;
    const response1 = await pool.query('DELETE FROM post WHERE id=$1', [id]);
    const response2 = await pool.query('DELETE FROM messages WHERE post_id=$1', [id]);
    const response3 = await pool.query('DELETE FROM comments WHERE post_id=$1', [id]);
    const response4 = await pool.query('DELETE FROM likes WHERE post_id=$1', [id]);
    const response5 = await pool.query(
      'DELETE FROM comment_like WHERE comment_id NOT IN (SELECT comment_id FROM comments)',
    );
    let deletedCount = 1; // Initialize a variable to track the number of deleted entries

    while (deletedCount > 0) {
      const response6 = await pool.query(`
    DELETE FROM comments 
    WHERE reply_id NOT IN (SELECT comment_id FROM comments)
  `);

      deletedCount = response6.rowCount; // Update deletedCount with the number of rows deleted in the current iteration

      console.log(`${deletedCount} entries deleted in this iteration.`);

      // Add a small delay to prevent overwhelming the database
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    res.json({ message: 'ok' });
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
  }
});
app.put('/findfriend', async (req, res) => {
  try {
    const { username } = req.body;
    const response = await pool.query(
      'SELECT person1 as user FROM following WHERE person2=$1 UNION SELECT person2 as user FROM following WHERE person1=$1',
      [username],
    );
    const users = response.rows;

    const response1 = await pool.query(
      'SELECT user2 as user FROM chats WHERE user1=$1 UNION SELECT user1 as user FROM chats WHERE user2=$1',
      [username],
    );
    const users1 = response1.rows;
    // console.log(users);
    // console.log(users1);
    const userNames = users.map((user) => user.user);
    const userNames1 = users1.map((user) => user.user);

    // Subtract common elements
    const subtractedUsers = users.filter((user) => !userNames1.includes(user.user));
    const finalusers = subtractedUsers.map((user1) => ({ user: user1.user }));

    // console.log(finalusers);

    const usersWithProfileImages = await Promise.all(
      finalusers.map(async (row1) => {
        const friendUsername = row1.user;
        const profileImageResponse = await pool.query(
          'SELECT profile FROM user1 WHERE user_name = $1',
          [friendUsername],
        );
        const profileImageBuffer = profileImageResponse.rows[0]?.profile;
        return {
          id: row1.id,
          username: friendUsername,
          profile: profileImageBuffer,
        };
      }),
    );

    const updatedTodosPromise = Promise.all(
      usersWithProfileImages.map(
        (todo) =>
          new Promise((resolve, reject) => {
            fs.readFile(todo.profile, (err, data) => {
              if (err) {
                console.error('Error reading image file:', err);
                reject(err); // Reject the promise if there's an error
                return;
              }
              const base64Image = Buffer.from(data).toString('base64');
              resolve({ id: todo.id, username: todo.username, profile: base64Image });
            });
          }),
      ),
    );

    updatedTodosPromise
      .then((updatedTodos) => {
        res.end(JSON.stringify(updatedTodos));
        // Now you can use updatedTodos array with base64Image stored in profile
      })
      .catch((error) => {
        res.end({ message: 'Error' });
        // Handle error
      });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});
app.put('/notfollowing', async (req, res) => {
  try {
    const { username } = req.body;
    const response = await pool.query('SELECT person2 as user FROM following WHERE person1=$1', [
      username,
    ]);
    const users = response.rows;
    const response1 = await pool.query('SELECT user_name as user FROM user1 WHERE user_name!=$1', [
      username,
    ]);
    const users1 = response1.rows;
    const usersSubtracted = users1.filter(
      (user1) => !users.some((user2) => user1.user === user2.user),
    );
    const usersWithProfileImages = await Promise.all(
      usersSubtracted.map(async (user) => {
        const { user: friendUsername } = user;
        const profileImageResponse = await pool.query(
          'SELECT profile FROM user1 WHERE user_name = $1',
          [friendUsername],
        );

        const profileImageBuffer = profileImageResponse.rows[0].profile;
        return {
          username: friendUsername,
          profile: profileImageBuffer,
        };
      }),
    );
    // res.status(200).json({
    //   success: true,
    //   data: usersWithProfileImages,
    // });
    const updatedTodosPromise = Promise.all(
      usersWithProfileImages.map(
        (todo) =>
          new Promise((resolve, reject) => {
            fs.readFile(todo.profile, (err, data) => {
              if (err) {
                console.error('Error reading image file:', err);
                reject(err); // Reject the promise if there's an error
                return;
              }
              const base64Image = Buffer.from(data).toString('base64');
              resolve({ person1: todo.username, profile: base64Image });
            });
          }),
      ),
    );

    updatedTodosPromise
      .then((updatedTodos) => {
        res.end(JSON.stringify(updatedTodos));
        // Now you can use updatedTodos array with base64Image stored in profile
      })
      .catch((error) => {
        res.end({ message: 'Error' });
        // Handle error
      });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});
app.post('/addchat', async (req, res) => {
  try {
    const { user1, user2 } = req.body;
    const response = await pool.query(
      'INSERT INTO chats (user1, user2) VALUES ($1, $2) RETURNING id',
      [user1, user2],
    );

    res.json({ success: true, id: response.rows[0].id });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});
app.put('/fetchchats', async (req, res) => {
  try {
    const { username } = req.body;
    const response = await pool.query(
      'SELECT id,user2 as user FROM chats WHERE user1=$1 UNION SELECT id,user1 as user FROM chats WHERE user2=$1',
      [username],
    );
    const user1 = response.rows;
    // console.log(response.rows);
    const usersWithProfileImages = await Promise.all(
      user1.map(async (row1) => {
        const friendUsername = row1.user;
        const profileImageResponse = await pool.query(
          'SELECT profile FROM user1 WHERE user_name = $1',
          [friendUsername],
        );
        const profileImageBuffer = profileImageResponse.rows[0]?.profile;
        return {
          id: row1.id,
          username: friendUsername,
          profile: profileImageBuffer,
        };
      }),
    );

    const updatedTodosPromise = Promise.all(
      usersWithProfileImages.map(
        (todo) =>
          new Promise((resolve, reject) => {
            fs.readFile(todo.profile, (err, data) => {
              if (err) {
                console.error('Error reading image file:', err);
                reject(err); // Reject the promise if there's an error
                return;
              }
              const base64Image = Buffer.from(data).toString('base64');
              resolve({ id: todo.id, username: todo.username, profile: base64Image });
            });
          }),
      ),
    );

    updatedTodosPromise
      .then((updatedTodos) => {
        res.end(JSON.stringify(updatedTodos));
        // Now you can use updatedTodos array with base64Image stored in profile
      })
      .catch((error) => {
        res.end({ message: 'Error' });
        // Handle error
      });
    console.log(usersWithProfileImages);
  } catch (err) {
    console.error(err.message);
  }
});
app.post('/deletechat', async (req, res) => {
  try {
    const { user1, user2 } = req.body;
    const response1 = await pool.query(
      'DELETE FROM chats WHERE (user1 = $1 AND user2 = $2) OR (user1 = $2 AND user2 = $1)',
      [user1, user2],
    );
    const response2 = await pool.query(
      'UPDATE messages SET delete1 = $1 WHERE (user1 = $2 AND user2 = $3)',
      ['yes', user1, user2],
    );
    const response3 = await pool.query(
      'UPDATE messages SET delete2 = $1 WHERE (user1 = $2 AND user2 = $3)',
      ['yes', user2, user1],
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
  }
});
app.post('/insertmessage', upload.single('file'), async (req, res) => {
  try {
    console.log('req.body');
    console.log(req.body);
    const {
      user1,
      user2,
      message,
      room,
      minutes,
      hours,
      day,
      date,
      month,
      year,
      ampm,
      reply,
      post_id,
    } = req.body;
    console.log('Fileeeeeee');
    console.log(req.file);
    var newFilePath = '';
    if (req.file !== undefined) {
      const originalFilePath = req.file.path;
      const newFileName = req.file.originalname;
      newFilePath = 'newImages/' + newFileName;

      fs.copyFile(originalFilePath, newFilePath, async (copyErr) => {
        if (copyErr) {
          console.error('Error copying file:', copyErr);
          return res.status(500).json({ message: 'Error copying file' });
        }

        console.log('File copied successfully');

        fs.unlink(originalFilePath, async (unlinkErr) => {
          if (unlinkErr) {
            console.error('Error deleting original file:', unlinkErr);
            return res.status(500).json({ message: 'Error deleting original file' });
          }
        });
      });
    }
    console.log('Reaching herereee');
    console.log(req.body);
    const response1 = await pool.query(
      'INSERT INTO messages(user1, user2, message, room, minutes, "hour", day, date, month, year, ampm, seen1, seen2, type, delete1, delete2,post_id,edited,image_path) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,$17,$18,$19) RETURNING id',
      [
        user1,
        user2,
        message,
        room,
        minutes,
        hours,
        day,
        date,
        month,
        year,
        ampm,
        'yes',
        'no',
        reply,
        'no',
        'no',
        post_id,
        'no',
        newFilePath,
      ],
    );
    const insertedId = response1.rows[0].id; // Get the ID of the inserted row
    res.json({ success: true, messageId: insertedId }); // Return the ID in the response
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.put('/getmessages', async (req, res) => {
  try {
    const { room } = req.body;
    const response1 = await pool.query(`SELECT * FROM messages WHERE room=$1`, [room]);
    console.log(response1.rows);

    const updatedPromises = response1.rows.map((message1) => {
      return new Promise((resolve, reject) => {
        if (message1.image_path !== null) {
          console.log(message1.image_path);
          console.log(typeof message1.image_path);
          fs.readFile(message1.image_path, (err, data) => {
            if (err) {
              console.log(err.message);
              resolve({ ...message1 });
            } else {
              const base64Image = Buffer.from(data).toString('base64');
              resolve({
                ...message1,
                image_path: base64Image,
              });
            }
          });
        } else {
          resolve({
            ...message1,
          });
        }
      });
    });
    const updatedMessages = await Promise.all(updatedPromises);
    res.json({ success: true, data: updatedMessages });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put('/getrequests', async (req, res) => {
  try {
    const { username } = req.body;
    // console.log(username);
    const response1 = await pool.query(`SELECT * FROM requestsent WHERE person1=$1`, [username]);
    res.json({ success: true, data: response1.rows });
  } catch (err) {
    console.error(err.message);
  }
});
app.put('/getonline', async (req, res) => {
  try {
    const response1 = await pool.query(`SELECT * FROM online`);
    res.json({ success: true, data: response1.rows });
  } catch (err) {
    console.error(err.message);
  }
});
app.put('/seeMessages', async (req, res) => {
  const { user1, user2 } = req.body;
  const response = await pool.query('UPDATE messages SET seen2=$1 WHERE user1=$2 AND user2=$3', [
    'yes',
    user1,
    user2,
  ]);
  res.json({ success: true });
  // user2 sends to user1
  // Vraj sends to jay, so jay is user1 and vraj is user2; set seen1='yes'
});
app.put('/getlike', async (req, res) => {
  try {
    const { id } = req.body;
    const response = await pool.query('SELECT * FROM likes WHERE post_id=$1', [id]);
    console.log('Likesssss');
    console.log(response.rows);
    res.json({ success: true, data: response.rows });
  } catch (err) {
    console.log(err.message);
  }
});
app.put('/listlike', async (req, res) => {
  try {
    const { id } = req.body;
    const response = await pool.query('SELECT * FROM likes WHERE post_id=$1', [id]);
    res.json({ success: true, data: response.rows.length });
  } catch (err) {
    console.log(err.message);
  }
});
app.put('/fetchunseen', async (req, res) => {
  const { username } = req.body;
  const map1 = new Map();
  const response = await pool.query(
    'SELECT user1 as user FROM chats  WHERE user2=$1 UNION SELECT user2 as user FROM chats WHERE user1=$1',
    [username],
  );
  const data = response.rows;
  console.log(data);
  await Promise.all(
    data.map(async (users) => {
      console.log(users.user);
      const response1 = await pool.query(
        'SELECT * FROM messages WHERE user1=$1 AND user2=$3 AND seen2=$2',
        [users.user, 'no', username],
      );
      console.log(response1.rows.length);
      map1.set(users.user, response1.rows.length);
    }),
  );
  res.json({ success: true, data: [...map1] });
});
app.post('/insertcomment', async (req, res) => {
  try {
    const {
      id,
      username,
      value,
      comment_type,
      reply_id,
      minutes,
      hour,
      day,
      date,
      month,
      year,
      ampm,
    } = req.body;
    const response1 = await pool.query(
      'INSERT INTO comments(post_id,username,comment,comment_type,reply_id,minutes,hour,day,date,month,year,ampm) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING comment_id',
      [id, username, value, comment_type, reply_id, minutes, hour, day, date, month, year, ampm],
    );
    const postOwnerResponse = await pool.query('SELECT user_name FROM post WHERE id=$1', [id]);
    const postOwner = postOwnerResponse.rows[0].user_name;
    if (reply_id === -1) {
      await pool.query(
        'INSERT INTO notifications (person1,person2,id,pid,seen1,seen2,minutes,hour,day,date,month,year,ampm) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)',
        [
          username,
          postOwner,
          'comment',
          id,
          'yes',
          'no',
          minutes,
          hour,
          day,
          date,
          month,
          year,
          ampm,
        ],
      );
    } else {
      const response = await pool.query('SELECT username FROM comments WHERE comment_id=$1', [
        reply_id,
      ]);
      console.log(response);
      await pool.query(
        'INSERT INTO notifications (person1,person2,id,pid,seen1,seen2,minutes,hour,day,date,month,year,ampm) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)',
        [
          username,
          response.rows[0].username,
          'commentreply',
          reply_id,
          'yes',
          'no',
          minutes,
          hour,
          day,
          date,
          month,
          year,
          ampm,
        ],
      );
    }
    res.json({ success: true, id: response1.rows[0].comment_id });
  } catch (err) {
    console.error(err.message);
  }
});
app.put('/fetchcomment', async (req, res) => {
  const { id } = req.body;
  const map1 = new Map();
  const response = await pool.query('SELECT * FROM comments WHERE post_id=$1', [id]);
  const data = response.rows;
  res.json({ success: true, data });
});
app.put('/fetchcommentbyid', async (req, res) => {
  const { id } = req.body;
  const map1 = new Map();
  const response = await pool.query('SELECT * FROM comments WHERE comment_id=$1', [id]);
  const data = response.rows;
  res.json({ success: true, data });
});
app.put('/handlelikes', async (req, res) => {
  try {
    const { id, username } = req.body;
    var date = new Date();
    // Check if the user has already liked the post
    const likeCheckResponse = await pool.query(
      'SELECT * FROM likes WHERE user_name=$1 AND post_id=$2',
      [username, id],
    );
    const allLikes = likeCheckResponse.rows;

    if (allLikes.length > 0) {
      // If the user has already liked the post, delete the like
      await pool.query('DELETE FROM likes WHERE user_name=$1 AND post_id=$2', [username, id]);
      const response = await pool.query(
        'SELECT person2 FROM notifications WHERE person1=$1 AND id=$3 AND pid=$2',
        [username, id, 'like'],
      );
      await pool.query('DELETE FROM notifications WHERE person1=$1 AND id=$3 AND pid=$2', [
        username,
        id,
        'like',
      ]);

      res.json({ success: false, user: response.rows[0].person2 });
    } else {
      // If the user hasn't liked the post, insert the like
      await pool.query('INSERT INTO likes (user_name,post_id) VALUES ($1,$2)', [username, id]);

      // Get the username of the post owner
      const postOwnerResponse = await pool.query('SELECT user_name FROM post WHERE id=$1', [id]);
      const postOwner = postOwnerResponse.rows[0].user_name;

      // Insert a notification for the post owner
      await pool.query(
        'INSERT INTO notifications (person1,person2,id,pid,seen1,seen2,minutes,hour,day,date,month,year,ampm) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)',
        [
          username,
          postOwner,
          'like',
          id,
          'yes',
          'no',
          date.getMinutes() % 60,
          date.getHours() % 60,
          date.getDay(),
          date.getDate(),
          date.getMonth(),
          date.getFullYear(),
          date.getHours() > 12 ? 'PM' : 'AM',
        ],
      );

      res.json({ success: true });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/checklike', async (req, res) => {
  try {
    const { id, username } = req.body;
    const response = await pool.query('SELECT * FROM likes WHERE user_name=$1 AND post_id=$2', [
      username,
      id,
    ]);
    const allTodos = response.rows;
    if (allTodos.length > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    console.error(err.message);
  }
});

app.put('/handlecommentlikes', async (req, res) => {
  try {
    const { id, username } = req.body;
    console.log(id);
    // Check if the user has already liked the post
    var date = new Date();
    const commentCheckResponse = await pool.query(
      'SELECT * FROM comment_like WHERE username=$1 AND comment_id=$2',
      [username, id],
    );
    const allComments = commentCheckResponse.rows;

    if (allComments.length > 0) {
      // If the user has already liked the post, delete the like
      await pool.query('DELETE FROM comment_like WHERE username=$1 AND comment_id=$2', [
        username,
        id,
      ]);
      //find whose comment is this that will be person2
      const response = await pool.query(
        'SELECT person2 FROM notifications WHERE person1=$1 AND id=$3 AND pid=$2',
        [username, id, 'commentlike'],
      );
      await pool.query('DELETE FROM notifications WHERE person1=$1 AND id=$3 AND pid=$2', [
        username,
        id,
        'commentlike',
      ]);

      res.json({ success: false, user: response.rows[0].person2 });
    } else {
      // If the user hasn't liked the post, insert the like
      const response = await pool.query(
        'INSERT INTO comment_like (username,comment_id) VALUES ($1,$2) RETURNING id',
        [username, id],
      );

      // Get the username of the post owner
      const postOwnerResponse = await pool.query(
        'SELECT username FROM comments WHERE comment_id=$1',
        [id],
      );
      console.log('Vraj');
      console.log(postOwnerResponse.rows[0]);
      const postOwner = postOwnerResponse.rows[0].username;
      // Insert a notification for the post owner
      await pool.query(
        'INSERT INTO notifications(person1,person2,id,pid,seen1,seen2,minutes,hour,day,date,month,year,ampm) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)',
        [
          username,
          postOwner,
          'commentlike',
          id,
          'yes',
          'no',
          date.getMinutes() % 60,
          date.getHours() % 60,
          date.getDay(),
          date.getDate(),
          date.getMonth(),
          date.getFullYear(),
          date.getHours() > 12 ? 'PM' : 'AM',
        ],
      );
      console.log('Like id recieved');
      console.log(response.rows[0].id);
      res.json({ success: true, idx: response.rows[0].id });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/checkcommentlike', async (req, res) => {
  try {
    const { id, username } = req.body;
    const response = await pool.query(
      'SELECT * FROM comment_like WHERE username=$1 AND comment_id=$2',
      [username, id],
    );
    const allTodos = response.rows;
    if (allTodos.length > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    console.error(err.message);
  }
});

app.post('/deleteforall', async (req, res) => {
  try {
    const { id } = req.body;
    const response = await pool.query('DELETE FROM messages WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
  }
});
app.post('/deleteforme', async (req, res) => {
  try {
    const { id, username } = req.body;
    console.log(id);
    const updateQuery = `
      UPDATE messages
      SET delete1 = CASE
          WHEN id = $1 AND user1 = $2 THEN 'yes'
          ELSE delete1
          END,
          delete2 = CASE
          WHEN id = $1 AND user2 = $2 THEN 'yes'
          ELSE delete2
          END
      WHERE id = $1 AND (user1 = $2 OR user2 = $2)
    `;

    const result = await pool.query(updateQuery, [id, username]);
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
  }
});
app.post('/editmessage', async (req, res) => {
  try {
    const { id, text } = req.body;
    console.log(id);
    console.log(text);
    const response = await pool.query(
      'UPDATE messages SET message = $1, edited = $2 WHERE id = $3',
      [text, 'yes', id],
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
  }
});
app.post('/deletecomment', async (req, res) => {
  try {
    const { id } = req.body;
    console.log(id);
    const response = await pool.query('DELETE FROM comments WHERE comment_id=$1', [id]);
    const response1 = await pool.query('UPDATE comments SET reply_id=$2 WHERE reply_id=$1', [
      id,
      -1,
    ]);
    const response3 = await pool.query('DELETE FROM comment_like WHERE comment_id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
  }
});
app.post('/sendemail', async (req, res) => {
  const { email } = req.body;
  const response = await pool.query('SELECT user_name from user1 WHERE email=$1', [email]);
  console.log(response.rows);
  if (response.rows.length == 0) {
    res.json({ message: 'User does not exist' });
  } else {
    try {
      const token = jwt.sign({ id: response.rows[0].user_name }, 'jwt_secret_key', {
        expiresIn: '2m',
      });
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'shahvraj239@gmail.com',
          pass: 'sygu bxdk kiim lezf',
        },
      });
      console.log(email);
      var mailOptions = {
        from: 'shahvraj239@gmail.com',
        to: email,
        subject: 'Reset Password Link',
        text: `http://localhost:3000/auth/resetpassword/${response.rows[0].user_name}/${token}`,
      };
      console.log('not reaching here');
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          return res.send({ Status: 'Success' });
        }
      });
      res.json({ message: 'Email sent' });
    } catch (err) {
      console.log(err.message);
    }
  }
});
app.post('/resetpassword', async (req, res) => {
  try {
    const { username, password } = req.body;
    const response = await pool.query('UPDATE user1 SET password=$1 WHERE user_name=$2', [
      password,
      username,
    ]);
    res.json({ message: 'Ok' });
  } catch (err) {
    res.json({ message: 'Update Failed' });
  }
});
app.post('/sendotp', async (req, res) => {
  try {
    const { username } = req.body;
    const response = await pool.query('SELECT email from user1 WHERE user_name=$1', [username]);
    console.log(response.rows);
    console.log(response.rows[0].email);
    const otp = otpgenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'shahvraj239@gmail.com',
        pass: 'sygu bxdk kiim lezf',
      },
    });
    var mailOptions = {
      from: 'shahvraj239@gmail.com',
      to: response.rows[0].email,
      subject: 'OTP',
      text: `Your OTP is ${otp}`,
    };
    console.log('not reaching here');
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        return res.send({ Status: 'Success' });
      }
    });
    res.json({ message: 'Email sent', otp: otp });
  } catch (err) {
    console.log(err.message);
  }
});
app.put('/fetchprofile', async (req, res) => {
  try {
    const { username } = req.body;
    const response = await pool.query('SELECT * FROM user1 WHERE user_name=$1', [username]);
    console.log('Fileeeeeeeee');
    console.log(typeof response.rows[0].profile);
    fs.readFile(response.rows[0].profile, (err, data) => {
      if (err) {
        console.error('Error reading image file:', err);
        return res.status(500).json({ error: 'Error reading image file' });
      }
      const base64Image = Buffer.from(data).toString('base64');
      response.rows[0].profile = base64Image;
      res.json({ data: response.rows[0] });
    });
  } catch (err) {
    console.log(err.message);
  }
});
app.put('/fetchcommentlikes', async (req, res) => {
  try {
    const { id } = req.body;
    const response = await pool.query('SELECT * FROM comment_like WHERE comment_id=$1', [id]);
    res.json({ data: response.rows });
  } catch (err) {
    console.log(err.message);
  }
});
server.listen(3001, () => {
  console.log('Server has started');
});
