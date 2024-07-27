// commentFunctions.js

const pool = require('../db'); // Assuming you have a database connection pool defined in db.js

exports.checkCommentLike = async (req, res) => {
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
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.handleCommentLikes = async (req, res) => {
  try {
    const { id, username } = req.body;
    var date = new Date();
    const commentCheckResponse = await pool.query(
      'SELECT * FROM comment_like WHERE username=$1 AND comment_id=$2',
      [username, id],
    );
    const allComments = commentCheckResponse.rows;

    if (allComments.length > 0) {
      await pool.query('DELETE FROM comment_like WHERE username=$1 AND comment_id=$2', [
        username,
        id,
      ]);
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
      const response = await pool.query(
        'INSERT INTO comment_like (username,comment_id) VALUES ($1,$2) RETURNING id',
        [username, id],
      );

      const postOwnerResponse = await pool.query(
        'SELECT username FROM comments WHERE comment_id=$1',
        [id],
      );
      const postOwner = postOwnerResponse.rows[0].username;

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

      res.json({ success: true, idx: response.rows[0].id });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.fetchCommentLikes = async (req, res) => {
  try {
    const { id } = req.body;
    const response = await pool.query('SELECT * FROM comment_like WHERE comment_id=$1', [id]);
    res.json({ data: response.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.body;
    await pool.query('DELETE FROM comments WHERE comment_id=$1', [id]);
    await pool.query('UPDATE comments SET reply_id=$2 WHERE reply_id=$1', [id, -1]);
    await pool.query('DELETE FROM comment_like WHERE comment_id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.fetchCommentById = async (req, res) => {
  try {
    const { id } = req.body;
    const response = await pool.query('SELECT * FROM comments WHERE comment_id=$1', [id]);
    res.json({ success: true, data: response.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.fetchCommentsByPostId = async (req, res) => {
  try {
    const { id } = req.body;
    const response = await pool.query('SELECT * FROM comments WHERE post_id=$1', [id]);
    res.json({ success: true, data: response.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.insertComment = async (req, res) => {
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
    res.status(500).json({ success: false, error: err.message });
  }
};

