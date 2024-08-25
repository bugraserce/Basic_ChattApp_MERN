import React, { useState } from 'react';
import { useChatState } from '../Context/ChatProvider';
import Navbar from '../ChatsComponents/NavBar';
import MyChats from '../ChatsComponents/MyChats';
import ChatBox from '../ChatsComponents/ChatBox';
import { Box } from '@chakra-ui/react';

const ChatPage = () => {
  const { user } = useChatState();
  const [fecthAgain, setFecthAgain] = useState(false)
  return (
    <div style={{ width: "100%" }}>
      {user && <Navbar />}
      <div className=' flex justify-between '>
        <MyChats fecthAgain={fecthAgain} setFecthAgain={setFecthAgain}> </MyChats>
        <ChatBox fecthAgain={fecthAgain} setFecthAgain={setFecthAgain}> </ChatBox>
      </div>


    </div>
  );
};

export default ChatPage;
