exports.overrideGetUrl = async function (path) {
  // Check if the path provided should be intercepeted by the module
  if (path === "custom/module") return true;
  // No need to do `return false` unless you want to know where the code ends
};
exports.overrideGet = async function (req, res, path, data) {
  // Code for overriding the GET method
  res.send("<h2>Overrwritten url path</h2>");
};
exports.overridePostUrl = async function (path) {
  // Check if the path provided should be intercepeted by the module
  if (path === "custom/module") return true;
  // No need to do `return false` unless you want to know where the code ends
};
exports.overridePost = async function (req, res, path, data) {
  // Code for overriding the POST method
  console.log("overrote post method");
};
exports.init = async function (core) {
  // Ran once JSBoard has begain startup
  // core is the main file instance ('this')
};
