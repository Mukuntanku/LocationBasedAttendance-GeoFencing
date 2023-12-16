import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import axios from 'axios';
import { Dropdown } from 'react-native-element-dropdown';
import * as Location from 'expo-location';
import { BASE_URL } from './apiConfig';

const GenerateCode = ({ navigation }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const [randomNumber, setRandomNumber] = useState(null);
  const [isTextVisible, setIsTextVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const [isSecondButtonVisible, setIsSecondButtonVisible] = useState(false);

  const [coursevalue, setCourseValue] = useState('defaultValue');
  const [cousedata, setCourseData] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/getUserDetails`);
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
  }, [navigation]);

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

  useEffect(() => {
    if (userDetails) {
      const currentDate = new Date();
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      const currentDay = daysOfWeek[currentDate.getDay()];
      const data = {
        email: userDetails.email,
        day: currentDay,
      };
      const fetch_tt = async () => {
        try {
          const response = await axios.post(`${BASE_URL}/get_tt`,  data);
          if(response.data.status === 'no_tt'){
            alert(response.data.message);
            return;
          } else if (response.data.message === 'success') {
            setCourseData(response.data.course);
          } else {
            console.error('Error fetching user details:', response.data);
          }
        } catch (error) {
          console.error('Error fetching details:', error);
        }
      };

      fetch_tt();
    }
  }, [userDetails, navigation]);  

  const renderLabelcourse = () => {
    if (coursevalue || isFocus) {
      return (
        <Text style={[styles.label, isFocus && { color: 'blue' }]}>
          Select Course
        </Text>
      );
    }
    return null;
  };

  const updateserver = async () => {
    try {
      // Request permission to access location
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      if (coursevalue === 'defaultValue') {
        alert('Please select a Course');
        return;
      }

      setIsLoading(true);

      // Get the current location
      Location.getCurrentPositionAsync({}).then((location) => {
        if (location && location.coords) {
          // Log current location, date, time, and selected dropdown value
          const newRandomNumber = Math.floor(10000 + Math.random() * 90000);
          setRandomNumber(newRandomNumber);
          setIsTextVisible(true);

          const currentDate = new Date();
          const formattedDate = currentDate.toLocaleDateString('en-CA'); // Specify the locale to ensure the correct date format
          const mysqlFormattedDate = formattedDate.split('/').reverse().join('-');
          
          // Prepare data to send
          const data = {
            email: userDetails.email,
            regid: userDetails.regid,
            location: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            },
            date: mysqlFormattedDate,
            random: newRandomNumber,
            course: coursevalue,
          };
          // Send post request
          axios.post(`${BASE_URL}/setrandom`, data)
            .then(response => {
              if (response.data.message === 'success') {
                setPostSuccess(true);
                // Enable the second button
                setIsSecondButtonVisible(true);
              } else {
                alert('Error storing random number!!');
                setPostSuccess(false);
                return;
              }
            })
            .catch(error => {
              console.error('Error:', error);
              setPostSuccess(false);
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

const handleSecondButtonPress = async () => {
    try {
      const result = await axios.post(`${BASE_URL}/delrandom`, {
        random: randomNumber,
      });
      if(result.data.message === 'success') {
        setRandomNumber(null);
        setIsSecondButtonVisible(false);
        setIsTextVisible(false);
      }
      else {
        alert('Error deleting random number!!');
        return;
      }
    } catch (error) {
      console.error('Error deleting random number:', error);
    }
  };

  const renderSecondButton = () => {
    if (isSecondButtonVisible) {
      return (
        <View style={{ marginTop: 10, borderRadius: 8, overflow: 'hidden' }}>
          <Button
            title="Close Attendance"
            onPress={handleSecondButtonPress}
            color="#007BFF" // Set the button color as needed
          />
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {renderLabelcourse()}
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={cousedata || []} // Ensure data is not null
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? 'Select course' : '...'}
        searchPlaceholder="Search..."
        value={coursevalue}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          setCourseValue(item.value);
          setIsFocus(false);
        }}
      />

      <View style={styles.inputContainer}>
      <TextInput
        style={[
            styles.randomNumberInput,
            isTextVisible && styles.boldText,
            { textAlign: 'center', color: '#FF5733' } // Center align and change color
        ]}
        placeholder="Generated Number"
        editable={false}
        value={isTextVisible && randomNumber !== null ? randomNumber.toString() : ''}
        />

        {/* Generate Number Button */}
        <View style={{ marginTop: 10, borderRadius: 8, overflow: 'hidden' }}>
          <Button
            title="Generate Number"
            onPress={updateserver}
            color="#007BFF"
            disabled={isSecondButtonVisible} // Disable when the second button is visible
          />
        </View>

        {/* Second Button (conditionally rendered) */}
        {renderSecondButton()}
      </View>
    </View>
  );
};

export default GenerateCode;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputContainer: {
    marginTop: 20,
  },
  randomNumberInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 30,
    marginBottom: 10,
    width: '50%',
    textAlign: 'center', // Center align text
    color: '#FF5733', // Change text color
  },
  boldText: {
    fontWeight: 'bold',
  },
});
