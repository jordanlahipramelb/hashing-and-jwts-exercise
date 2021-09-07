const Router = require("express").Router;
const router = new Router();
const User = require("../models/user");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get("/", ensureLoggedIn, async (req, res, next) => {
  try {
    const users = await User.all();

    return res.json({ users: users });
  } catch (err) {
    return next(err);
  }
});

// Send JWT in body
//      {
//      	"_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvcmRhbjIiLCJpYXQiOjE2MzEwMzc3NzF9.VPtr9YG_bvZRw0T1kaLBkWihUSTVxzLeKyFenuP9LF4"
//      }

/** GET /:username - get detail of users.
 *
 *  Only logged in user can see their details.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get("/:username", ensureCorrectUser, async (req, res, next) => {
  try {
    const user = await User.get(req.params.username);

    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

// Send JWT in body
//      {
//      	"_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvcmRhbjIiLCJpYXQiOjE2MzEwMzc3NzF9.VPtr9YG_bvZRw0T1kaLBkWihUSTVxzLeKyFenuP9LF4"
//      }

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get("/:username/to", ensureCorrectUser, async (req, res, next) => {
  try {
    const messages = await User.messagesTo(req.params.username);
    return res.json({ messages });
  } catch (err) {
    return next(err);
  }
});

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get("/:username/from", ensureCorrectUser, async (req, res, next) => {
  try {
    const messages = await User.messagesFrom(req.params.username);
    return res.json({ messages });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
