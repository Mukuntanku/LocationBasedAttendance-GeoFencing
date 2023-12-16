import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import axios from 'axios';
import { Dropdown } from 'react-native-element-dropdown';

const AttendanceSummaryTable = ({ attendanceSummary }) => {
  if (!attendanceSummary || attendanceSummary.length === 0) {
    return null;
  }

  return (
    <View style={styles.tableContainer}>
      <Text style={styles.tableHeader}>Attendance Summary (Dates Present)</Text>
      <View style={styles.tableRow}>
        <Text style={styles.tableCellHeader}>Course Code</Text>
        <Text style={styles.tableCellHeader}>Date</Text>
      </View>
      {attendanceSummary.map((item, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={styles.tableCell}>{item.course_code}</Text>
          <Text style={styles.tableCell}>{item.date}</Text>
        </View>
      ))}
    </View>
  );
};

const StudentLogs = ({ navigation }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const [courseValue, setCourseValue] = useState('defaultValue');
  const [courseData, setCourseData] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);

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

  useEffect(() => {
    if (userDetails) {
      const data = {
        email: userDetails.email,
      };

      const fetchCourses = async () => {
        try {
          const response = await axios.post('http://192.168.120.249:5000/get_studentcourse', data);
          if (response.data.message === 'success') {
            setCourseData(response.data.course);
          } else {
            console.error('Error fetching user details:', response.data);
          }
        } catch (error) {
          console.error('Error fetching details:', error);
        }
      };

      fetchCourses();
    }
  }, [userDetails]);

  const renderLabelCourse = () => {
    if (courseValue || isFocus) {
      return (
        <Text style={[styles.label, isFocus && { color: 'black' }]}>
          Select Course
        </Text>
      );
    }
    return null;
  };

  const summary = () => {
    try {
      if (courseValue === 'defaultValue') {
        alert('Please Select A Course!!');
        setAttendanceSummary(null);
        return;
      }

      const data = {
        regid: userDetails.regid,
        course: courseValue,
      };

      axios.post('http://192.168.120.249:5000/fetch_studentattendance', data)
        .then(response => {
          if (response.data.status === 'no_records') {
            alert(response.data.message);
            setAttendanceSummary(null);
          } else if (response.data.status === 'success') {
            setAttendanceSummary(response.data.records);
          }
          return;
        })
        .catch(error => {
          console.error('Error:', error);
        });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      {renderLabelCourse()}
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={courseData || []}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? 'Select course' : '...'}
        searchPlaceholder="Search..."
        value={courseValue}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          setCourseValue(item.value);
          setIsFocus(false);
        }}
      />

      <View style={{ marginTop: 10, borderRadius: 8, overflow: 'hidden' }}>
        <Button
          title="Attendance Summary"
          onPress={summary}
          color="#007BFF"
          titleStyle={styles.buttonTitle}
        />
      </View>

      <AttendanceSummaryTable attendanceSummary={attendanceSummary} />
    </View>
  );
};

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
    fontWeight: 'bold',
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
  buttonTitle: {
    fontSize: 16,
  },
  tableContainer: {
    marginTop: 20,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    padding: 10,
  },
  tableHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: 'gray',
    borderBottomWidth: 0.5,
    paddingVertical: 8,
  },
  tableCellHeader: {
    flex: 1,
    fontWeight: 'bold',
    marginRight: 5,
  },
  tableCell: {
    flex: 1,
    marginRight: 5,
  },
});

export default StudentLogs;
