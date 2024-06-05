const bcrypt = require('bcrypt');
const crypto = require('crypto')

const saltRounds = 10;

// Function to hash a password
async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (err) {
    throw new Error('Error hashing password: ' + err.message);
  }
}

async function comparePassword(plainPassword, hashedPassword) {
    try {
      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      return isMatch;
    } catch (err) {
      throw new Error('Error comparing password: ' + err.message);
    }
  }

const randomImageName = () => crypto.randomBytes(32).toString('hex'); 

module.exports = {
    hashPassword,
    comparePassword,
    randomImageName
}