const express = require('express')
const router = express.Router();
const messageModelDB = require('../Models/messageModel');
const verifyUser = require('../Midlleware/verifyUser');
const userModelDB = require('../Models/userModel')
const chatModelDB =require('../Models/chatModel')

router.get('/getMessages/:chatId', async (req, res) => {
    try {
        const messages = await messageModelDB.find({ chat: req.params.chatId })
          .populate("sender", "name pic email")
          .populate("chat");
        res.json(messages);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


    router.post('/sendMessages', verifyUser, async (req, res) => {
        const { content, chatId } = req.body;
    
        if (!content || !chatId) {
            return res.status(404).send({ message: "Content or chatId is missing" });
        }
    
        var newMessage = {
            sender: req.user._id,
            content: content,
            chat: chatId
        }
    
        try {
            var message = await messageModelDB.create(newMessage);
    
            message = await message.populate("sender", "name pic")
            message = await message.populate("chat")
            message = await userModelDB.populate(message, {
                path: "chat.users",
                select: "name pic email",
            });
    
            await chatModelDB.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
    
            res.json(message);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    });
    
    module.exports = router;

 





module.exports = router;