import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
 
  const [user, setUser] = useState(null);
  const [selectedChat,setSelectedChat] = useState()
  const [chats,setChats] =useState([])
  const navigate = useNavigate();



  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    console.log("userInfo from localStorage:", userInfo);

    setUser(userInfo);

    if (!userInfo) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <ChatContext.Provider
      value={{
        user,setUser,
        selectedChat,setSelectedChat,
        chats,setChats

      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to access the ChatContext
export const useChatState = () => {
  const context = useContext(ChatContext);

  if (context === undefined) {
    throw new Error("useChatState must be used within a ChatProvider");
  }

  return context;
};

export default ChatProvider;
