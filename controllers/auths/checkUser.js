const Users = require("./../../models/user");
const Clients = require("../../models/client");
const getPageInfo = require('../../models/helpers/pageInfo.helper.js');

//  this module is a middle ware used to verify if a user is logged in
const jwt = require("jsonwebtoken");

module.exports = async function (req, res, next) {
  // get back the token you created on login and verify
  const token = req.cookies.tk;

  // if it doesnt exist
  if (!token) {
    req.userInfo = null;
  }

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);

    // create a userInfo object on the request object when token is valid
    req.userInfo = verified;

    // if for any reason your info no longer exists on the db this makes sure your userInfo object is set to null
    await Users.findOne({ _id: req.userInfo._id })
      .then(async (docs) => {
        if (docs && docs.Disabled) {
          return res
            .status(401)
            .send(
              "Sorry, this account has been temporarily suspended, for more info reach out to our customer support"
            );
        }

        if (docs == null) {
          req.userInfo = null;
        } else {
          req.userInfo.isClient = docs.isClient;
          req.userInfo.isTherapist = docs.isTherapist;
          req.userInfo.isAdmin = docs.isAdmin;

          if (req.userInfo.isTherapist || req.userInfo.isAdmin) {
            await Users.findOne({ Email: docs.Email })
              .then((extradocs) => {
                req.userInfo.Name = extradocs.First_Name != null ? extradocs.First_Name : extradocs.Email;
              })
              .catch((err) => console.error(err.message));
          } else {
            await Clients.findOne({ Email: docs.Email })
              .then((extradocs) => {
                req.userInfo.Name = extradocs.Username != null ? extradocs.Username : extradocs.Email;
              })
              .catch((err) => console.error(err.message));
          }

        }
      })
      .catch((err) => {
        console.error(err.message);
        res.status(500).send("Oops! page edit failed, try again later");
      });
  } catch (error) {
    // if token is expired
    req.userInfo = null;
  }

  // retrieves the information to be displayed on the pages
  req.pages = await getPageInfo(req.url);
  
  // no matter what the route still opens it just tell it you dont have an account so it properly displays your nav
  next();
};
