import { Box, Button, FormControl, Input, InputGroup, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, useToast } from '@chakra-ui/react'
import React, { useState } from 'react'
import { useChatState } from '../Context/ChatProvider'
import axios from 'axios'
import UserListItem from '../UserAvatar/UserListItem'
import UserBadgeItem from '../UserAvatar/UserBadgeItem'

const GroupChatModal = ({ children }) => {

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [groupChatName, setGroupChatName] = useState("")
  const [selectedUsers, setselectedUsers] = useState([])
  const [search, setSearch] = useState("")
  const [searchResult, setSearchResult] = useState([])
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { user, chats, setChats } = useChatState()

  const handleSearch = async (query) => {
    console.log("Search query:", query); // Check if this logs correctly
    setSearch(query);
    if (!query) {
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const response = await axios.get(`http://localhost:3000/allUsers?search=${search}`, config);
      console.log("searchResult:", response.data); // Ensure this logs the correct data

      setLoading(false);
      setSearchResult(Array.isArray(response.data) ? response.data : []);  // Ensure it's an array
    } catch (error) {
      setLoading(false);
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const handleDelete = (user) => {
    setselectedUsers(selectedUsers.filter(selected => selected._id !== user._id));
  }

  const handleGroup = (user) => {
    if (selectedUsers.includes(user)) {
      toast({
        title: 'User already added',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      return;
    }
    setselectedUsers([...selectedUsers, user]);
  }

  const handleSubmit = async () => {
    if(!groupChatName || !selectedUsers) {
      toast({
        title: 'Please fill all the fileds',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      return;
    }


    try {

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

 const response = await axios.post('http://localhost:3000/createGroup', {name :groupChatName, users : selectedUsers.map((users) => users._id)} , config)
      console.log("CreateGroup:", response.data)
      setChats([response.data , ...chats])
      onClose();
     
      toast({
        title: 'Group Created Succesfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
   
    } catch (error) {
  
        toast({
          title: 'Error creating',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });

    }

  }



  

  return (
    <>
      <span onClick={onOpen}>{children} </span>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader display="flex" justifyContent="center" fontSize="35px">
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDir="column" alignItems="center">
            <FormControl>
              <Input mb={3} onChange={(e) => setGroupChatName(e.target.value)} placeholder='Chat Name' />
              <Input mb={3} onChange={(e) => handleSearch(e.target.value)} placeholder='Add Users eg: Jhon, Piyush, Jane' />
            </FormControl>

            {/* Rendered search users */}
            {loading ? <div>Loading</div> : (
              searchResult?.map(user => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleGroup(user)}
                />
              ))
            )}


            {/* Selected users */}
            <Box w="100%" display="flex" flexWrap="wrap">
              {selectedUsers.map(user => (
                <UserBadgeItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleDelete(user)}
                />
              ))}
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' onClick={handleSubmit}>
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default GroupChatModal
