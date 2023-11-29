import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import axios from 'axios';

const FacultyLogs = ({ navigation }) => {
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    // Function to fetch details from the /getUserDetails endpoint
    const fetchDetails = async () => {
      try {
        const response = await axios.get('http://192.168.156.249:5000/getUserDetails');
        // Assuming the response contains 'status' and 'user' fields
        if (response.data.status === 'success') {
          setUserDetails(response.data.user);
        } else {
          console.error('Error fetching user details:', response.data);
        }
      } catch (error) {
        console.error('Error fetching details:', error);
      }
    };

    // Call the fetchDetails function when the component mounts
    fetchDetails();
  }, []);

  useEffect(() => {
    // Update the header with the userName
    navigation.setOptions({
      headerRight: () => (
        <View style={{ marginRight: 10 }}>
          <Text style={{ fontWeight: 'bold' }}>
            {userDetails ? userDetails.name : 'Loading...'}
          </Text>
        </View>
      ),
      headerLeft: null,
    });
  }, [userDetails, navigation]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {userDetails ? (
        <>
          <Text>Welcome, {userDetails.name}!</Text>
        </>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
};

export default FacultyLogs;

