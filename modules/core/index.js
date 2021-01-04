/**
 * @author Blocks_n_more
 * @description JSBoard core module
 **/
const fs = require("fs");
const mongo = require("quickmongo");
const bcrypt = require("bcrypt");

function needConfig() {
  if (!fs.existsSync("./modules/core/config.json")) return true;
  return false;
}
exports.needConfig = needConfig;
function Config() {
  if (!fs.existsSync("./modules/core/config.json"))
    return {
      isConfigured: false,
      version: "Beta 2.0.0",
      updateMode: true,
    };
  return JSON.parse(fs.readFileSync("./modules/core/config.json", "utf8"));
}
exports.config = Config;

exports.getDb = function () {
  if (!Config().isConfigured) return null;
  else return new mongo.Database(Config().mongourl);
};

exports.overridePostUrl = function (path) {
  if (path === "update/configure") return true;
};

exports.overridePost = async function (req, res, path, data) {
  if (path === "update/configure") return updateConfig(req, res, path, data);
};

async function updateConfig(req, res, path, data) {
  if(!needConfig()) return;
  let config = {
    isConfigured: true,
    version: "Beta 2.0.0",
    updateMode: false,
    mongourl: req.body.mongologin,
    sitename: req.body.sitename,
  };
  try {
    let db = await new mongo.Database(config.mongourl);
    await db.all();
    await db.set("jsboard.version", config.version);
  } catch (e) {
    return res.render("update/configure.ejs", {
      config: config,
      needConfig: true,
      error: e,
    });
  }
  await fs.writeFileSync("./modules/core/config.json", JSON.stringify(config));
  configuredb(req, res);
}

async function configuredb(req, res) {
  let db = await new mongo.Database(req.body.mongologin);
  db.set("jsboard.userdata.1", {
    username: req.body.mainusername,
    login: {
      email: req.body.mainuseremail,
      password: await bcrypt.hash(req.body.mainuserpassword, 10),
    },
    permissions: ["ADMINISTRATOR"],
  });
  console.log("JSBoard setup has been finished! Redirecting user to configured page and shutting down server");
  res.render("update/configured");
  process.exit(1);
}
exports.overrideGetUrl = function (path) {
  if (path === "socket.io/socket.io.js") return true;
  if (path === "socket.io/socket.io.js.map") return true;
};

exports.overrideGet = async function (req, res, path, data) {
  if (path === "socket.io/socket.io.js") return res.sendFile(__dirname+"/assets/socketio.js")
  if (path === "socket.io/socket.io.js.map") return res.sendFile(__dirname+"/assets/socketiomap.json")
};