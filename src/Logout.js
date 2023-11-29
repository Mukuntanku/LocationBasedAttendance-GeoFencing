import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import axios from 'axios';

const Logout = ({ navigation }) => {

  useEffect(() => {
    handleLogout();
  }, []);

  const handleLogout = () => {
    navigation.navigate('Login');
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
