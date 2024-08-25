import { Box, Button, Tooltip, Text, Menu, MenuButton, Avatar, MenuList, MenuItem, MenuDivider, Drawer, useDisclosure, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, Input, useToast, Spinner } from '@chakra-ui/react';
import React, { useState } from 'react';
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useChatState } from '../Context/ChatProvider';
import ProfileModal from '../ModalBox/ProfileModal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChatLoading from './ChatLoading';
import UserListItem from '../UserAvatar/UserListItem';

const NavBar = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ loadingChat , setLoadingChat] = useState(false)

  const { user,chats,setChats, setSelectedChat } = useChatState();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleLogOut = () => {
    localStorage.removeItem("userInfo");
    navigate('/');
  }

  const handleSearch = async () => {

    if (!search) {
      toast({
        title: "Please enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left"
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };

      // Make the API call with the search query
      const response = await axios.get(
        `http://localhost:3000/allUsers?search=${search}`,
        config
      );

      setLoading(false);
      console.log(response.data)
      setSearchResult(response.data);
    } catch (error) {
      toast({
        title: "Error occurred",
        description: error.response?.data?.message || "Failed to load the search results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left"
      });
      setLoading(false);
    }

  };

  const accessChat = async (userId) => {

    if (!search) {
      toast({
        title: "Please Enter the something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left"


      })
      return;
    }

    try {
      setLoadingChat(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        },
      };
       const response = await axios.post('http://localhost:3000/accessChat' ,{userId},config)
       console.log("accesChatResponse:",response)
       if(!chats.find((chat) => chat._id === response.data._id)) {
        setChats([response.data, ...chats])
       }

       setSelectedChat(response.data);
       setLoadingChat(false)
       onClose();   

    } catch (error) {
      toast({
        title: "Error occurred when fetching the chat",
        description: error.response?.data?.message || "Failed",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left"
      });
    }


  }


  return (
    <div className="flex items-center justify-between bg-red-800 p-4 shadow-md">
      <Tooltip label="Search users to chat" hasArrow placement="bottom-end">
        <Button onClick={onOpen} variant="ghost" display="flex" alignItems="center" color="orange">
          <i className="fas fa-search" style={{ color: 'orange', marginRight: '8px' }}></i>
          <Text textColor="orange" display={{ base: "none", md: "flex" }}>
            Search User
          </Text>
        </Button>
      </Tooltip>

      <Text fontSize="2xl" textAlign="center" flex="1" textColor="white">
        NightChattApp
      </Text>

      <div className="flex items-center space-x-4">
        <Menu>
          <MenuButton>
            <BellIcon fontSize="2xl" color="orange" />
          </MenuButton>

          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar size="sm" cursor='pointer' name={user.name} src={user.pic} />
            </MenuButton>

            <MenuList>
             
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
             
              <MenuDivider />
              <MenuItem onClick={handleLogOut}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </Menu>
      </div>

      <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay>
          <DrawerContent>
            <DrawerHeader borderBottomWidth="1px">Search User</DrawerHeader>
            <DrawerBody>
            {/* Display search Button here */}

              <Box display="flex" pb={2}>
                <Input
                  value={search}
                  mr={2}
                  placeholder="Search by name or email"
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button onClick={handleSearch} isLoading={loading}>Search</Button>
              </Box>

              {/* Display search results here */}
              {loading ? (
                <ChatLoading />
              ) : (
                searchResult.map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => accessChat(user._id)}
                  />
                ))
              )}
              {loadingChat && <Spinner ml="auto" d="flex"></Spinner>}

            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
    </div>
  );
}

export default NavBar;
