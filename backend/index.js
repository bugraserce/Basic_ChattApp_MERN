const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./Routers/routes');
const chatRoutes = require('./Routers/chatRoutes');
const messageRoutes = require('./Routers/messagesRoutes');
const connectDB = require('./DataBaseConnection/DataBaseConnection');
const chatModelDB = require('./Models/chatModel')

dotenv.config();

app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));
app.use(express.json());

// Routes
app.use(userRoutes);
app.use(chatRoutes);
app.use(messageRoutes);

// Connect to the database
connectDB();

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: ["http://localhost:3000", "http://localhost:5173"],
        methods: ["GET", "POST"],
        credentials: true,
    },
});

io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on("setup", (userData) => {
        socket.join(userData._id);
        console.log("connected")
         console.log("User joined user ID: ", userData._id);
        //socket.emit("user has connected successfully");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User joined ROOM: " + room);
    });

    socket.on("new message", async (newMessage) => {
        console.log("Received new message:", newMessage);

        const { chat, content } = newMessage;

        // Fetch the full chat object from the database
        const chatDetails = await chatModelDB.findById(chat).populate('users');
        
        if (!chatDetails || !chatDetails.users) {
            return console.log('Chat or chat.users not defined');
        }

        chatDetails.users.forEach(user => {
            if (user._id === newMessage.sender._id) {
                return;
            } else {
                socket.in(user._id).emit("message received", newMessage);
            }
        });
    });

 socket.on("typing" , (room) => socket.in(room).emit("typing"));
 socket.on("stop typing" , (room) => socket.in(room).emit("stop typing"))


});

