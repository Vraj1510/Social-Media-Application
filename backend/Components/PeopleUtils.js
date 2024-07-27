const pool = require('../db'); // Assuming your database pool configuration
const fs=require('fs');
exports.unfollow = async (req, res) => {
  try {
    console.log('Unfollow');
    console.log(req.body);
    const { user1, user2 } = req.body;
    const query = `DELETE FROM following WHERE person1=$1 AND person2=$2`;
    await pool.query(query, [user1, user2]);
    const query1 = `DELETE FROM notifications WHERE person1=$1 AND person2=$2 AND id=$3`;
    await pool.query(query1, [user1, user2, 'following']);
    res.json('yes');
  } catch (err) {
    console.log(err.message);
  }
};

exports.sentRequest = async (req, res) => {
  try {
    var date = new Date();
    const { person1, person2, id, pid } = req.body;
    await pool.query('INSERT INTO requestsent (person1, person2) VALUES ($1, $2)', [
      person1,
      person2,
    ]);
    await pool.query(
      'INSERT INTO notifications (person1, person2, id, pid, seen1, seen2, minutes, hour, day, date, month, year, ampm) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
      [
        person1,
        person2,
        id,
        pid,
        'no',
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
    res.json('YES');
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteRequest = async (req, res) => {
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
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.checkFollower = async (req, res) => {
  try {
    const { user1, user2 } = req.body;
    const response = await pool.query('SELECT * FROM following WHERE person1=$1 AND person2=$2', [
      user1,
      user2,
    ]);
    res.json({ success: true, data: response.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.removeFollower = async (req, res) => {
  try {
    console.log('Removing as a follower');
    console.log(req.body);
    const { user1, user2 } = req.body;
    const response = await pool.query('DELETE FROM following WHERE person1=$1 AND person2=$2', [
      user1,
      user2,
    ]);
    const allTodos = response.rows;
    const query1 = 'DELETE FROM notifications WHERE person1=$1 AND person2=$2 AND id=$3';
    await pool.query(query1, [user1, user2, 'following']);
    res.json({ success: true, data: allTodos.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteRequest1 = async (req, res) => {
  try {
    const { user1, user2 } = req.body;
    await pool.query('DELETE FROM requestsent WHERE person1 = $1 AND person2 = $2', [user1, user2]);
    res.status(200).json({ message: 'Request deleted successfully' });
  } catch (err) {
    console.error('Error deleting request:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.addFollowing = async (req, res) => {
  try {
    const { user1, user2 } = req.body;
    const newTodo = await pool.query('INSERT INTO following VALUES($1, $2) RETURNING *', [
      user1,
      user2,
    ]);
    res.status(200).json({ message: 'Request deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateNotification = async (req, res) => {
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
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.follow = async (req, res) => {
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
};

exports.requestSent = async (req, res) => {
  try {
    console.log("Reqsent");
    console.log(req.body);
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
};

exports.followers = async (req, res) => {
  try {
    const { person } = req.body;
    const allTodos = await pool.query('SELECT * FROM requestsent WHERE person2=$1', [person]);
    res.json({ success: true, data: allTodos.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.following = async (req, res) => {
  try {
    const { person } = req.body;
    const allTodos = await pool.query('SELECT * FROM requestsent WHERE person1=$1', [person]);
    res.json({ success: true, data: allTodos.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.followersOfUser = async (req, res) => {
  const { username1 } = req.body;
  try {
    const query = `SELECT following.person2, user1.profile
                       FROM following
                       JOIN user1 ON following.person2 = user1.user_name
                       WHERE following.person1 = $1`;
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
      })
      .catch((err) => console.error('Error getting file:', err));
  } catch (err) {
    console.error('Error getting follower of user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getUserFollowing = async (req, res) => {
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

    const updatedTodosPromise = Promise.all(
      allTodos.map(
        (todo) =>
          new Promise((resolve, reject) => {
            fs.readFile(todo.profile, (err, data) => {
              if (err) {
                console.error('Error reading image file:', err);
                reject(err);
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
        res.json(updatedTodos);
      })
      .catch((error) => {
        res.status(500).json({ error: 'Internal Server Error' });
      });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Fetch mutual followers between two users
exports.getMutualFollowers = async (req, res) => {
  const { user1, user2 } = req.body;
  try {
    const query = `
      SELECT t1.person2, u1.profile
      FROM following t1
      JOIN user1 u1 ON t1.person2 = u1.user_name
      WHERE t1.person1 = $1
      INTERSECT
      SELECT t2.person2, u2.profile
      FROM following t2
      JOIN user1 u2 ON t2.person2 = u2.user_name
      WHERE t2.person1 = $2;
    `;
    const result = await pool.query(query, [user1, user2]);
    const allTodos = result.rows.map((todo) => ({
      person2: todo.person2,
      profile: todo.profile ? todo.profile.toString('base64') : null,
    }));
    res.json(allTodos);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Fetch users that a given user is not following
exports.getUsersNotFollowing = async (req, res) => {
  try {
    const { username } = req.body;
    const response = await pool.query('SELECT person2 as user FROM following WHERE person1=$1', [
      username,
    ]);
    const usersFollowing = response.rows.map((row) => row.user);

    const response1 = await pool.query('SELECT user_name as user FROM user1 WHERE user_name!=$1', [
      username,
    ]);
    const users = response1.rows.filter((row) => !usersFollowing.includes(row.user));

    const usersWithProfileImages = await Promise.all(
      users.map(async (user) => {
        const profileImageResponse = await pool.query(
          'SELECT profile FROM user1 WHERE user_name = $1',
          [user.user],
        );
        const profileImageBuffer = profileImageResponse.rows[0].profile;
        return {
          person1: user.user,
          profile: profileImageBuffer ? profileImageBuffer.toString('base64') : null,
        };
      }),
    );

    res.json(usersWithProfileImages);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Fetch requests sent by a user
exports.getRequestsSent = async (req, res) => {
  try {
    const { username } = req.body;
    const response = await pool.query('SELECT * FROM requestsent WHERE person1=$1', [username]);
    res.json({ success: true, data: response.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
