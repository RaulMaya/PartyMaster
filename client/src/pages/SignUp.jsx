import React, { useState } from 'react';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { CREATE_USER } from '../utils/mutations';
import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Button,
  Heading,
  Text,
  Link,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  useColorModeValue,
  Spinner
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

import Auth from '../utils/auth';

const SignUp = ({ isAuthenticated }) => {
  if (isAuthenticated) {
    return <Navigate to="/" />; // or wherever you want to redirect
  }
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    dateOfBirth: '',
    profilePic: '',
    password: '',
  });

  const [errorMessage, setErrorMessage] = useState(null);

  const [createUser, { loading, error, data }] = useMutation(CREATE_USER);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await createUser({
        variables: { ...formData },
      });

      Auth.login(data.createUser.token);
    } catch (error) {
      console.error(error.message);
      setErrorMessage(error.message);
    }
  };

  const bgColor = useColorModeValue('purple.100', 'purple.800');
  const formBgColor = useColorModeValue('white', 'lilac.600');
  const formBorderColor = useColorModeValue('purple.300', 'purple.600');
  const headingColor = useColorModeValue('purple.800', 'white');
  const buttonBgColor = useColorModeValue('purple.400', 'violet.600');
  const buttonColor = useColorModeValue('white', 'gray.100');
  const buttonHoverColor = useColorModeValue('purple.500', 'violet.700');

  const [showPassword, setShowPassword] = useState(false);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner color="purple.500" />
      </Box>
    );
  }

  return (
    <Flex minH={'100vh'} align={'center'} justify={'center'} bg={bgColor}>
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'} textAlign={'center'} color={headingColor}>
            Sign up
          </Heading>
          <Text fontSize={'lg'} color={'gray.600'}>
            to enjoy all of our upcoming events ✌️
          </Text>
        </Stack>
        <Box rounded={'lg'} bg={formBgColor} boxShadow={'lg'} p={8}>
          <Stack spacing={4}>
            {errorMessage && (
              <Alert status="error">
                <AlertIcon />
                <AlertTitle mr={2}>An error occurred!</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
                <CloseButton position="absolute" right="8px" top="8px" onClick={() => setErrorMessage(null)} />
              </Alert>
            )}
            {data ? (
              <Text>
                Success! You may now head{' '}
                <Link as={RouterLink} to={'/'}>
                  back to the homepage.
                </Link>
              </Text>
            ) : (
              <form onSubmit={handleSubmit}>
                <FormControl mt={'3'} id="username" isRequired>
                  <FormLabel>Username</FormLabel>
                  <Input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    borderColor={formBorderColor}
                  />
                </FormControl>
                <FormControl mt={'3'} id="email" isRequired>
                  <FormLabel>Email address</FormLabel>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    borderColor={formBorderColor}
                  />
                </FormControl>
                <FormControl mt={'3'} id="dateOfBirth" isRequired>
                  <FormLabel>Date of Birth</FormLabel>
                  <Input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                    borderColor={formBorderColor}
                  />
                </FormControl>
                <FormControl mt={'3'} id="profilePic" isRequired>
                  <FormLabel>Profile Picture</FormLabel>
                  <Input
                    type="text"
                    name="profilePic"
                    value={formData.profilePic}
                    onChange={handleChange}
                    required
                    borderColor={formBorderColor}
                  />
                </FormControl>
                <FormControl mt={3} id="password" isRequired>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      borderColor={formBorderColor}
                    />
                    <InputRightElement h={'full'}>
                      <Button
                        variant={'ghost'}
                        onClick={() =>
                          setShowPassword((showPassword) => !showPassword)
                        }
                      >
                        {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
                <Button
                  loadingText="Submitting"
                  size="lg"
                  bg={buttonBgColor}
                  color={buttonColor}
                  _hover={{
                    bg: buttonHoverColor,
                  }}
                  type="submit"
                  isLoading={loading}
                  mt={4}
                >
                  Sign up
                </Button>
                <Stack pt={6}>
                  <Text align={'center'}>
                    Already a user?{' '}
                    <Link as={RouterLink} to="/login" color={buttonBgColor}>
                      Login
                    </Link>
                  </Text>
                </Stack>
              </form>
            )}
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default SignUp;
