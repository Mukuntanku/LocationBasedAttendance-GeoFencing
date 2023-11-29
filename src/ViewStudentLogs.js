import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Button } from 'react-native';
import axios from 'axios';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';

const AttendanceSummaryTable = ({ attendanceSummary }) => {
  if (!attendanceSummary || attendanceSummary.length === 0) {
    return null;
  }

  return (
    <View style={styles.tableContainer}>
      <Text style={styles.tableHeader}>Attendance Summary</Text>
      <View style={styles.tableRow}>
        <Text style={styles.tableCellHeader}>Course Code</Text>
        <Text style={styles.tableCellHeader}>Student Reg</Text>
        <Text style={styles.tableCellHeader}>Date</Text>
      </View>
      {attendanceSummary.map((item, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={styles.tableCell}>{item.course_code}</Text>
          <Text style={styles.tableCell}>{item.regid}</Text>
          <Text style={styles.tableCell}>{item.date}</Text>
        </View>
      ))}
    </View>
  );
};

const ViewStudentLogs = ({ navigation }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const [courseValue, setCourseValue] = useState('defaultValue');
  const [courseData, setCourseData] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [attendanceSummary, setAttendanceSummary] = useState(null);

  useEffect(() => {
    // Fetch user details when the component mounts
    const fetchDetails = async () => {
      try {
        const response = await axios.get('http://192.168.156.249:5000/getUserDetails');
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

  useEffect(() => {
    if (userDetails) {
      const data = {
        email: userDetails.email,
        regid: userDetails.regid,
      };

      const fetchCourses = async () => {
        try {
          const response = await axios.post('http://192.168.156.249:5000/get_facultycourse', data);
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

  const renderLabelDate = () => {
    if (courseValue || isFocus) {
      return (
        <Text style={[styles.label, isFocus && { color: 'black' }]}>
          Select Date
        </Text>
      );
    }
    return null;
  };

const fetchAttendanceSummary = () => {
  try {
    if (courseValue === 'defaultValue') {
      alert('Please Select A Course!!');
      return;
    }

    const formattedDate = startDate.toLocaleDateString('en-CA'); // Specify the locale to ensure the correct date format
    const mysqlFormattedDate = formattedDate.split('/').reverse().join('-');

    const data = {
      regid: userDetails.regid,
      course: courseValue,
      date: mysqlFormattedDate,
    };
    console.log(data);

    axios.post('http://192.168.156.249:5000/fetch_studentattendance_logs', data)
      .then(response => {
        if (response.data.status === 'no_records') {
          alert(response.data.message);
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
          setAttendanceSummary(null);
        }}
      />

      <View style={styles.datePickerContainer}>
        <Text style={styles.dateLabel}>{renderLabelDate()}</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateText}>{startDate.toDateString()}</Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(Platform.OS === 'ios'); // Close the date picker on iOS immediately
            if (selectedDate) {
              setStartDate(selectedDate);
              setAttendanceSummary(null);
            }
          }}
        />
      )}

      <View style={{ marginTop: 10, borderRadius: 8, overflow: 'hidden' }}>
        <Button
          title="Attendance Summary"
          onPress={fetchAttendanceSummary}
          color="#007BFF"
          titleStyle={styles.buttonTitle} // Added titleStyle to apply specific styles to the button text
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
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginTop: 20,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 16,
    paddingVertical: 10,
  },
  buttonTitle: {
    fontSize: 16, // Adjust the font size as needed
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
    textAlign: 'center',
    marginRight: 5,
  },
  tableCell: {
    fontSize: 10,
    flex: 1,
    textAlign: 'center',
    marginRight: 5,
  },
});

export default ViewStudentLogs;