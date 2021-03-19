const fs = require("fs");

module.exports = new (class {
  /**
   * @param {*} core Instance of JSBoard
   */
  init(core) {}

  /**
   * @param {String} path The path in question for overwriting
   */
  overwriteGet(path) {
    if (path === "demo") return true;
    return false;
  }
  /**
   * @param {String} path The path in question for overwriting
   */
  overwritePost(path) {
    if (path === "demo") return true;
    return false;
  }

  /**
   * @param {String} path The path in question for overwriting
   * @param {Express.Request} req Request
   * @param {Express.Response} res Resonse
   * @param {import("express").NextFunction} next Callback
   * @param {String[JSON]} themes All themes
   */
  overwriteGetMethod(path, req, res, next, themes) {
    if (path === "demo") return res.send("<h2>Hello world!</h2>");
    return false;
  }
  /**
   * @param {String} path The path in question for overwriting
   * @param {Express.Request} req Request
   * @param {Express.Response} res Resonse
   * @param {import("express").NextFunction} next Callback
   * @param {String[JSON]} themes All themes
   */
  overwritePostMethod(path, req, res, next, themes) {
    if (path === "demo") return res.send("<h2>Hello world!</h2>");
    return false;
  }

  /**
   * @param {String} path The path in question for the theme
   */
  customTheme(path) {
    if (path === "demo") return true;
    return false;
  }

  /**
   * @param {String} path The path in question for the theme
   */
  getCustomTheme(path) {
    return { header: ["<h2>Header</h2>"], footer: ["<h2>Footer</h2>"] };
  }

  /**
   * @returns JSON
   */
  getConfig() {
    return fs.existsSync("./modules/core/config.json")
      ? JSON.parse(fs.readFileSync("./modules/core/config.json", "utf8"))
      : {
          version: require("../../package.json").version,
          configured: false,
          secret: null,
          dbengine: null,
          login: {
            url: null,
            email: null,
            password: null,
            db: null,
          },
          siteinfo: {
            sitename: null,
          },
        };
  }
  setConfig(options) {
    fs.writeFileSync(
      "./modules/core/config.json",
      JSON.stringify({
        version: require("../../package.json").version,
        configured: true,
        secret: options.secret || null,
        dbengine: options.dbengine,
        login: {
          url: options.url || null,
          email: options.email || null,
          password: options.password || null,
          db: options.db || null,
        },
        siteinfo: {
          sitename: options.sitename || "JSBoard site",
        },
      })
    );
  }

  getDB(){
    if(this.db) return this.db;
    else if(!this.getConfig().dbengine) return null;
    else {
      let db = null;
      let config = this.getConfig();
      let dbengine = config.dbengine;
      if(dbengine === "mongo") db = new require("quickmongo").Database(this.getConfig().login.url);
      if(dbengine === "mysql") throw new Error("MYSQL is currently not supported!");
      else db = require("quick.db");
      return db;
    }
  }
})();
