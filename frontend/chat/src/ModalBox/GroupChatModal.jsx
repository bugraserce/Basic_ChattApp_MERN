import React, { useState, useEffect } from 'react';
import {
    Modal,
    Image,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Button,
    Text,
    Box,
    Input,
    FormLabel,
    Divider,
    VStack,
    useToast
} from '@chakra-ui/react';
import { useChatState } from '../Context/ChatProvider';
import axios from 'axios';
import UserListItem from '../UserAvatar/UserListItem';

const GroupChatModal = ({ isOpen, onClose, users, setUsers }) => {
    const { selectedChat, user } = useChatState();
    const [groupName, setGroupName] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [groupUsers, setGroupUsers] = useState(selectedChat.users);

    const toast = useToast();

    const isGroupAdmin = selectedChat.groupAdmin._id === user._id;

    const removeFromGroup = async (userId) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const response = await axios.put(
                'http://localhost:3000/removeFromGroup',
                { userId: userId, chatId: selectedChat._id },
                config
            );

            console.log("removeFromGroupResult:", response.data);

            // Update the users state
            setGroupUsers(prevState => prevState.filter(user => user._id !== userId));

            toast({
                title: "User removed",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
        } catch (error) {
            console.log(error);
            toast({
                title: "Error removing user",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
        }
    };

    const handleSearch = async (usernameQuery) => {
        if (!usernameQuery) {
            toast({
                title: "Please fill the User Name",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const responseSearch = await axios.get(
                `http://localhost:3000/allUsers?search=${usernameQuery}`,
                config
            );

            console.log("AddUserSearchResult :", responseSearch.data);
            setSearchResult(responseSearch.data);
        } catch (error) {
            toast({
                title: "Error fetching users",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddToGroup = async (userToAdd) => {
        if (groupUsers.find((u) => u._id === userToAdd._id)) {
            toast({
                title: "User already in the group",
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
    
            // Make API call to add user to the group
            const response = await axios.put(
                'http://localhost:3000/addToGroup',
                {
                    chatId: selectedChat._id,
                    userId: userToAdd._id,
                },
                config
            );
    
            // Update the group users list locally
            setGroupUsers(prevState => [...prevState, userToAdd]);
    
            toast({
                title: "User added successfully",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
        } catch (error) {
            toast({
                title: "Error adding user",
                description: error.response?.data?.message || error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader textAlign="center" fontSize="2xl" fontWeight="bold" bg="gray.100">
                    {selectedChat.chatName}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        {isGroupAdmin && (
                            <>
                                <Box>
                                    <FormLabel fontWeight="bold">Change Chat Name</FormLabel>
                                    <Input
                                        placeholder='Enter new chat name'
                                        mb={4}
                                        focusBorderColor="blue.500"
                                        onChange={(e) => setGroupName(e.target.value)}
                                    />
                                    <Button colorScheme='purple'>Change</Button>
                                </Box>

                                <Box>
                                    <FormLabel fontWeight="bold">Add New User</FormLabel>
                                    <Input
                                        placeholder='Add Users eg: John, Piyush, Jane'
                                        mb={4}
                                        focusBorderColor="blue.500"
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />

                                    {loading ? <div>Loading</div> : (
                                        searchResult?.map(user => (
                                            <UserListItem
                                                key={user._id}
                                                user={user}
            
                                                handleFunction={() => handleAddToGroup(user)}
                                            />
                                        ))
                                    )}
                                </Box>

                                <Divider />
                            </>
                        )}

                        <Text fontSize="lg" fontWeight="bold" mb={2}>Group Members</Text>

                        {users.map((user) => (
                            <Box key={user._id} display="flex" alignItems="center" mb={3}>
                                <Image
                                    borderRadius="full"
                                    boxSize="50px"
                                    src={user.pic}
                                    alt={user.name}
                                    mr={3}
                                    border="2px solid"
                                    borderColor="blue.500"
                                />
                                <Box flex="1">
                                    <Text fontWeight="bold">
                                        {user.name}
                                        {selectedChat.groupAdmin._id === user._id && (
                                            <Text as="span" color="green.500" ml={2} fontSize="sm">
                                                (Admin)
                                            </Text>
                                        )}
                                    </Text>
                                    <Text fontSize="sm" color="gray.500">{user.email}</Text>
                                </Box>
                                {isGroupAdmin && selectedChat.groupAdmin._id !== user._id && (
                                    <Box>
                                        <Button onClick={() => removeFromGroup(user._id)} size="sm" colorScheme='red' mr={2}>Remove</Button>
                                        <Button size="sm" colorScheme='orange'>Ban</Button>
                                        <Button size="sm" colorScheme='blue'>Make Admin</Button>
                                    </Box>
                                )}
                            </Box>
                        ))}
                    </VStack>
                </ModalBody>

                <ModalFooter bg="gray.100">
                    <Button colorScheme="blue" mr={3} onClick={onClose}>
                        Close
                    </Button>
                    <Button colorScheme='red'>
                        Leave the Group
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default GroupChatModal;
