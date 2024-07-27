const fs = require('fs');
const pool = require('../db');
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

exports.addPost = async (req, res) => {
  try {
    const { username, caption, minutes, hours, day, date, month, year, ampm } = req.body;
    const files = req.files;
    const userExistsQuery = 'SELECT * FROM user1 WHERE user_name = $1';
    const userExistsResult = await pool.query(userExistsQuery, [username]);
    if (userExistsResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    var newFilePaths = [];
    for (const file of files) {
      const originalFilePath = file.path;
      const newFileName = file.originalname;
      const newFilePath = '../newImages/' + newFileName;
      const newFilePath1 = 'newImages/' + newFileName;
      newFilePaths.push(newFilePath1);
      fs.copyFile(originalFilePath, newFilePath1, (copyErr) => {
        if (copyErr) {
          return res.status(500).json({ message: 'Error copying file' });
        }
        fs.unlink(originalFilePath, (unlinkErr) => {
          if (unlinkErr) {
            return res.status(500).json({ message: 'Error deleting original file' });
          }
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
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.fetchPost = async (req, res) => {
  try {
    console.log('Reaching to fetchpost');
    console.log(req.body);
    const { username1 } = req.body;
    console.log(username1);
    const result = await pool.query('SELECT id, caption, pictures FROM post WHERE user_name = $1', [
      username1,
    ]);
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'No posts found for the given username.' });
      return;
    }
    console.log(result);
    console.log('Level1');
    const posts = await Promise.all(
      result.rows.map(async (post) => {
        const pictures = await Promise.all(
          post.pictures.map(
            (picture) =>
              new Promise((resolve, reject) => {
                console.log('Level2');
                console.log(picture);
                fs.readFile(picture, (err, data) => {
                  if (err) {
                    reject(err);
                  } else {
                    const base64Image = Buffer.from(data).toString('base64');
                    resolve(base64Image);
                  }
                });
              }),
          ),
        );
        return { id: post.id, caption: post.caption, pictures };
      }),
    );
    res.status(200).json({ success: true, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.handleLikes = async (req, res) => {
  try {
    const { id, username } = req.body;
    const date = new Date();
    const likeCheckResponse = await pool.query(
      'SELECT * FROM likes WHERE user_name=$1 AND post_id=$2',
      [username, id],
    );
    if (likeCheckResponse.rows.length > 0) {
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
      await pool.query('INSERT INTO likes (user_name, post_id) VALUES ($1, $2)', [username, id]);
      const postOwnerResponse = await pool.query('SELECT user_name FROM post WHERE id=$1', [id]);
      const postOwner = postOwnerResponse.rows[0].user_name;
      await pool.query(
        'INSERT INTO notifications (person1, person2, id, pid, seen1, seen2, minutes, hour, day, date, month, year, ampm) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
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
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.checkLike = async (req, res) => {
  try {
    const { id, username } = req.body;
    const response = await pool.query('SELECT * FROM likes WHERE user_name=$1 AND post_id=$2', [
      username,
      id,
    ]);
    if (response.rows.length > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getLike = async (req, res) => {
  try {
    const { id } = req.body;
    const response = await pool.query('SELECT * FROM likes WHERE post_id=$1', [id]);
    res.json({ success: true, data: response.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.listLike = async (req, res) => {
  try {
    const { id } = req.body;
    const response = await pool.query('SELECT * FROM likes WHERE post_id=$1', [id]);
    res.json({ success: true, data: response.rows.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.editPost = async (req, res) => {
  try {
    const { caption, id, length } = req.body;
    const response = await pool.query('SELECT pictures FROM post WHERE id=$1', [id]);
    const newimagesArray = [...response.rows[0].pictures];
    const folderPath = '../backend/newImages';

    let count1 = 0;
    countFilesInFolder(folderPath).then((count) => {
      count1 = count + 1;
    });
    req.files.forEach((file, index) => {
      const originalFilePath = file.path;
      const newFileName = file.originalname;
      const newFilePath = 'newImages/' + String(count1);
      count1++;
      fs.copyFile(originalFilePath, newFilePath, (copyErr) => {
        if (copyErr) {
          return res.status(500).json({ message: 'Error copying file' });
        }
        fs.unlink(originalFilePath, (unlinkErr) => {
          if (unlinkErr) {
            return res.status(500).json({ message: 'Error deleting original file' });
          }
        });
      });
      if (parseInt(file.filename) >= newimagesArray.length) {
        newimagesArray.push(newFilePath);
      } else {
        newimagesArray[parseInt(file.filename)] = newFilePath;
      }
    });
    newimagesArray.length = length;
    await pool.query('UPDATE post SET caption=$1, pictures=$2 WHERE id=$3', [
      caption,
      newimagesArray,
      id,
    ]);
    res.status(200).json({ success: true, message: 'Post with images added successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.body;
    await pool.query('DELETE FROM post WHERE id=$1', [id]);
    await pool.query('DELETE FROM messages WHERE post_id=$1', [id]);
    await pool.query('DELETE FROM comments WHERE post_id=$1', [id]);
    await pool.query('DELETE FROM likes WHERE post_id=$1', [id]);
    await pool.query(
      'DELETE FROM comment_like WHERE comment_id NOT IN (SELECT comment_id FROM comments)',
    );
    let deletedCount = 1;
    while (deletedCount > 0) {
      const response = await pool.query(
        'DELETE FROM comments WHERE reply_id NOT IN (SELECT comment_id FROM comments)',
      );
      deletedCount = response.rowCount;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
