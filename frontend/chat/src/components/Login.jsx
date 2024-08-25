import React, { useState } from 'react'
import { FormControl, FormLabel, VStack, Input, InputGroup, InputRightElement, InputLeftElement, Button, useToast } from '@chakra-ui/react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Login = () => {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [show, setShow] = useState('')
    const [loading, setLoading] = useState('')
    const toast = useToast();
    const navigate = useNavigate();
    const handleClick = () => {
        setShow(!show)
    }

    const submitHandler = async () => {
        setLoading(true);
        if (!email || !password) {
            toast({
                title: 'Please fill all the fields',
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: 'top',
            });
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:3000/login', { email, password })
            toast({
                title: 'Login Successfull',
                status: 'success',
                duration: 5000,
                isClosable: true,
                position: 'top',
            });
            console.log(response.data)
            localStorage.setItem("userInfo", JSON.stringify(response.data))
            setLoading(false);
            navigate('/chats')
        } catch (error) {
            const errorMessage = error.response && error.response.data.message
                ? error.response.data.message
                : "An unexpected error occurred";
            toast({
                title: 'Error occured',
                description: errorMessage,
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top',
            });

            setLoading(false);
        }




    }

    return (
        <VStack spacing='50px' color='black'>

            <FormControl id='email' isRequired>
                <FormLabel> Email</FormLabel>
                <Input placeholder='Enter your email'
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                />

            </FormControl>

            <FormControl id='pasword' isRequired>
                <FormLabel> Password</FormLabel>

                <InputGroup>
                    <Input placeholder='Enter your password'
                        type={show ? "text" : "password"}
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                   />

                    <InputRightElement>
                        <Button width='4.5rem' h='1.75rem' size='sm'
                            onClick={() => handleClick()}
                        >
                            {show ? "Hide" : "Show"}
                        </Button>

                    </InputRightElement>

                </InputGroup>


            </FormControl>


            <Button
                colorScheme='blue'
                width='100%'
                style={{ marginTop: 15 }}
                onClick={submitHandler}
            >
                Login


            </Button>


            <Button
                variant='solid'
                colorScheme='red'
                width='100%'
                style={{ marginTop: -25 }}
                onClick={() => {
                    setEmail("guest@example.com")
                    setPassword("123456")
                }}
            >
                Get Guest User Credentials


            </Button>



        </VStack>

    )
}

export default Login