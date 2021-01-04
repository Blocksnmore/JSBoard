const express = require("express");
const fs = require("fs");
const app = express();
const core = require("./modules/core/index.js");
const http = require("http");
const server = http.createServer(app); // Add support for using socket.io down the line
var modules = new Map();
const db = core.getDb();

// Load modules
fs.readdir("./modules/", async (err, files) => {
  files.forEach(async (f) => {
    let info = require("./modules/" + f + "/module.js").info;
    modules.set(info.name, info);
    info.files.forEach(async (fi) => {
      try {
        require("./modules/" + f + "/" + fi).init(this);
      } catch {}
    });
  });
});

// Source
app.set("view-engine", "ejs");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.get("/*", async (req, res) => {
  let config = core.config();
  let path = req.path.substring(1).split("/");
  let fullpath = req.path.substring(1);
  let err;
  try {
    err = req.body.error;
  } catch {
    err = null;
  }
  let data = {
    config: config,
    needConfig: core.needConfig(),
    updatemode: config.updateMode,
    error: err,
    db: db,
  };
  if (fullpath === "" && !core.needConfig() && config.redirectHome)
    return res.redirect("/home");
  if (
    core.needConfig() &&
    !fullpath.toString().toLowerCase().startsWith("update/") &&
    !path[path.length - 1].includes(".")
  )
    return res.redirect("/update/home");
  let wasoverritten = false;
  modules.forEach((m) => {
    m.files.forEach((mo) => {
      try {
        if (
          require("./modules/" + m.foldername + "/" + mo).overrideGetUrl(
            fullpath
          )
        ) {
          require("./modules/" + m.foldername + "/" + mo).overrideGet(
            req,
            res,
            path,
            data
          );
          wasoverritten = true;
          return;
        }
      } catch {}
    });
  });
  if (wasoverritten) return;
  try {
    if (
      !path[path.length - 1].includes(".") &&
      !path[path.length - 1].toLowerCase().endsWith(".ejs")
    )
      return res.render("./" + fullpath, data);
    if (path[path.length - 1].toLowerCase().endsWith(".ejs"))
      return res.render("./404", data);
    if (fs.existsSync("./views/" + fullpath))
      return res.sendFile(__dirname + "/views/" + fullpath);
    res.render("./404", data);
  } catch {
    res.render("./404", data);
  }
});

app.post("/*", async (req, res) => {
  let config = core.config();
  let path = req.path.substring(1).split("/");
  let fullpath = req.path.substring(1);
  let wasoverritten = false;
  let err;
  try {
    err = req.body.error;
  } catch {
    err = null;
  }
  let data = {
    config: config,
    updatemode: config.updateMode,
    error: err,
    db: db,
  };
  modules.forEach((m) => {
    m.files.forEach((mo) => {
      try {
        if (
          require("./modules/" + m.foldername + "/" + mo).overridePostUrl(
            fullpath
          )
        ) {
          require("./modules/" + m.foldername + "/" + mo).overridePost(
            req,
            res,
            fullpath,
            data
          );
          wasoverritten = true;
          return;
        }
      } catch {}
    });
  });
  if (wasoverritten) return;
});

server.listen(process.env.port | 3000, () => {
  console.log("━━┏┓┏━━━┓┏━━┓━━━━━━━━━━━━━━━┏┓");
  console.log("━━┃┃┃┏━┓┃┃┏┓┃━━━━━━━━━━━━━━━┃┃");
  console.log("━━┃┃┃┗━━┓┃┗┛┗┓┏━━┓┏━━┓━┏━┓┏━┛┃");
  console.log("┏┓┃┃┗━━┓┃┃┏━┓┃┃┏┓┃┗━┓┃━┃┏┛┃┏┓┃");
  console.log("┃┗┛┃┃┗━┛┃┃┗━┛┃┃┗┛┃┃┗┛┗┓┃┃━┃┗┛┃");
  console.log("┗━━┛┗━━━┛┗━━━┛┗━━┛┗━━━┛┗┛━┗━━┛");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Starting JSBoard `MONGO`");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Thanks for supporting my development and using my projects");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
});
