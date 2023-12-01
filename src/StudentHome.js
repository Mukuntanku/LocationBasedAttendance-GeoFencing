import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import axios from 'axios';

const defaultProfileIcon = require('../assets/default.png'); // Replace with the path to your default profile icon

const StudentHome = ({ navigation }) => {
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    // Function to fetch details from the /getUserDetails endpoint
    const fetchDetails = async () => {
      try {
        const response = await axios.get('http://192.168.115.249:5000/getUserDetails');
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
    <View style={styles.container}>
      {userDetails ? (
        <View style={styles.card}>
          <Image
            source={userDetails.profileImage ? { uri: userDetails.profileImage } : defaultProfileIcon}
            style={styles.profileImage}
          />
          <View style={styles.textContainer}>
            <Text style={styles.text}>Name: {userDetails.name}</Text>
            <Text style={styles.text}>Email: {userDetails.email}</Text>
            <Text style={styles.text}>Department: {userDetails.dept}</Text>
            <Text style={styles.text}>Reg ID: {userDetails.regid}</Text>
            <Text style={styles.text}>Base Location: {userDetails.location}</Text>
          </View>
        </View>
      ) : (
        <Image
          source={defaultProfileIcon}
          style={styles.profileImage}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    flexDirection: 'row', // Lay out children horizontally
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    elevation: 3,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 16,
  },
  textContainer: {
    flex: 1, // Take the remaining space
  },
  text: {
    marginBottom: 8,
  },
});

export default StudentHome;
