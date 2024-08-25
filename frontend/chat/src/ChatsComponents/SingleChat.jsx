import React, { useEffect, useState } from 'react';
import { useChatState } from '../Context/ChatProvider';
import { Box, Button, FormControl, HStack, IconButton, Input, Text, useDisclosure, useToast, VStack } from '@chakra-ui/react';
import { ArrowBackIcon, ViewIcon } from '@chakra-ui/icons';
import ProfileModal from '../ModalBox/ProfileModal';
import GroupChatModal from '../ModalBox/GroupChatModal';
import io from "socket.io-client";
import axios from 'axios';

const ENDPOINT = "http://localhost:3000";
var socket, selectedChatCompare;

const SingleChat = ({ setFetchAgain, fetchAgain }) => {
    const { user, setSelectedChat, selectedChat } = useChatState();
    const { isOpen: isProfileModalOpen, onOpen: onOpenProfileModal, onClose: onCloseProfileModal } = useDisclosure();
    const { isOpen: isGroupChatModalOpen, onOpen: onOpenGroupChatModal, onClose: onCloseGroupChatModal } = useDisclosure();
    const [loading, setLoading] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [typing, setIsTyping] = useState(true)
    const toast = useToast();
    
    const isGroupChat = selectedChat && selectedChat.isGroupChat;

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));

        
        return () => {
            socket.disconnect();
        };
    }, [user]);

    useEffect(() => {
        fetchMessages();
        selectedChatCompare = selectedChat;
        if (selectedChat) {
            socket.emit("join chat", selectedChat._id);
        }
    }, [selectedChat]);

    useEffect(() => {
        socket.on("message received", (newMessage) => {
            if (!selectedChatCompare || selectedChatCompare._id !== newMessage.chat._id) {
                // Optionally, handle notifications here
                return;
            }
            // Update messages state
            setMessages([...messages, newMessage]);
        });


    })


    const fetchMessages = async () => {
        if (!selectedChat) return;

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            setLoading(true);
            const response = await axios.get(`http://localhost:3000/getMessages/${selectedChat._id}`, config);
            setMessages(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to load messages", error);
            setLoading(false);
        }
    };

    const sendMessage = async (e) => {
       if(e.key === "Enter" && message) {

        if (!message) {
            toast({
                title: "You can't send an empty message",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }
       
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            setLoading(true);
            const response = await axios.post("http://localhost:3000/sendMessages", 
                { content: message, sender: user, chatId: selectedChat._id }, config);
            socket.emit('new message', { 
                chat: selectedChat._id, // Only send chat ID
                content: message ,
                sender: user._id      // Message content
            });

            setMessages([...messages, response.data]);
            setMessage("");
            setLoading(false);
        } catch (error) {
            console.error("Failed to send message", error);
            setLoading(false);
        }

       }
       
     

       
    };

    const typingHandler = (e) => {
        setMessage(e.target.value)

        if(!socketConnected) {
            return
        }
        if(!typing) {
            setIsTyping(true)
            socket.emit('typing',selectedChat._id)
        }

        let lastTypingTime = new Date().getTime();
        var timerLengt=3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow- lastTypingTime;

            if(timeDiff >= timerLengt && typing) {
                socket.emit('stopTyping',selectedChat._id);
                setIsTyping(false);
            }

        },timerLengt);

    } 

    return (
        <>
            {selectedChat ? (
                <Box
                    display={{ base: "none", md: "flex" }}
                    flexDir="column"
                    alignItems="center"
                    p={3}
                    bg="white"
                    w={{ base: "100%", md: "68%" }}
                    borderRadius="lg"
                    borderWidth="1px"
                >
                    <Text
                        fontSize={{ base: "28px", md: "30px" }}
                        pb={3}
                        px={2}
                        w="100%"
                        fontFamily="Work Sans"
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <IconButton
                            icon={<ArrowBackIcon />}
                            onClick={() => setSelectedChat("")}
                        />
                        <Text>
                            {!isGroupChat ? selectedChat.users[0].name : selectedChat.chatName.toUpperCase()}
                        </Text>
                        <IconButton
                            icon={<ViewIcon />}
                            aria-label="View Profile"
                            onClick={isGroupChat ? onOpenGroupChatModal : onOpenProfileModal}
                        />
                    </Text>

                    {!isGroupChat && (
                        <ProfileModal
                            user={selectedChat.users.find(u => u._id !== user._id)}
                            isOpen={isProfileModalOpen}
                            onClose={onCloseProfileModal}
                        />
                    )}

                    {isGroupChat && (
                        <GroupChatModal
                            isOpen={isGroupChatModalOpen}
                            onClose={onCloseGroupChatModal}
                            users={selectedChat.users}
                        />
                    )}

                    {/* Chat Messages Area */}
                    <VStack
                        w="100%"
                        h="85vh"
                        bg="gray.100"
                        borderRadius="lg"
                        overflowY="scroll"
                        p={3}
                    >
                        {messages.length > 0 ? (
                            messages.map((msg, index) => (
                                <Text key={index}>{msg.content}</Text>
                            ))
                        ) : (
                            <Text>No messages yet</Text>
                        )}
                    </VStack>

                    {/* Message Input */}
                    <HStack w="100%" mt={3}>
                      <FormControl onKeyDown={sendMessage} isRequired>
                      {typing? < div>loading</div> : <></>}
                        <Input
                            placeholder="Type a message..."
                            value={message}
                            onChange={typingHandler}
                        />
                        <Button onClick={sendMessage} colorScheme="blue">
                            Send
                        </Button>
                      </FormControl>
                      
                    </HStack>
                </Box>
            ) : (
                <div className="flex items-center justify-center h-screen text-center">
                    <h2>Select a chat to start messaging</h2>
                </div>
            )}
        </>
    );
};

export default SingleChat;
