/**
 * @author Blocks_n_more
 * @description JSBoard core module
 **/
const fs = require("fs");
const mysql = require("mysql");

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

exports.overridePostUrl = function (path) {
  if (path === "update/configure") return true;
};

exports.overridePost = async function (req, res, path, data) {
  if (path === "update/configure") return updateConfig(req, res, path, data);
};

async function updateConfig(req, res, path, data) {
  let config;
  if (!fs.existsSync("./modules/core/config.json"))
    config = { isConfigured: false, version: "Beta 2.0.0", updateMode: true };
  else
    config = JSON.parse(fs.readFileSync("./modules/core/config.json", "utf8"));
  let connection = mysql.createConnection({
    host: req.body.mysqlhostname,
    user: req.body.mysqlusername,
    port: req.body.mysqlport,
    password: req.body.mysqluserpassword,
    database: req.body.mysqlname,
  });
  try {
    let connecterrored;
    await connection.connect(function (err, misc) {
      let data = {
        config: config,
        needConfig: config.updateMode,
        updatemode: config.updateMode,
        error: err,
      };
      if (err) {
        connecterrored = true;
        res.render("./update/configure.ejs", data);
      }
    });
    await setTimeout(() => {
      if (connecterrored) return;
      console.log("Connected to mysql without any errors!");
      res.redirect("/update/configuring");
    }, 5000);
  } catch (e) {}
}
