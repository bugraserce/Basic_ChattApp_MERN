import { Avatar, Text } from '@chakra-ui/react';
import React from 'react';

const UserListItem = ({ user, handleFunction}) => {
  
  return (
    <div
      onClick={handleFunction} // click to add to selectedUsers Array
      className="cursor-pointer w-full flex items-center p-2 hover:bg-gray-200"
    >
      <Avatar
        mr={2}
        size="sm"
        cursor="pointer"
        name={user.name}
        src={user.pic}
      />
      <div>
        <Text fontSize="lg">{user.name}</Text>
        <b>Email: {user.email}</b>
      </div>
    </div>
  );
};

export default UserListItem;
