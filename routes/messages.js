const Router = require("express").Router;
const router = new Router();
const Message = require("../models/message");
const { ensureLoggedIn } = require("../middleware/auth");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    //username already logged in
    const username = req.user.username;
    const message = await Message.get(req.params.id);

    //   if the currently-logged-in users is neither the to or from user.
    if (
      message.to_user.username !== username &&
      message.from_user.username !== username
    ) {
      throw new ExpressError("Unauthorized to read the message", 401);
    }

    return res.json({ message: message });
  } catch (err) {
    return next(err);
  }
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", ensureLoggedIn, async (req, res, next) => {
  try {
    const message = await Message.create({
      from_username: req.user.username, //username logged in already
      to_username: req.body.to_username,
      body: req.body.body,
    });

    return res.json({ message: message });
  } catch (err) {
    return next(err);
  }
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post("/:id/read", ensureLoggedIn, async (req, res, next) => {
  try {
    //username already logged in
    const username = req.user.username;
    // get message
    const message = await Message.get(req.params.id);

    // if the intended recipient is not the logged in user
    if (message.to_user !== username) {
      throw new ExpressError("Unauthorized to set this message to read.", 401);
    }
    const messageRead = await Message.markRead(req.params.id);

    return res.json({ messageRead });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
