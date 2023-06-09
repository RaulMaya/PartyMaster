import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { QUERY_SINGLE_USER, QUERY_ME } from '../utils/queries';
import { DELETE_EVENT, ATTEND_EVENT, CANCEL_EVENT, UPDATE_EVENT } from '../utils/mutations';
import Auth from '../utils/auth';
import FormFields from '../components/FormsFields';
import CreatedEventCard from '../components/CreatedEventsCard';
import AssistingEventCard  from '../components/AssistingEventCard'
import {
    Box,
    Flex,
    Heading,
    Text,
    Divider,
    Input,
    VStack,
    FormControl,
    FormLabel,
    Avatar,
    Image,
    SimpleGrid,
    Button,
    useDisclosure,
    Modal,
    ModalCloseButton,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useToast,
    Spinner,
    Grid,
    Alert
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

const UserDashboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { loading, error, data, refetch } = useQuery(id ? QUERY_SINGLE_USER : QUERY_ME, {
        variables: { userId: id },
    });
    const [eventToUpdate, setEventToUpdate] = useState(null)
    const eventAtt = data?.me?.assistingEvents || [];

    const [attendEvent] = useMutation(ATTEND_EVENT, {
        refetchQueries: [{ query: id ? QUERY_SINGLE_USER : QUERY_ME }],
    });

    const [cancelEvent] = useMutation(CANCEL_EVENT, {
        refetchQueries: [{ query: id ? QUERY_SINGLE_USER : QUERY_ME }],
    });

    const [deleteEvent] = useMutation(DELETE_EVENT, {
        refetchQueries: [{ query: id ? QUERY_SINGLE_USER : QUERY_ME }],
    });

    const [updateEvent] = useMutation(UPDATE_EVENT, {
        refetchQueries: [{ query: id ? QUERY_SINGLE_USER : QUERY_ME }],
    }); // Define the updateEvent mutation function

    const [formData, setFormData] = useState({
        eventName: "",
        eventCategory: "",
        eventDescription: "",
        mainImg: "",
        portraitImg: "",
        tags: "",
        eventStartDate: "",
        eventLocation: {
            address: "",
            city: "",
            country: "",
            lat: "",
            lon: "",
        },
        eventCapacity: "",
        minAge: "",
        // ... Initialize other fields here with default values
    });

    const handleUpdateEvent = (event) => {
        setEventToUpdate(event._id);
        setFormData({
            eventName: event.eventName,
            eventCategory: event.eventCategory,
            eventDescription: event.eventDescription,
            mainImg: event.mainImg,
            portraitImg: event.portraitImg,
            tags: event.tags,
            eventStartDate: event.eventStartDate,
            eventLocation: {
                address: event.eventLocation.address,
                city: event.eventLocation.city,
                country: event.eventLocation.country,
                lat: String(event.eventLocation.lat),
                lon: String(event.eventLocation.lon),
            },
            eventCapacity: event.eventCapacity,
            minAge: event.minAge
        });
        onOpenUpdate();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    const { isOpen: isUpdateOpen, onOpen: onOpenUpdate, onClose: onCloseUpdate } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure();

    const [eventToDelete, setEventToDelete] = useState(null);

    const toast = useToast();

    const handleButtonClick = async (eventId) => {
        const isAttending = eventAtt.some((event) => event._id === eventId);
        try {
            if (isAttending) {
                await cancelEvent({ variables: { eventId } });
                const updatedEventAtt = eventAtt.filter((event) => event._id !== eventId);
                refetch();
            } else {
                await attendEvent({ variables: { eventId } });
                const updatedEventAtt = [...eventAtt, { _id: eventId }];
                refetch();
            }
        } catch (error) {
            console.error('Error updating attendance:', error);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        setEventToDelete(eventId);
        onOpenDelete();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateEvent({ variables: { ...formData, updateEventId: eventToUpdate } });
            toast({
                title: 'Event Updated',
                description: 'The event has been updated successfully.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            onCloseUpdate();
            refetch();
        } catch (error) {
            console.error('Error updating event:', error);
            toast({
                title: 'Error',
                description: 'An error occurred while updating the event.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleDeleteConfirmation = async (eventId) => {
        try {
            await deleteEvent({
                variables: { deleteEventId: eventId },
            });
            toast({
                title: 'Event Deleted',
                description: 'The event has been deleted successfully.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            onCloseDelete();
            refetch();
        } catch (error) {
            console.error('Error deleting event:', error);
            toast({
                title: 'Error',
                description: 'An error occurred while deleting the event.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    useEffect(() => {
        if (!Auth.loggedIn()) {
            navigate('/signup');
        }
    }, [navigate]);

    const handleLocationChange = (e) => {
        const { name, value } = e.target;
        let valueType = value;

        if (["lon", "lat", "eventCapacity", "minAge"].includes(name)) {
            if (value.trim() === "") {
                valueType = "";
            } else {
                if (!/^-?\d*\.?\d+$/.test(value) && value !== "-") {
                    toast({
                        title: "Invalid Value",
                        description: "Please enter a valid number.",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                    return;
                }

                const parsedValue = parseFloat(value);

                if (name === "lat") {
                    if (parsedValue < -90 || parsedValue > 90) {
                        toast({
                            title: "Invalid Latitude",
                            description: "Latitude value must be between -90 and 90.",
                            status: "error",
                            duration: 5000,
                            isClosable: true,
                        });
                        return;
                    }
                } else if (name === "lon") {
                    if (parsedValue < -180 || parsedValue > 180) {
                        toast({
                            title: "Invalid Longitude",
                            description: "Longitude value must be between -180 and 180.",
                            status: "error",
                            duration: 5000,
                            isClosable: true,
                        });
                        return;
                    }
                }

                valueType = parsedValue.toString();
            }
        }

        setFormData((prevData) => ({
            ...prevData,
            eventLocation: {
                ...prevData.eventLocation,
                [name]: valueType,
            },
        }));
    };


    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Spinner color="purple.500" />
            </Box>
        );
    }

    if (error) {
        return <Alert status="error">{error.message} :(</Alert>;
    }

    const user = data?.me || data?.profile || {};

    return (
        <Box p={4} mt={10}>
            <Flex align="center" mb={6}>
                <Avatar size="lg" name={user.username} src={user.profilePic} mr={4} />
                <VStack align="start" spacing={1}>
                    <Heading size="lg">{user.username}</Heading>
                    <Text fontSize="sm">{user.email}</Text>
                </VStack>
            </Flex>

            <Divider />

            <Box mt={6}>
                <Heading size="md" mb={4}>
                    Created Events
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                    {user.createdEvents.map((event) => (
                        <CreatedEventCard key={event._id} event={event} handlerEdit={handleUpdateEvent} handlerDelete={handleDeleteEvent}/>
                    ))}
                </SimpleGrid>
            </Box>

            <Divider />

            <Box mt={6}>
                <Heading size="md" mb={4}>
                    Assisting Events
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                    {user.assistingEvents.map((event) => (
                        <AssistingEventCard key={event._id} event={event} eventAtt={eventAtt} handler={handleButtonClick} />
                    ))}
                </SimpleGrid>
            </Box>
            {/* Update Event Modal */}
            <Modal isOpen={isUpdateOpen} onClose={onCloseUpdate}>
                <ModalOverlay />
                <ModalContent maxW="50%">
                    <ModalHeader>Edit Event</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <form onSubmit={handleSubmit}>
                            <FormControl>
                                <FormFields name={"eventName"} text={"Event Name"} val={formData?.eventName || ''} handler={handleChange} type={"input"} />
                                <FormFields name={"eventDescription"} text={"Event Description"} val={formData?.eventDescription || ''} handler={handleChange} type={"textarea"} />
                                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                                    <FormFields name={"eventCategory"} text={"Event Category"} val={formData?.eventCategory || ''} handler={handleChange} type={"input"} />
                                    <FormFields name={"mainImg"} text={"Main Image URL"} val={formData?.mainImg || ''} handler={handleChange} type={"input"} />
                                    <FormFields name={"portraitImg"} text={"Portrait Image URL"} val={formData?.portraitImg || ''} handler={handleChange} type={"input"} />
                                    <FormFields name={"tags"} text={"Tags"} val={formData?.tags || ''} handler={handleChange} type={"input"} />
                                    <FormFields name={"eventStartDate"} text={"Event Start Date"} val={formData?.eventStartDate || ''} handler={handleChange} type={"date"} />
                                    <FormFields name={"address"} text={"Event Address"} val={formData?.eventLocation.address || ''} handler={handleLocationChange} type={"input"} />
                                    <FormFields name={"city"} text={"Event City"} val={formData?.eventLocation.city || ''} handler={handleLocationChange} type={"input"} />
                                    <FormFields name={"country"} text={"Event Country"} val={formData?.eventLocation.country || ''} handler={handleLocationChange} type={"input"} />
                                    <FormFields name={"lat"} text={"Event Latitude"} val={formData?.eventLocation.lat || ''} handler={handleLocationChange} type={"coords"} />
                                    <FormFields name={"lon"} text={"Event Longitude"} val={formData?.eventLocation.lon || ''} handler={handleLocationChange} type={"coords"} />
                                    <FormFields name={"eventCapacity"} text={"Event Capacity"} val={formData?.eventCapacity || ''} handler={handleChange} type={"nums"} />
                                    <FormFields name={"minAge"} text={"Minimum Age"} val={formData?.minAge || ''} handler={handleChange} type={"nums"} />
                                </Grid>
                            </FormControl>
                            {/* Add other form controls here */}
                        </form>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="purple" mr={3} onClick={handleSubmit}>
                            Save
                        </Button>
                        <Button onClick={onCloseUpdate}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Delete Event Modal */}
            <Modal isOpen={isDeleteOpen} onClose={onCloseDelete}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Delete Event</ModalHeader>
                    <ModalBody>Are you sure you want to delete this event?</ModalBody>
                    <ModalFooter>
                        <Button colorScheme="gray" mr={3} onClick={onCloseDelete}>
                            Cancel
                        </Button>
                        <Button colorScheme="red" onClick={() => handleDeleteConfirmation(eventToDelete)}>
                            Delete
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default UserDashboard;
