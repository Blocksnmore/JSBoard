/**
 * @author Blocks_n_more
 * @description JSBoard core module
 **/
const fs = require("fs");
const { config } = require("process");
const mongo = require("quickmongo");
const bcrypt = require("bcrypt");

exports.needConfig = async function () {
  if (!fs.existsSync("./modules/core/config.json")) return true;
  return false;
};
exports.config = async function () {
  if (!fs.existsSync("./modules/core/config.json"))
    return {
      isConfigured: false,
      version: "Beta 2.0.0",
      updateMode: true,
    };
  return JSON.parse(fs.readFileSync("./modules/core/config.json", "utf8"));
};

exports.getDb = function () {
  if (!fs.existsSync("./modules/core/config.json")) return null;
  else
    return new mongo.Database(
      JSON.parse(
        fs.readFileSync("./modules/core/config.json", "utf8")
      ).mongologin
    );
};

exports.overridePostUrl = function (path) {
  if (path === "update/configure") return true;
};

exports.overridePost = async function (req, res, path, data) {
  if (path === "update/configure") return updateConfig(req, res, path, data);
};

async function updateConfig(req, res, path, data) {
  let config = {
    isConfigured: true,
    version: "Beta 2.0.0",
    updateMode: false,
    mongourl: req.body.mongologin,
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
  await fs.writeFile("./modules/core/config.json", JSON.stringify(config));
  configuredb(req, res);
}

async function configuredb(req) {
  let config = await fs.readFileSync("./modules/core/config.json", "utf-8");
  let db = await new mongo.Database(config.mongourl);
  db.set("jsboard.userdata.1", {
    username: req.body.mainusername,
    login: {
      email: req.body.mainuseremail,
      password: await bcrypt.hash(req.body.mainuserpassword, 10),
    },
    permissions: {
      admin: true,
    },
  });
}
