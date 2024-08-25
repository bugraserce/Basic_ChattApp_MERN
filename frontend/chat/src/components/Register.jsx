import {
    FormControl,
    FormLabel,
    VStack,
    Input,
    InputGroup,
    InputRightElement,
    Button,
    useToast,
  } from '@chakra-ui/react';
  import React, { useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import axios from 'axios';
  
  const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [pic, setPic] = useState('');
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();
  
    const handleClick = () => {
      setShow(!show);
    };
  
    const postDetails = (pic) => {
      setLoading(true);
      if (pic === undefined) {
        toast({
          title: 'Please select an image',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'bottom',
        });
        setLoading(false);
        return;
      }
  
      if (pic.type === 'image/jpeg' || pic.type === 'image/png') {
        const data = new FormData();
        data.append('file', pic);
        data.append('upload_preset', 'chat-app');
        data.append('cloud_name', 'bugracloud');
        fetch('https://api.cloudinary.com/v1_1/bugracloud/image/upload', {
          method: 'post',
          body: data,
        })
          .then((res) => res.json())
          .then((data) => {
            setPic(data.url.toString());
            setLoading(false);
          })
          .catch((err) => {
            console.log(err);
            setLoading(false);
          });
      } else {
        toast({
          title: 'Please select an image',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'bottom',
        });
        setLoading(false);
        return;
      }
    };
  
    const submitHandler = async () => {
      setLoading(true);
      if (!name || !email || !password || !confirmPassword) {
        toast({
          title: 'Please fill all fields',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        toast({
          title: "Passwords don't match",
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        setLoading(false);
        return;
      }
  
      try {
        const { data } = await axios.post('http://localhost:3000/register', {
          name,
          email,
          password,
          pic,
        });
        toast({
          title: 'Registration Successful',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        localStorage.setItem('userInfo', JSON.stringify(data));
        navigate('/chats');
      } catch (error) {
        toast({
          title: 'Error Occurred',
          description: error.response.data.message,
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        setLoading(false);
      }
    };
  
    return (
      <VStack spacing='50px' color='black'>
        <FormControl id='name' isRequired>
          <FormLabel>Name</FormLabel>
          <Input
            placeholder='Enter your name'
            onChange={(e) => setName(e.target.value)}
          />
        </FormControl>
  
        <FormControl id='email' isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            placeholder='Enter your email'
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>
  
        <FormControl id='password' isRequired>
          <FormLabel>Password</FormLabel>
          <InputGroup>
            <Input
              placeholder='Enter your password'
              type={show ? 'text' : 'password'}
              onChange={(e) => setPassword(e.target.value)} // Corrected here
            />
            <InputRightElement>
              <Button
                width='4.5rem'
                h='1.75rem'
                size='sm'
                onClick={() => handleClick()}
              >
                {show ? 'Hide' : 'Show'}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>
  
        <FormControl id='confirmPassword' isRequired>
          <FormLabel>Confirm Password</FormLabel>
          <InputGroup size='md'>
            <Input
              placeholder='Confirm password'
              type={show ? 'text' : 'password'}
              onChange={(e) => setConfirmPassword(e.target.value)} // Ensure this is correct
            />
            <InputRightElement>
              <Button
                width='4.5rem'
                h='1.75rem'
                size='sm'
                onClick={() => handleClick()}
              >
                {show ? 'Hide' : 'Show'}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>
  
        <FormControl>
          <FormLabel>Upload your Picture</FormLabel>
          <Input
            type='file'
            p={1.5}
            accept='image/*'
            onChange={(e) => postDetails(e.target.files[0])}
          />
        </FormControl>
  
        <Button
          colorScheme='blue'
          width='100%'
          style={{ marginTop: 15 }}
          onClick={() => submitHandler()}
          isLoading={loading}
        >
          Sign Up
        </Button>
      </VStack>
    );
  };
  
  export default Register;
  