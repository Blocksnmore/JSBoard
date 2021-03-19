// JSBoard module example
// Does not need to be class but is suggested

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
})();
