// Navigation.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import LoginScreen from './src/LoginScreen';
import Logout from './src/Logout'

import FacultyHome from './src/FacultyHome';
import FacultyAttendance from './src/FacultyAttendance';
import FacultyLogs from './src/FacultyLogs';
import GenerateCode from './src/GenerateCode';
import ViewStudentLogs from './src/ViewStudentLogs';

import StudentHome from './src/StudentHome';
import StudentAttendance from './src/StudentAttendance';
import StudentLogs from './src/StudentLogs';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const FacultyDrawer = () => {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="FacultyHome" component={FacultyHome} />
      <Drawer.Screen name="FacultyAttendance" component={FacultyAttendance} />
      <Drawer.Screen name="FacultyLogs" component={FacultyLogs} />
      <Drawer.Screen name="GenerateCode" component={GenerateCode} />
      <Drawer.Screen name="ViewStudentLogs" component={ViewStudentLogs} />
      <Drawer.Screen name="Logout" component={Logout} />
    </Drawer.Navigator>
  );
};

const StudentDrawer = () => {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="StudentHome" component={StudentHome} />
      <Drawer.Screen name="StudentAttendance" component={StudentAttendance} />
      <Drawer.Screen name="StudentLogs" component={StudentLogs} />
      <Drawer.Screen name="Logout" component={Logout} />
    </Drawer.Navigator>
  );
};

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen
        name="Faculty"
        component={FacultyDrawer}
        options={{
          headerShown: false, // Hide the default header
        }}
      />
      <Stack.Screen
        name="Student"
        component={StudentDrawer}
        options={{
          headerShown: false, // Hide the default header
        }}
      />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;