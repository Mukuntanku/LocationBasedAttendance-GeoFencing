import React, { useEffect } from 'react';
import { View, StyleSheet, Button, Alert } from 'react-native';
import axios from 'axios';
import { BASE_URL } from './apiConfig';

const Logout = ({ navigation }) => {
  useEffect(() => {
    handleLogout();
  }, []);

  const handleLogout = async () => {
    try {
      // Send a request to the server to clear cookies (invalidate JWT)
      await axios.post(`${BASE_URL}/logout`);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Logout failed', error);
      Alert.alert('Error', 'Logout failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}></View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Logout;
