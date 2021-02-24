const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const modules = [];
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
server.listen(process.env.PORT || 3000, () => {
  console.log("━━┏┓┏━━━┓┏━━┓━━━━━━━━━━━━━━━┏┓");
  console.log("━━┃┃┃┏━┓┃┃┏┓┃━━━━━━━━━━━━━━━┃┃");
  console.log("━━┃┃┃┗━━┓┃┗┛┗┓┏━━┓┏━━┓━┏━┓┏━┛┃");
  console.log("┏┓┃┃┗━━┓┃┃┏━┓┃┃┏┓┃┗━┓┃━┃┏┛┃┏┓┃");
  console.log("┃┗┛┃┃┗━┛┃┃┗━┛┃┃┗┛┃┃┗┛┗┓┃┃━┃┗┛┃");
  console.log("┗━━┛┗━━━┛┗━━━┛┗━━┛┗━━━┛┗┛━┗━━┛");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Starting JSBoard `MONGO`");
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
  if (overwritten) return;
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
});

app.use(function (req, res, next) {
  res.status(404).redirect("/errors/404");
  res.status(403).redirect("/errors/403");
  res.status(304).redirect("/errors/304");
  res.status(303).redirect("/errors/303");
});
