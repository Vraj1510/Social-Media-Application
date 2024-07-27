const pool = require('../db'); // Assuming your database connection pool setup is in db.js
const fs = require('fs');
const { promisify } = require('util');
const copyFileAsync = promisify(fs.copyFile);
const unlinkAsync = promisify(fs.unlink);

// Update user profile
exports.updateProfile=async(req, res)=>{
  try {
    const { newUsername, username, email, password, caption } = req.body;

    if (!req.file) {
      // Update profile without changing the image
      const response = await pool.query(
        'UPDATE user1 SET password=$1, note=$2, email=$3, user_name=$4 WHERE user_name=$5',
        [password, caption, email, newUsername, username],
      );
      res.json({ message: 'Profile updated' });
      return;
    }

    // Handle profile update with new image
    const originalFilePath = req.file.path;
    const newFileName = req.file.originalname;
    const newFilePath = 'newImages/' + newFileName;

    await copyFileAsync(originalFilePath, newFilePath);

    await unlinkAsync(originalFilePath);

    const response1 = await pool.query('DELETE FROM user1 WHERE user_name=$1', [username]);

    const response = await pool.query('INSERT INTO user1 VALUES($1,$2,$3,$4,$5)', [
      newUsername,
      password,
      caption,
      email,
      newFilePath,
    ]);

    res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error('Error storing image data:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// Fetch user profile image
exports.fetchImage=async(req, res)=>{
  try {
    const { username1 } = req.body;
    const result = await pool.query('SELECT profile FROM user1 WHERE user_name = $1', [username1]);
    const profilePath = result.rows[0].profile;

    fs.readFile(profilePath, (err, data) => {
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
}

// Fetch notifications for a user
exports.fetchNotifications=async(req, res)=>{
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
      .then((updatedNotifications) => {
        const filteredNotifications = updatedNotifications.filter((notification) => {
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

        res.json(filteredNotifications);
      })
      .catch((error) => {
        res.status(500).json({ message: 'Error' });
      });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Mark notifications as seen
exports.seenNotifications=async(req, res)=>{
  const { username } = req.body;

  try {
    await pool.query('UPDATE notifications SET seen1 = $1 WHERE person1 = $2', ['yes', username]);
    await pool.query('UPDATE notifications SET seen2 = $1 WHERE person2 = $2', ['yes', username]);

    res.json({ success: true, message: 'Notifications updated successfully' });
  } catch (error) {
    console.error('Error updating notifications:', error);
    res.status(500).json({ success: false, message: 'Error updating notifications' });
  }
}

// Update user note
exports.updateNote=async(req, res)=>{
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
}

// Fetch all user profiles with base64 encoded images
exports.fetchAllProfiles=async(req, res)=>{
  try {
    const query = `
      SELECT user_name, profile FROM user1;
    `;
    const result = await pool.query(query);
    const allProfiles = result.rows;

    const updatedProfilesPromise = Promise.all(
      allProfiles.map((profile) =>
        readProfile(profile.profile).then((base64Image) => ({
          user_name: profile.user_name,
          profile: base64Image,
        })),
      ),
    );

    updatedProfilesPromise
      .then((updatedProfiles) => {
        res.json(updatedProfiles);
      })
      .catch((error) => {
        res.status(500).json({ message: 'Error' });
      });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Fetch user note by username
exports.fetchNoteByUsername=async(req, res)=>{
  try {
    const { username1 } = req.body;
    const result = await pool.query('SELECT note FROM user1 WHERE user_name ILIKE $1', [username1]);
    res.json({ success: true, data: result.rows[0].note });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// Fetch number of posts by user
exports.fetchPostCount=async(req, res)=>{
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
}

// Fetch post by post ID
exports.fetchPostById=async(req, res)=>{
  try {
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
}

// Fetch all users online
exports.getOnlineUsers=async(req, res)=>{
  try {
    const response = await pool.query(`SELECT * FROM online`);
    res.json({ success: true, data: response.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// Fetch user profile by username
exports.fetchUserProfile=async(req, res)=>{
  try {
    const { username } = req.body;
    const response = await pool.query('SELECT * FROM user1 WHERE user_name=$1', [username]);
    const profilePath = response.rows[0].profile;

    fs.readFile(profilePath, (err, data) => {
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
}

// Helper function to read profile images
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

