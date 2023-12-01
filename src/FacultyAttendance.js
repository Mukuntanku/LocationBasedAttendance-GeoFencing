import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Dimensions, ActivityIndicator, Pressable } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import Modal from "react-native-modal";

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;

const data = [
  { label: 'AB1', value: 'ab1' },
  { label: 'AB2', value: 'ab2' },
  { label: 'AB3', value: 'ab3' },
  { label: 'CIR', value: 'cir' },
  { label: 'MBA', value: 'mba' },
  { label: 'New Auditorium', value: 'aud' },
  { label: 'Gautama Bhavanam', value: 'gb' }
];

const FacultyAttendance = ({ navigation }) => {
  const [isFocus, setIsFocus] = useState(false);
  const [value, setValue] = useState('defaultValue');
  const [region, setRegion] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ModalVisible, setModalVisible] = useState(false);
  
  const [resul, setResul] = useState(null);
  const [resulColor, setResulColor] = useState(null);

  const triggerModal = () => {
    setModalVisible(!ModalVisible);
  };

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

  const renderLabelAB = () => {
    if (value || isFocus) {
      return (
        <Text style={[styles.label, isFocus && { color: 'blue' }]}>
          Academic Block
        </Text>
      );
    }
    return null;
  };

  const handleButtonClick = async () => {
    try {
      // Request permission to access location
      let { status } = await Location.requestForegroundPermissionsAsync();
  
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }
  
      if (value === 'defaultValue') {
        alert('Please select a Block');
        return;
      }
  
      setIsLoading(true);
  
      // Get the current location
      Location.getCurrentPositionAsync({}).then((location) => {
        if (location && location.coords) {
          // Log current location, date, time, and selected dropdown value
          const currentDate = new Date().toLocaleDateString();
          const currentTime = new Date().toLocaleTimeString();
          console.log('Current Location:', location.coords);
          console.log('Date:', currentDate);
          console.log('Time:', currentTime);
          console.log('Selected Dropdown Value:', value);
  
          // Update the region and markers
          setRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02 / ASPECT_RATIO,
          });
  
          setMarkers([
            {
              latlng: {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              },
              title: 'Current Location',
              description: 'You are here',
            },
          ]);
  
          // Prepare data to send
          const data = {
            email: userDetails.email,
            location: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            },
            date: currentDate,
            time: currentTime,
            selectedValue: value,
            baselocation: userDetails.location,
          };
  
          // Send data to the server
          axios.post('http://192.168.115.249:5000/getAttendance', data)
            .then((response) => {
              console.log('Response from server:', response.data);
              if (response.data.message === 'true') {
                setResul('Attendance Marked!    You can close this tab');
                setResulColor('green');
                triggerModal();
              } else {
                setResul('You are not inside the province. Try again');
                setResulColor('red');
                triggerModal();
              }
            })
            .catch((error) => {
              console.error('Failed to send data:', error);
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={ModalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!ModalVisible);
        }}>
        <View style={styles1.centeredView}>
          <View style={styles1.modalView}>
            <Text style={{marginBottom: 15, textAlign: 'center', fontSize: 18, color:resulColor}}>{resul}</Text>
            <Pressable
              style={[styles1.button, styles1.buttonClose]}
              onPress={() => setModalVisible(!ModalVisible)}>
              <Text style={styles1.textStyle}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {renderLabelAB()}
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={data}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? 'Select Block' : '...'}
        searchPlaceholder="Search..."
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={item => {
          setValue(item.value);
          setIsFocus(false);
        }}
      />

      <View style={{ flex: 1, marginTop: 10, borderRadius: 8, overflow: 'hidden' }}>
        {isLoading ? (
          <ActivityIndicator size="large" color="blue" />
        ) : (
          <MapView style={{ flex: 1 }} region={region} onRegionChange={() => {}}>
            {markers.map((marker, index) => (
              <Marker
                key={index}
                coordinate={marker.latlng}
                title={marker.title}
                description={marker.description}
              />
            ))}
          </MapView>
        )}
      </View>

      {/* Add margin to create spacing */}
      <View style={{ marginTop: 10, borderRadius: 8, overflow: 'hidden' }}>
        <Button
          title="Mark Attendance"
          onPress={handleButtonClick}
          disabled={isLoading}
          color="#007BFF" // Set the button color as needed
        />
      </View>
      
    </View>
  );
};

export default FacultyAttendance;

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
  icon: {
    marginRight: 5,
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
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});

const styles1 = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    paddingHorizontal: 55,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 15,
    padding: 10, // Keep vertical padding
    paddingHorizontal: 22, // Add horizontal padding
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#007BF0',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
