// This file would be used inside of a module
exports.init = async function (core, io) {
  // Use the init to run socket code
  io.on("connection", (socket) => {
    // Ran when a user joins
    console.log("a user connected"); // Debug/info
    socket.on("test", () => {
      // Socket event
      console.log("test received"); // Debug/info
      socket.emit("rec"); // Return a response
    });
    socket.on("disconnect", () => {
      // Ran when user closes connection
      console.log("user disconnected"); // Debug/info
    });
  });
};
