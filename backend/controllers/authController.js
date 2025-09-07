const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {  // register user function
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email }); // check if email already exists
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10); // hash password

    const user = await User.create({ // create user
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: 'User registered successfully' }); // return success message
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message }); // return error message
  }
};

const login = async (req, res) => {  // login user function
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }); // check if email exists
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password); // check if password is correct
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { // generate token
      expiresIn: '7d',
    });

    res.json({ token, user: { name: user.name, email: user.email, id: user._id } }); // return token and user
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message }); // return error message
  }
};

module.exports = { register, login }; 
