const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const otpgenerator = require('otp-generator');
const pool = require('../db'); // assuming you have a db.js file for database connection
const session = require('express-session');

exports.verifyUser = (req, res, next) => {
  console.log('Reaching in this line');
  try {
    const accessToken = req.cookies.accessToken;
    console.log('Access Token:', accessToken);
    if (!accessToken) {
      console.log('No access token, trying to renew...');
      if (!renewToken(req, res)) {
        console.log('Token renewal failed');
        return res.json({ valid: false });
      }
    } else {
      jwt.verify(accessToken, 'jwt-access-token-secret-key', (err, decoded) => {
        if (err) {
          console.log('JWT Verification Error:', err);
          return res.json({ valid: false });
        } else {
          console.log('Token verified successfully, username:', decoded.username);
          req.username = decoded.username;
          res.locals.userData = { valid: true, username: decoded.username };
          next();
        }
      });
    }
  } catch (err) {
    console.log('Error in verifyUser:', err.message);
    return res.status(500).json({ valid: false, message: 'Internal Server Error' });
  }
};

exports.renewToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return false;
  } else {
    jwt.verify(refreshToken, 'jwt-refresh-token-secret-key', (err, decoded) => {
      if (err) {
        return false;
      } else {
        const accessToken = jwt.sign(
          { username: decoded.username },
          'jwt-access-token-secret-key',
          { expiresIn: '200m' },
        );
        res.cookie('accessToken', accessToken, { maxAge: 60000 });
        res.locals.userData = { valid: true, username: decoded.username };
        return true;
      }
    });
  }
};

exports.handleInsert = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    // const password1 = await bcrypt.hash(password, salt);
    const fs = require('fs');
    const filePath = '/Users/vrajshah1510/Documents/SOCIALMEDIAAPP/frontend/src/Images/profile.png'; // Replace with the actual file path
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath);
    console.log(username, password, email, filePath);
      const newTodo = await pool.query(
        'INSERT INTO "user1" (user_name, password, email, profile) VALUES($1, $2, $3, $4) RETURNING *',
        [username, password, email, filePath],
      );
      // req.session.user = { username  };
      res.json('YES');
    } else {
      res.status(404).json('File not found');
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json('Internal Server Error');
  }
};

exports.handleLogin = async (req, res) => {
  console.log('Reaching here in login');
  try {
    // console.log(req.session);
    const allUsers = await pool.query('SELECT * FROM "user1"');
    const usersData = allUsers.rows;
    const { username, password } = req.body;
    // const password = await bcrypt.hash(plainTextPassword, salt);

    const isValidLogin = usersData.some(
      (user) => user.user_name === username && password === user.password,
    );
    console.log(isValidLogin);
    if (isValidLogin) {
      return res.json({ ok: true, message: 'Login successful' });
    } else {
      return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.registerJwtToken = async (req, res) => {
  try {
    const { username } = req.body;
    const accessToken = jwt.sign({ username }, 'jwt-access-token-secret-key', {
      expiresIn: '200m',
    });
    const refreshToken = jwt.sign({ username }, 'jwt-refresh-token-secret-key', {
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
  } catch (err) {
    console.log(err.message);
  }
};

exports.checkUser = async (req, res) => {
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
};

exports.sendEmail = async (req, res) => {
  const { email } = req.body;
  const response = await pool.query('SELECT user_name FROM user1 WHERE email=$1', [email]);
  if (response.rows.length === 0) {
    res.json({ message: 'User does not exist' });
  } else {
    try {
      const token = jwt.sign({ id: response.rows[0].user_name }, 'jwt_secret_key', {
        expiresIn: '2m',
      });
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'shahvraj239@gmail.com',
          pass: 'sygu bxdk kiim lezf', // Consider using environment variables for sensitive data
        },
      });

      const localNetworkIp = '0.0.0.0'; // Replace with your actual local network IP address
      const mailOptions = {
        from: 'shahvraj239@gmail.com',
        to: email,
        subject: 'Reset Password Link',
        text: `http://${localNetworkIp}:3000/auth/resetpassword/${response.rows[0].user_name}/${token}`,
      };
      console.log(mailOptions.text);
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          return res.send({ Status: 'Success' });
        }
      });

      console.log('Reaching here');
      res.json({ message: 'Email sent' });
    } catch (err) {
      console.log(err.message);
    }
  }
};

exports.resetPassword = async (req, res) => {
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
};

exports.sendOtp = async (req, res) => {
  try {
    const { username } = req.body;
    const response = await pool.query('SELECT email FROM user1 WHERE user_name=$1', [username]);
    const email = response.rows[0].email;
    const otp = otpgenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'shahvraj239@gmail.com',
        pass: 'sygu bxdk kiim lezf',
      },
    });
    const mailOptions = {
      from: 'shahvraj239@gmail.com',
      to: email,
      subject: 'OTP',
      text: `Your OTP is ${otp}`,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        return res.send({ Status: 'Success' });
      }
    });
    res.json({ message: 'Email sent', otp });
  } catch (err) {
    console.log(err.message);
  }
};
