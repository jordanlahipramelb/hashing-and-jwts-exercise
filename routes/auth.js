const jwt = require("jsonwebtoken");
const Router = require("express").Router;
const router = new Router();

const User = require("../models/user");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../expressError");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.authenticate(username, password);

    if (user) {
      if ((await bcrypt.compare(password, user.password)) === true) {
        const token = jwt.sign({ username }, SECRET_KEY);
        User.updateLoginTimestamp(username);
        return res.json({ message: "User Authenticated.", token });
      }
    }

    throw new ExpressError("Invalid user/password", 400);
  } catch (err) {
    return next(err);
  }
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post("/register", async (req, res, next) => {
  try {
    // retrieve username from req.body, then insert it into User.register
    const { username } = await User.register(req.body);
    // CREATE token jwt.sign(payload, secret-key)
    const token = jwt.sign({ username }, SECRET_KEY);
    // update last_login_at of user
    User.updateLoginTimestamp(username);
    // return token that was created
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});

// Sending:
//    {
//    	"username": "jordan",
//    	"password": "jordan",
//    	"first_name": "jordan",
//    	"last_name": "ramelb",
//    	"phone": "7024983325"
//    }
// Returning:
//    {
//      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFyaWVsIiwiaWF0IjoxNjMwOTg5MzQzfQ.ynihlvAFPrvnwEEdb_PPh1B5-VWk5x6wPYuEsedNeck"
//    }

module.exports = router;
