import React, { useEffect } from 'react';
import { Box, Container, Text, Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';
import Login from '../components/Login';
import Register from '../components/Register';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  
    useEffect(() => {

      const user = JSON.parse(localStorage.getItem("userInfo"));

      if(user) {
        navigate('/chats')
      }


    },[navigate])

  return (
    <Container maxW='xl' centerContent>
      <Box
        d='flex'
        justifyContent='center'
        p={3}
        bgColor='rgba(255, 255, 255, 0.1)'
        w='100%'
        m='40px 0 15px 0'
        borderRadius='lg'
        borderWidth='1px'
        textAlign='center'
        boxShadow='0 4px 6px rgba(0, 0, 0, 0.1)' // Adding a soft shadow for a subtle 3D effect
      >
        <Text fontSize='4xl' color='white'>
          Welcome to NightChatt
        </Text>
      </Box>

      <Box
        bgColor='white'
        w='100%'  // Ensuring the box takes up the full width
        borderRadius='lg'
        p={4}
        borderWidth='1px'
        textAlign='center'
      >
        <Tabs variant="soft-rounded" colorScheme='green'>
          <TabList mb='1em' w='100%'> {/* Matching width with the above box */}
            <Tab width='50%' fontSize='lg'>Login</Tab>  {/* Increased font size for better visibility */}
            <Tab width='50%' fontSize='lg'>Sign Up</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Login/>
            </TabPanel>
            <TabPanel>
                <Register/>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
}

export default HomePage;
