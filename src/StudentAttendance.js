import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import axios from 'axios';
import * as Location from 'expo-location';

const StudentAttendance = ({ navigation }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await axios.get('http://192.168.120.249:5000/getUserDetails');
        if (response.data.status === 'success') {
          setUserDetails(response.data.user);
        } else {
          console.error('Error fetching user details:', response.data);
        }
      } catch (error) {
        console.error('Error fetching details:', error);
      }
    };

    fetchDetails();
  }, []);

  useEffect(() => {
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

  const renderLabel = () => {
    if (true) {
      return (
        <Text style={[styles.label]}>
          Enter the Shared Code
        </Text>
      );
    }
  };

  const markattendance = async () => {
    try {
      // Request permission to access location
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.error('Permission to access location was denied');
      }

      if (searchText === '' || searchText.length < 5) {
        alert('Please enter the 5 Digit Code!!');
        return;
      }

      // Get the current location
      Location.getCurrentPositionAsync({}).then((location) => {
        if (location && location.coords) {
          setIsLoading(true);
          const currentDate = new Date();
          const formattedDate = currentDate.toLocaleDateString('en-CA'); // Specify the locale to ensure the correct date format
          const mysqlFormattedDate = formattedDate.split('/').reverse().join('-');
          
          // Prepare data to send
          const data = {
            regid: userDetails.regid,
            email: userDetails.email,
            location: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            },
            date: mysqlFormattedDate,
            code: searchText,
          };
          console.log(data);
          // Send post request
          axios.post('http://192.168.120.249:5000/mark_studentattendance', data)
            .then(response => {
              if (response.data.status === 'no_code') {
                alert(response.data.message);
                setSearchText('');
              } else if (response.data.status === 'course_mismatch') {
                alert(response.data.message);
                setSearchText('');
              } else if (response.data.status === 'outside_range') {
                alert(response.data.message);
                setSearchText('');
              } else if (response.data.status === 'success') {
                alert(response.data.message);
                setSearchText('');
              } else if (response.data.status === 'already_marked') {
                alert(response.data.message);
                setSearchText('');
              } else {
                alert('Error marking attendance.');
                setSearchText('');
              }
              return;
            })
            .catch(error => {
              console.error('Error:', error);
            })
            .finally(() => {
              setIsLoading(false);
            });
        } else {
          setIsLoading(false);
        }
      });
    } catch (error) {
      setIsLoading(false);
      console.error('Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      {renderLabel()}
      <TextInput
        style={styles.textInput}
        placeholder="Enter 5-digit number"
        keyboardType="numeric"
        maxLength={5}
        value={searchText}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChangeText={(text) => setSearchText(text)}
      />
      <View style={{ marginTop: 10, borderRadius: 8, overflow: 'hidden' }}>
        <Button
          title="Mark Attendance"
          onPress={markattendance}
          color="#007BFF"
          titleStyle={styles.buttonTitle}
          disabled={isLoading}
        />
      </View>
    </View>
  );
};

export default StudentAttendance;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  textInput: {
    height: 60,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 8,
    fontSize: 18, // Adjust the font size as needed
    width: '100%',
  },
  buttonTitle: {
    fontSize: 16, // Adjust the font size as needed
  },
});
