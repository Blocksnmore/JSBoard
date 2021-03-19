const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const modules = [];
const fs = require("fs");
const core = require("./modules/core/index.js");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

global.server = server;
global.modules = modules;
global.app = app;
global.io = io;

app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: false }));
app.use(
  require("express-session")({
    resave: false,
    saveUninitialized: false,
    secret:
      core.getConfig().secret || Math.random() * Math.random() + Math.random(),
  })
);

server.listen(process.env.PORT || 3000, () => {
  console.log("━━┏┓┏━━━┓┏━━┓━━━━━━━━━━━━━━━┏┓");
  console.log("━━┃┃┃┏━┓┃┃┏┓┃━━━━━━━━━━━━━━━┃┃");
  console.log("━━┃┃┃┗━━┓┃┗┛┗┓┏━━┓┏━━┓━┏━┓┏━┛┃");
  console.log("┏┓┃┃┗━━┓┃┃┏━┓┃┃┏┓┃┗━┓┃━┃┏┛┃┏┓┃");
  console.log("┃┗┛┃┃┗━┛┃┃┗━┛┃┃┗┛┃┃┗┛┗┓┃┃━┃┗┛┃");
  console.log("┗━━┛┗━━━┛┗━━━┛┗━━┛┗━━━┛┗┛━┗━━┛");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Starting JSBoard");
  console.log("Thanks for supporting my development and using my projects");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Loading Modules");
  if (!fs.existsSync("./modules/")) {
    console.log("Modules directory not found! Creating.");
    fs.mkdirSync("./modules/");
  }
  fs.readdir("./modules/", async (err, files) => {
    let modulefolders = [];
    let moduleslist = [];
    files.forEach((f) => {
      fs.stat("./modules/" + f, (err, stats) => {
        if (stats.isDirectory()) modulefolders.push(f);
      });
    });
    modulefolders.forEach((f) => {
      moduleslist.push(
        JSON.parse(fs.readFileSync("./modules/" + f + "/module.json")).name
      );
    });
    modulefolders.forEach((f) => {
      let json = JSON.parse(fs.readFileSync("./modules/" + f + "/module.json"));
      json.depends.forEach((d) => {
        if (!moduleslist.includes(d))
          throw new Error(
            "Module " +
              json.name +
              " depends on the module " +
              d +
              " and it was not found!"
          );
      });
      json.files.forEach((file) => {
        try {
          require("./modules/" + f + "/" + file).init(this);
        } catch {
          console.log(
            "Failed to load init for " +
              json.name +
              "/" +
              file +
              ". This file likely does not have any init code"
          );
        }
      });
      console.log("Loaded module " + json.name);
      modules.push({ modulepath: f, data: json });
    });
  });
  console.log("Loaded " + modules.length + " modules.");
});

// Main SRC
app.get("*", async (req, res, next) => {
  let overwritten = false;
  modules.forEach(async (m) => {
    m.files.forEach((f) => {
      if (overwritten) return;
      try {
        if (
          require("./modules/" + m + "/" + f).overwriteGet(
            req.path.substring(1)
          )
        ) {
          require("./modules/" + m + "/" + f).overwriteGetMethod(
            req.path.substring(1),
            req,
            res,
            next
          );
          overwritten = true;
        }
      } catch {}
    });
  });
  if (req.path.substring(1).toLowerCase().startsWith("hidden"))
    return res.redirect("/error#404");
  if (overwritten) return;
  let themes = [];
  modules.forEach(async (m) => {
    m.files.forEach(async (f) => {
      try {
        if (
          require("./modules/" + m + "/" + f).customTheme(req.path.substring(1))
        ) {
          let theme = await require("./modules/" + m + "/" + f).getCustomTheme(
            req.path.substring(1)
          );
          if (theme.header)
            theme.header.forEach((f) => {
              themes.push({ type: "header", src: f });
            });
          if (theme.footer)
            theme.footer.forEach((f) => {
              themes.push({ type: "footer", src: f });
            });
        }
      } catch {}
      if (overwritten) return;
    });
  });
  modules.forEach(async (m) => {
    m.files.forEach(async (f) => {
      if (overwritten) return;
      try {
        if (
          require("./modules/" + m + "/" + f).overwriteGet(
            req.path.substring(1)
          )
        ) {
          require("./modules/" + m + "/" + f).overwriteGetMethod(
            req.path.substring(1),
            req,
            res,
            next,
            themes
          );
          overwritten = true;
        }
      } catch {}
    });
  });
  if (overwritten) return;
  if (!fs.existsSync("./views" + (req.path === "/" ? "/index" : req.path).split("#")[0] + ".ejs"))
    return res.redirect("/error#404");
  res.render("."+(req.path === "/" ? "/index" : req.path).split("#")[0], {
    url: req.path === "/" ? "/index" : req.path,
    themes: themes,
    db: core.getDB(),
    req: req,
    res: res,
  });
});

app.post("*", async (req, res, next) => {
  let overwritten = false;
  modules.forEach(async (m) => {
    m.files.forEach((f) => {
      if (overwritten) return;
      try {
        if (
          require("./modules/" + m + "/" + f).overwritePost(
            req.path.substring(1)
          )
        ) {
          require("./modules/" + m + "/" + f).overwritePostMethod(
            req.path.substring(1),
            req,
            res,
            next
          );
          overwritten = true;
        }
      } catch {}
    });
  });
  if (overwritten) return;
  if (req.path.split("#")[0].substring(1).startsWith("hidden"))
    return res.redirect("error#404");
});

app.use(function (req, res, next) {
  var err = req.session.error;
  var msg = req.session.success;
  delete req.session.error;
  delete req.session.success;
  res.locals.message = "";
  if (err) res.locals.message = '<p class="msg error">' + err + "</p>";
  if (msg) res.locals.message = '<p class="msg success">' + msg + "</p>";
  next();
});
