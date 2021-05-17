const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require("./utils/messages.js");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users.js");

const app = express();
const port = process.env.PORT || 80;
const server = http.createServer(app);
const publicDirectoryPath = path.join(__dirname, "../public");
const io = socketio(server);

app.use(express.json());
app.use(express.static(publicDirectoryPath));

app.get("/", (req, res) => {
    res.send("this is the root page for the chat app");
});

io.on("connection", (socket) => {
    socket.on('join', ({username, room} = {}, callback) => {
        const { user, error } = addUser({ id: socket.id, username, room });
        if (error) {
            return callback(error);
        }
        socket.join(user.room);
        socket.broadcast.to(user.room).emit('sendNewMessage', generateMessage("admin", `${user.username} has joined`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });
        callback();
    });

    socket.on('messageFromClient', (msgClient,callback) => {
        let user = getUser(socket.id);
        const filter = new Filter();
        if (filter.isProfane(msgClient)) {
            return callback("profanity is not allowed!");
        }
        io.to(user.room).emit('sendNewMessage', generateMessage(user.username,msgClient),);
        callback();
    });
    
    socket.on('sendLocation', (coords, callback) => {
        let user = getUser(socket.id);
        io.to(user.room).emit('sendLocationMessage', generateLocationMessage(user.username,`https://www.google.com/maps/@${coords.latitude},${coords.longitude},13z`));
        callback();
    });

    socket.on('disconnect', () => {
        const removedUser = removeUser(socket.id);
        if (removedUser) {
            io.to(removedUser.room).emit('sendNewMessage', generateMessage("admin",`${removedUser.username} has left!`));
            io.to(removedUser.room).emit('roomData', {
                room: removedUser.room,
                users: getUsersInRoom(removedUser.room)
            });
        }
    });
});

server.listen(port, (req, res) => {
    console.log("connected to the port " + port);
});