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
   */
  overwriteGetMethod(path, req, res, next) {
    if (path === "demo") return true;
    return false;
  }
  /**
   * @param {String} path The path in question for overwriting
   * @param {Express.Request} req Request
   * @param {Express.Response} res Resonse
   * @param {import("express").NextFunction} next Callback
   */
  overwritePostMethod(path) {
    if (path === "demo") return true;
    return false;
  }
})();
