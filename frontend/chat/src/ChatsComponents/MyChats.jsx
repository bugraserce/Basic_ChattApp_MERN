import React, { useEffect, useState } from 'react';
import { useChatState } from '../Context/ChatProvider';
import { Box, Button, Stack, Text, useToast } from '@chakra-ui/react';
import axios from 'axios';
import { AddIcon } from '@chakra-ui/icons';
import ChatLoading from './ChatLoading';
import GroupChatModal from './GroupChatModal';

const MyChats = ({ fetchAgain, setFetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const { user, chats, setChats, selectedChat, setSelectedChat } = useChatState();
  const toast = useToast();

  const getSender = (loggedUser, users) => {
    if (!loggedUser || !users) return 'Unknown User';
    return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
  };

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    setLoggedUser(userInfo);
    if (userInfo) {
      fetchChats(userInfo);
    }
  }, [fetchAgain]);

  const fetchChats = async (userInfo) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`, // Use userInfo from localStorage
        },
      };
      const response = await axios.get('http://localhost:3000/fetchChat', config);
      setChats(response.data);
    } catch (error) {
      toast({
        title: 'Error occurred when fetching the chat',
        description: error.response?.data?.message || 'Failed',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  return (
    <div
    className={`${
      selectedChat ?  'md:flex' : 'flex'
    } flex-col items-center p-3 bg-white w-full md:w-1/3 rounded-lg border border-gray-200 min-h-screen`}
  >
      <div className="flex flex-col w-full justify-between items-center pb-3 px-3 text-2xl md:text-[30px] font-sans">
        My Chats
        <GroupChatModal>
          <Button
            d="flex"
            fontSize={{ base: '17px', md: '10px', lg: '17px' }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </div>
      <div className="flex flex-col p-3 bg-gray-100 w-full h-full rounded-lg overflow-hidden">
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map((chat) => (
              <div
                onClick={() => setSelectedChat(chat)}
                className={`cursor-pointer px-3 py-2 rounded-lg ${
                  selectedChat === chat ? 'bg-teal-500 text-white' : 'bg-gray-200 text-black'
                }`}
                key={chat._id}
              >
                <Text>
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </Text>
                {chat.latestMessage && (
                  <Text fontSize="xs">
                    <b>{chat.latestMessage.sender?.name} : </b>
                    {chat.latestMessage.content.length > 50
                      ? chat.latestMessage.content.substring(0, 51) + '...'
                      : chat.latestMessage.content}
                  </Text>
                )}
              </div>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </div>
    </div>
  );
};

export default MyChats;
