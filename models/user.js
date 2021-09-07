/** User class for message.ly */
const db = require("../db");
const ExpressError = require("../expressError");
const bcrypt = require("bcrypt");

const { BCRYPT_WORK_FACTOR } = require("../config");

/** User of the site. */

class User {
  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    // error handle if missing these
    if (!username || !password || !first_name || !last_name || !phone) {
      throw new ExpressError("Please enter required data.", 400);
    }
    // 1. hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    // 2. save to db
    const result = await db.query(
      `INSERT INTO users (
          username, 
          password, 
          first_name, 
          last_name, 
          phone, 
          join_at, 
          last_login_at) 
        VALUES ($1,$2,$3,$4,$5, current_timestamp, current_timestamp) 
        RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]
    );

    return result.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    if (!username || !password) {
      throw new ExpressError("Username and password required.", 400);
    }

    const result = await db.query(
      `SELECT username, password 
        FROM users
        WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];
    return user;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    // perform update with db query
    const result = await db.query(
      `UPDATE users
        SET last_login_at = current_timestamp
        WHERE username = $1 
        RETURNING username`,
      [username]
    );

    // throw error if username not found
    if (!result.rows[0]) {
      throw new ExpressError(`Username ${username} not found.`, 404);
    }
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {}

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {}

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {}

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {}
}

module.exports = User;
