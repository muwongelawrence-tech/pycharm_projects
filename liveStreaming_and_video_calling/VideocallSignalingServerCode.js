const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const winston = require("winston");
require("./startup/validation")();
require("./startup/logging")();
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/config")();
require("./startup/prod")(app);

const port = process.env.PORT || 1250;

const server = http.createServer(app);

const io = new Server(server);

// Attaching the  Socket.IO instanse to the Application..
app.set("socketio", io);

// ✅ Move activeStreams here so it persists across connections ..
let activeStreams = new Set();
// Track user to stream mappings
const userToStreamMap = new Map();

// Handling Socket.IO connections ..
io.on("connection", (socket) => {

  // Organizer starts a live stream using their unique organizerId as the room name ..

  socket.on("start_stream", ({ organizerId }) => {
    socket.join(organizerId);
    activeStreams.add(organizerId);
    io.emit("active_streams", Array.from(activeStreams)); // Notify clients ..
    console.log(`Organizer ${organizerId} started a live stream.`)
  });

  // Send the active streams list to the client when requested ..
  socket.on('get_active_streams', () => {
    socket.emit("active_streams", Array.from(activeStreams));
  });

  // Viewers join the stream using organizerId as the room name ..

  socket.on("join_stream", ({ organizerId, viewerId }) => {
    socket.join(organizerId);
    socket.viewerId = viewerId; // Store for disconnect handling .. 
    userToStreamMap.set(viewerId, organizerId); // Track which stream this user is watching ..
    console.log(`User ${viewerId} joined stream hosted by organizer: ${organizerId}`);
    io.to(organizerId).emit("new_viewer", { viewerId });
  });


  // Handle WebRTC signaling messages
  socket.on("offer", ({ organizerId, offer, viewerId }) => {
    console.log(`Forwarding offer from organizer ${organizerId} to viewer ${viewerId}`);
    io.to(organizerId).emit("offer", { offer, organizerId });
  });

  socket.on("answer", ({ organizerId, answer, viewerId }) => {
    console.log(`Forwarding answer from viewer ${viewerId} to organizer ${organizerId}`);
    io.to(organizerId).emit("answer", { viewerId, answer });
  });

  socket.on("ice-candidate", ({ organizerId, candidate, viewerId }) => {
    
    if (organizerId && viewerId) {
      console.log(`Forwarding ICE candidate from ${viewerId} to organizer ${organizerId}`);
      io.to(organizerId).emit("ice-candidate", { viewerId, candidate });
    }
    // Broadcast to the correct peer
    // if (organizerId) {
    //   console.log(`Forwarding ICE candidate to organizer ${organizerId}`);
    //   io.to(organizerId).emit("ice-candidate", { viewerId, candidate });
      
    // }
    // if (viewerId) {
    //   console.log(`Forwarding ICE candidate to viewer ${viewerId}`);
    //   io.to(viewerId).emit("ice-candidate", { organizerId, candidate });
    // }
  });

  socket.on("end_stream", ({ organizerId }) => {
    activeStreams.delete(organizerId);
    // Notify all viewers that the stream has ended ..
    io.to(organizerId).emit("stream_ended", { organizerId });
    // Update all clients with new active streams list
    io.emit("active_streams", Array.from(activeStreams));
    console.log(`Ended live stream for Organizer ${organizerId}`);
  });

  socket.on("leave_stream", ({ organizerId, viewerId }) => {
    if (organizerId && viewerId) {
      socket.leave(organizerId);
      io.to(organizerId).emit("viewer_disconnected", { viewerId });
      userToStreamMap.delete(viewerId);
      console.log(`Viewer ${viewerId} left stream ${organizerId}`);
    }
  });

   // Handle user disconnection ..
   socket.on("disconnect", () => {

    console.log("User disconnected:", socket.id);
    
    // If the disconnected user was an organizer, end their stream
    if (socket.organizerId) {
      activeStreams.delete(socket.organizerId);
      io.to(socket.organizerId).emit("organizer_disconnected", { organizerId: socket.organizerId });
      io.emit("active_streams", Array.from(activeStreams));
      console.log(`Organizer ${socket.organizerId} disconnected, ending stream`);
    }
    
    // If the disconnected user was a viewer, notify the organizer
    if (socket.viewerId) {
      const organizerId = userToStreamMap.get(socket.viewerId);
      if (organizerId) {
        io.to(organizerId).emit("viewer_disconnected", { viewerId: socket.viewerId });
        userToStreamMap.delete(socket.viewerId);
        console.log(`Viewer ${socket.viewerId} disconnected from stream ${organizerId}`);
      }
    }
  });


});

server.listen(port, () => {
  winston.info(`EVENTS SERVER RUNNING ON PORT: ${port}...`);
});

module.exports = server;


