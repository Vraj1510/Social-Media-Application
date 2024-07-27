const { Server } = require('socket.io');
const pool = require('../db'); // Ensure correct path if different

// User management functions
const addNewUser = async (username, socketId) => {
  try {
    const existingUser = await getUser({ username });
    if (existingUser) {
      await pool.query('UPDATE online SET socketid = $1 WHERE username = $2', [socketId, username]);
    } else {
      await pool.query('INSERT INTO online (username, socketid) VALUES ($1, $2)', [
        username,
        socketId,
      ]);
      console.log('User added successfully:', username);
    }
  } catch (error) {
    console.error('Error adding user:', error.message);
  }
};

const removeUser = async (socketId) => {
  try {
    await pool.query('DELETE FROM online WHERE socketid=$1', [socketId]);
    console.log('User removed successfully');
  } catch (error) {
    console.error('Error removing user:', error.message);
  }
};

const getUser = async (username) => {
  try {
    const response = await pool.query('SELECT * FROM online WHERE username=$1', [
      username.username,
    ]);
    return response.rows[0];
  } catch (error) {
    console.error('Error fetching user:', error.message);
  }
};

// Notification functions
const handleNewNotif = async (username) => {
  try {
    const response = await pool.query(
      "SELECT * FROM notifications WHERE (person1 = $1 AND seen1='no') OR (person2 = $1 AND seen2='no')",
      [username],
    );
    return response.rows.length;
  } catch (error) {
    console.error('Error fetching notifications:', error.message);
  }
};

// Message functions
const getAllUnseen = async (user) => {
  try {
    const map1 = new Map();
    const response = await pool.query(
      'SELECT user1 as user FROM chats WHERE user2=$1 UNION SELECT user2 as user FROM chats WHERE user1=$1',
      [user],
    );
    const data = response.rows;
    await Promise.all(
      data.map(async (users) => {
        const response1 = await pool.query(
          'SELECT * FROM messages WHERE user1=$1 AND user2=$3 AND seen2=$2',
          [users.user, 'no', user],
        );
        map1.set(users.user, response1.rows.length);
      }),
    );

    return map1;
  } catch (err) {
    console.error(err);
    throw err; // Rethrow the error to handle it at a higher level
  }
};

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    let onlineUsers = [];

    console.log('Connected');

    socket.on('send_message', async (user) => {
      try {
        const maps1 = await getAllUnseen(user);
        const id1 = await getUser(user);
        if (id1 !== undefined) {
          io.to(id1.socketid).emit('recieve_message', [...maps1]);
        }
      } catch (err) {
        console.error(err);
      }
    });

    socket.on('typing', () => {
      io.emit('istyping');
    });

    socket.on('newUser', async (username) => {
      try {
        await addNewUser(username, socket.id);
        const response = await pool.query('SELECT * FROM online');
        onlineUsers = [...response.rows];
        io.emit('user_online', onlineUsers);
      } catch (error) {
        console.error('Error handling new user:', error.message);
      }
    });

    socket.on('notif', async (person) => {
      try {
        const count = await handleNewNotif(person);
        const id1 = await getUser(person);
        if (id1 !== undefined) {
          io.to(id1.socketid).emit('notifCount', count);
        }
      } catch (error) {
        console.error('Error handling new user:', error.message);
      }
    });

    socket.on('send_like', async (arr) => {
      try {
        const response = await pool.query('SELECT user_name FROM post WHERE id=$1', [arr[1]]);
        const user = response.rows[0].user_name;
        const count = await handleNewNotif(user);
        const id1 = await getUser(user);
        const id2 = await getUser(arr[0]);
        if (id1 !== undefined) {
          io.to(id1.socketid).emit('liked');
        }
        if (id2 !== undefined) {
          io.to(id2.socketid).emit('liked');
        }
        if (id1 !== undefined) {
          io.to(id1.socketid).emit('notifCount', count);
        }
      } catch (error) {
        console.error('Error handling like:', error.message);
      }
    });

    socket.on('delete_like', async (user1) => {
      try {
        const id1 = await getUser(user1[0]);
        const count = await handleNewNotif(user1[0]);
        const id2 = await getUser(user1[1]);
        if (id1 !== undefined) {
          io.to(id1.socketid).emit('liked');
        }
        if (id2 !== undefined) {
          io.to(id2.socketid).emit('liked');
        }
        if (id1 !== undefined) {
          io.to(id1.socketid).emit('notifCount', count);
        }
      } catch (error) {
        console.error('Error handling like deletion:', error.message);
      }
    });

    socket.on('send_comment_like', async (arr) => {
      try {
        const response = await pool.query('SELECT username FROM comments WHERE comment_id=$1', [
          arr[1],
        ]);
        const user = response.rows[0].username;
        const count = await handleNewNotif(user);
        const id1 = await getUser(user);
        const id2 = await getUser(arr[0]);
        if (id1 !== undefined) {
          io.to(id1.socketid).emit('comment_liked');
        }
        if (id2 !== undefined) {
          io.to(id2.socketid).emit('comment_liked');
        }
        if (id1 !== undefined) {
          io.to(id1.socketid).emit('notifCount', count);
        }
      } catch (error) {
        console.error('Error handling comment like:', error.message);
      }
    });

    socket.on('delete_comment_like', async (user1) => {
      try {
        const id1 = await getUser(user1[0]);
        const count = await handleNewNotif(user1[0]);
        const id2 = await getUser(user1[1]);
        if (id1 !== undefined) {
          io.to(id1.socketid).emit('comment_liked');
        }
        if (id2 !== undefined) {
          io.to(id2.socketid).emit('comment_liked');
        }
        if (id1 !== undefined) {
          io.to(id1.socketid).emit('notifCount', count);
        }
      } catch (error) {
        console.error('Error handling comment like deletion:', error.message);
      }
    });

    socket.on('send_comment', async (arr) => {
      try {
        const response = await pool.query('SELECT user_name FROM post WHERE id=$1', [arr.id]);
        const user = response.rows[0].user_name;
        const count = await handleNewNotif(user);
        const id1 = await getUser(user);
        const id2 = await getUser(arr.username);
        if (id1 !== undefined) {
          io.to(id1.socketid).emit('notifCount', count);
          io.to(id1.socketid).emit('liked');
          io.to(id1.socketid).emit('commented');
        }
        if (id2 !== undefined) {
          io.to(id2.socketid).emit('liked');
          io.to(id2.socketid).emit('commented');
        }
      } catch (error) {
        console.error('Error handling comment:', error.message);
      }
    });

    socket.on('replycomm', async (arr) => {
      try {
        const id1 = await getUser(arr[0]);
        if (id1 !== undefined) {
          io.to(id1.socketid).emit('commreply', arr[1]);
        }
      } catch (error) {
        console.error('Error handling comment reply:', error.message);
      }
    });

    socket.on('disconnect', async () => {
      try {
        await removeUser(socket.id);
        const response = await pool.query('SELECT * FROM online');
        onlineUsers = [...response.rows];
        io.emit('user_offline', onlineUsers);
      } catch (error) {
        console.error('Error handling disconnect:', error.message);
      }
    });
  });
}

module.exports = {
  initializeSocket,
  addNewUser,
  removeUser,
  getUser,
  handleNewNotif,
  getAllUnseen,
};
