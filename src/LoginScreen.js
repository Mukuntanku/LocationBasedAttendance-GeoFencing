import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, StyleSheet, SafeAreaView, Alert } from 'react-native';
import axios from 'axios';
import * as Application from 'expo-application';
import * as Device from 'expo-device';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [deviceid, setDeviceId] = useState(null);
  const [osName, setOsName] = useState(Device.osName);

  useEffect(() => {
    // Get OS name
    setOsName(Device.osName);

    // Get Device ID
    const fetchDeviceId = async () => {
      try {
        let id;
        if (osName === 'Android' || osName.includes('OnePlus')) {
          id = await Application.androidId;
        } else {
          id = await Application.getIosIdForVendorAsync();
        }
        setDeviceId(id);
      } catch (error) {
        console.error('Error fetching device ID:', error);
      }
    };
    fetchDeviceId();
  }, [osName]);

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://192.168.156.249:5000/login', {
        email,
        password,
        deviceid
      });
      if(response.data.message === 'mismatch') {
        Alert.alert('Device Mismatch', 'You are not authorized to login from this device.');
        return;
      }
      setRole(response.data.role);

      if (role === 'admin') {
        navigation.navigate('Admin');
      } else if (role === 'faculty') {
        navigation.navigate('Faculty', {
          screen: 'FacultyHome'
        });
      } else if (role === 'student') {
        navigation.navigate('Student', {
          screen: 'StudentHome'
        });
      }
    } catch (error) {
      Alert.alert('Login Failed', 'Incorrect email or password. Please try again.');
    }
  };

  return (
    <SafeAreaView style={{flex:1, justifyContent: 'center'}}>
      <View style={styles.container}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <View style={{ marginTop: 10, borderRadius: 8, overflow: 'hidden', width: '30%' }}>
          <Button
            title="Login"
            onPress={handleLogin}
            color="#007BFF" // Set the button color as needed
          />
        </View>
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '80%',
    height: 40,
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
});

export default LoginScreen;
