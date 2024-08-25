import { CloseIcon } from '@chakra-ui/icons'
import { Box } from '@chakra-ui/react'
import React from 'react'

const UserBadgeItem = ({user,handleFunction}) => {
  return (
    <Box onClick={handleFunction} px={2} py={1} textColor="white" backgroundColor="purple" borderRadius="lg" m={1} mb={2} fontSize={12} cursor="pointer" >

        {user.name}

   <CloseIcon/>
    
    
    </Box>

    


  )
}

export default UserBadgeItem