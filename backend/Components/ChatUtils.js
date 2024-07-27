const fs = require('fs');
const pool = require('../db'); // Assuming you have a database connection pool defined in db.js

// Fetch messages for a specific room
exports.getMessages = async (req, res) => {
  try {
    const { room } = req.body;
    const response = await pool.query('SELECT * FROM messages WHERE room = $1', [room]);
    const messages = response.rows;

    // Update messages with base64 encoded image data if image_path exists
    const updatedMessages = await Promise.all(
      messages.map(async (message) => {
        if (message.image_path) {
          const imageData = await fs.promises.readFile(message.image_path);
          const base64Image = Buffer.from(imageData).toString('base64');
          return { ...message, image_path: base64Image };
        }
        return message;
      }),
    );

    res.json({ success: true, data: updatedMessages });
  } catch (error) {
    console.error('Error fetching messages:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Insert a new message
exports.insertMessage = async (req, res) => {
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
};

// Delete all messages for a given ID
exports.deleteForAll = async (req, res) => {
  try {
    const { id } = req.body;
    const response = await pool.query('DELETE FROM messages WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting messages for all:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Delete messages for a specific user
exports.deleteForMe = async (req, res) => {
  try {
    const { id, username } = req.body;
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
  } catch (error) {
    console.error('Error deleting messages for me:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Edit a message
exports.editMessage = async (req, res) => {
  try {
    const { id, text } = req.body;
    const response = await pool.query(
      'UPDATE messages SET message = $1, edited = $2 WHERE id = $3',
      [text, 'yes', id],
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error editing message:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Set messages as seen
exports.seeMessages = async (req, res) => {
  try {
    const { user1, user2 } = req.body;
    const response = await pool.query('UPDATE messages SET seen2=$1 WHERE user1=$2 AND user2=$3', [
      'yes',
      user1,
      user2,
    ]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as seen:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Find friends
exports.findFriend = async (req, res) => {
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

    const userNames = users.map((user) => user.user);
    const userNames1 = users1.map((user) => user.user);

    // Subtract common elements
    const subtractedUsers = users.filter((user) => !userNames1.includes(user.user));
    const finalusers = subtractedUsers.map((user1) => ({ user: user1.user }));

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
      })
      .catch((error) => {
        console.error('Error finding friends:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error.' });
      });
  } catch (error) {
    console.error('Error finding friends:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Fetch unseen messages
exports.fetchUnseen = async (req, res) => {
  try {
    const { username } = req.body;
    const map1 = new Map();
    const response = await pool.query(
      'SELECT user1 as user FROM chats  WHERE user2=$1 UNION SELECT user2 as user FROM chats WHERE user1=$1',
      [username],
    );
    const data = response.rows;

    await Promise.all(
      data.map(async (users) => {
        const response1 = await pool.query(
          'SELECT * FROM messages WHERE user1=$1 AND user2=$3 AND seen2=$2',
          [users.user, 'no', username],
        );
        map1.set(users.user, response1.rows.length);
      }),
    );

    res.json({ success: true, data: [...map1] });
  } catch (error) {
    console.error('Error fetching unseen messages:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Add a new chat
exports.addChat = async (req, res) => {
  try {
    const { user1, user2 } = req.body;
    const response = await pool.query(
      'INSERT INTO chats (user1, user2) VALUES ($1, $2) RETURNING id',
      [user1, user2],
    );

    res.json({ success: true, id: response.rows[0].id });
  } catch (error) {
    console.error('Error adding chat:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Fetch chats for a specific user
exports.fetchChats = async (req, res) => {
  try {
    const { username } = req.body;
    const response = await pool.query(
      'SELECT id, user2 as user FROM chats WHERE user1=$1 UNION SELECT id, user1 as user FROM chats WHERE user2=$1',
      [username],
    );
    const users = response.rows;

    const usersWithProfileImages = await Promise.all(
      users.map(async (row1) => {
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
      })
      .catch((error) => {
        console.error('Error fetching chats:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error.' });
      });
  } catch (error) {
    console.error('Error fetching chats:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Delete a chat between two users
exports.deleteChat = async (req, res) => {
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
  } catch (error) {
    console.error('Error deleting chat:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
