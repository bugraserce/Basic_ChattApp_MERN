const express = require('express')
const router = express.Router();
const chatModelDB = require('../Models/chatModel')
const UserModelDB = require('../Models/userModel')
const verifyUser = require('../Midlleware/verifyUser')
// Example route handler for /accessChat
router.post('/accessChat', verifyUser, async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }

    try {
        // Check if a chat exists between the two users
        let chat = await chatModelDB.findOne({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: req.user._id } } },
                { users: { $elemMatch: { $eq: userId } } },
            ],
        }).populate('users', '-password');

        // If no chat exists, create one
        if (!chat) {
            chat = await chatModelDB.create({
                chatName: 'sender',
                isGroupChat: false, 
                users: [req.user._id, userId],
            });

            chat = await chatModelDB.findOne({ _id: chat._id }).populate('users', '-password');
        }

        res.status(200).json(chat);
    } catch (error) {
        console.error("Error in accessChat:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


router.get('/fetchChat', verifyUser, async (req, res) => {
    try {
        let myChats = await chatModelDB.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 });

        // Populate the `latestMessage.sender` field
        myChats = await UserModelDB.populate(myChats, {
            path: "latestMessage.sender",
            select: "name pic email"
        });

        res.status(200).send(myChats);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



router.post('/createGroup', verifyUser, async (req,res) => {
  

    if(!req.body.users || !req.body.name) {
        return res.status(400).send({message: "Please fill all the fileds"})
    }

    var users = req.body.users;

    if(users.length < 2) {
        return res.status(400).send({message : "more than 2 users are required to from a group chat"});

    }
    users.push(req.user);

    try {
    const groupChat = await chatModelDB.create({
        chatName : req.body.name,
        users: users,
        isGroupChat: true,
        groupAdmin : req.user,

    })
    const fullGroupChat = await chatModelDB.findOne({_id : groupChat._id})
    .populate("users", "-password")
    .populate("groupAdmin", "-password")

    res.status(200).json(fullGroupChat);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" }); 
    }

})


router.put('/renameGroup', verifyUser, async (req,res) => {
  
    const {chatId,chatName} = req.body;

    const updatedChat = await chatModelDB.findById(chatId ,{
        chatName : chatName
    }, {new : true})
    .populate("users","-password")
    .populate("groupAdmin", "-password")

    if(!updatedChat) {
        res.status(404).send({message :"Chat not found"})
    }
    

})

router.put('/addToGroup', verifyUser, async (req, res) => {
    const { chatId, userId } = req.body;
    console.log(`Received chatId: ${chatId}, userId: ${userId}`);

    try {
        const added = await chatModelDB.findByIdAndUpdate(
            chatId,
            { $push: { users: userId } },
            { new: true }
        );

        if (!added) {
            console.log('Chat not found');
            return res.status(404).send({ message: "Chat not found" });
        }

        res.json(added);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server error" });
    }
});


router.put('/removeFromGroup', verifyUser, async (req, res) => {
    const { chatId, userId } = req.body;

    try {
        const updatedChat = await chatModelDB.findByIdAndUpdate(
            chatId,
            {
                $pull: { users: userId },
            },
            { new: true } // return the updated document
        ).populate('users', '-password') // populate user details but exclude passwords
         .populate('groupAdmin', '-password'); // populate group admin details but exclude password

        if (!updatedChat) {
            return res.status(404).send({ message: "Chat not found" });
        }

        res.json(updatedChat);
    } catch (error) {
        console.error("Error removing user from group:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});










module.exports = router;