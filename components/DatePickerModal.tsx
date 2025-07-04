// import { Ionicons } from "@expo/vector-icons";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import { useEffect, useState } from "react";
// import {
//   Modal,
//   Platform,
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// interface DatePickerModalProps {
//   visible: boolean;
//   onClose: () => void;
//   onSelectDate: (date: Date) => void;
//   title: string;
//   selectedDate: Date;
//   minimumDate?: Date;
// }

// export default function DatePickerModal({
//   visible,
//   onClose,
//   onSelectDate,
//   title,
//   selectedDate,
//   minimumDate,
// }: DatePickerModalProps) {
//   const [tempDate, setTempDate] = useState(selectedDate);

//   // Update tempDate when selectedDate changes
//   useEffect(() => {
//     if (visible) {
//       setTempDate(selectedDate);
//     }
//   }, [visible, selectedDate]);

//   const handleDateChange = (event: any, date?: Date) => {
//     if (Platform.OS === "android") {
//       // On Android, the picker closes automatically
//       if (event.type === "set" && date) {
//         onSelectDate(date);
//       }
//       onClose();
//     } else {
//       // On iOS, update temp date
//       if (date) {
//         setTempDate(date);
//       }
//     }
//   };

//   const handleConfirm = () => {
//     onSelectDate(tempDate);
//     onClose();
//   };

//   const handleCancel = () => {
//     setTempDate(selectedDate); // Reset to original date
//     onClose();
//   };

//   const formatDate = (date: Date) => {
//     const options: Intl.DateTimeFormatOptions = {
//       weekday: "long",
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     };
//     return date.toLocaleDateString("en-US", options);
//   };

//   // For Android, render the native picker directly
//   if (Platform.OS === "android" && visible) {
//     return (
//       <DateTimePicker
//         value={selectedDate}
//         mode="date"
//         display="default"
//         minimumDate={minimumDate}
//         onChange={handleDateChange}
//       />
//     );
//   }

//   // For iOS, render custom modal
//   if (Platform.OS === "ios") {
//     return (
//       <Modal
//         visible={visible}
//         animationType="slide"
//         presentationStyle="pageSheet"
//         onRequestClose={handleCancel}
//       >
//         <SafeAreaView style={styles.container}>
//           {/* Header */}
//           <View style={styles.header}>
//             <TouchableOpacity
//               onPress={handleCancel}
//               style={styles.headerButton}
//             >
//               <Text style={styles.cancelButtonText}>Cancel</Text>
//             </TouchableOpacity>
//             <Text style={styles.title}>{title}</Text>
//             <TouchableOpacity
//               onPress={handleConfirm}
//               style={styles.headerButton}
//             >
//               <Text style={styles.confirmButtonText}>Done</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Selected Date Display */}
//           <View style={styles.selectedDateContainer}>
//             <Ionicons name="calendar" size={24} color="#007AFF" />
//             <Text style={styles.selectedDateText}>{formatDate(tempDate)}</Text>
//           </View>

//           {/* Date Picker */}
//           <View style={styles.pickerContainer}>
//             <DateTimePicker
//               value={tempDate}
//               mode="date"
//               display="spinner"
//               minimumDate={minimumDate}
//               onChange={handleDateChange}
//               style={styles.picker}
//               textColor="#000"
//             />
//           </View>

//           {/* Bottom Actions */}
//           <View style={styles.bottomActions}>
//             <TouchableOpacity
//               style={styles.todayButton}
//               onPress={() => setTempDate(new Date())}
//             >
//               <Text style={styles.todayButtonText}>Today</Text>
//             </TouchableOpacity>
//           </View>
//         </SafeAreaView>
//       </Modal>
//     );
//   }

//   return null;
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e0e0e0",
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#333",
//   },
//   headerButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 4,
//   },
//   cancelButtonText: {
//     fontSize: 16,
//     color: "#666",
//   },
//   confirmButtonText: {
//     fontSize: 16,
//     color: "#007AFF",
//     fontWeight: "600",
//   },
//   selectedDateContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 24,
//     backgroundColor: "#f8f9fa",
//     marginHorizontal: 20,
//     marginTop: 20,
//     borderRadius: 12,
//     gap: 12,
//   },
//   selectedDateText: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#333",
//   },
//   pickerContainer: {
//     flex: 1,
//     justifyContent: "center",
//     paddingHorizontal: 20,
//   },
//   picker: {
//     height: 200,
//   },
//   bottomActions: {
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//   },
//   todayButton: {
//     backgroundColor: "#f0f0f0",
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   todayButtonText: {
//     fontSize: 16,
//     color: "#007AFF",
//     fontWeight: "500",
//   },
// });
"use client";

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  title: string;
  selectedDate: Date;
  minimumDate?: Date;
}

export default function DatePickerModal({
  visible,
  onClose,
  onSelectDate,
  title,
  selectedDate,
  minimumDate = new Date(),
}: DatePickerModalProps) {
  const [currentMonth, setCurrentMonth] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateDisabled = (date: Date) => {
    return date < minimumDate;
  };

  const isDateSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    if (!isDateDisabled(newDate)) {
      onSelectDate(newDate);
      onClose();
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const disabled = isDateDisabled(date);
      const selected = isDateSelected(date);

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            selected && styles.selectedDay,
            disabled && styles.disabledDay,
          ]}
          onPress={() => handleDateSelect(day)}
          disabled={disabled}
        >
          <Text
            style={[
              styles.dayText,
              selected && styles.selectedDayText,
              disabled && styles.disabledDayText,
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#000000" />
            </TouchableOpacity>
          </View>

          {/* Month Navigation */}
          <View style={styles.monthNavigation}>
            <TouchableOpacity
              onPress={() => navigateMonth("prev")}
              style={styles.navButton}
            >
              <Ionicons name="chevron-back" size={24} color="#DC2626" />
            </TouchableOpacity>
            <Text style={styles.monthText}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            <TouchableOpacity
              onPress={() => navigateMonth("next")}
              style={styles.navButton}
            >
              <Ionicons name="chevron-forward" size={24} color="#DC2626" />
            </TouchableOpacity>
          </View>

          {/* Day Headers */}
          <View style={styles.dayHeaders}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <Text key={day} style={styles.dayHeader}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <ScrollView
            style={styles.calendarContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.calendar}>{renderCalendar()}</View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    fontFamily: "RedHatDisplay-Bold",
  },
  closeButton: {
    padding: 4,
  },
  monthNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  navButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
  },
  monthText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    fontFamily: "RedHatDisplay-Regular",
  },
  dayHeaders: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  dayHeader: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: "#666666",
    fontFamily: "Inter",
  },
  calendarContainer: {
    maxHeight: 300,
  },
  calendar: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 2,
  },
  selectedDay: {
    backgroundColor: "#DC2626",
    borderRadius: 20,
  },
  disabledDay: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 16,
    color: "#000000",
    fontFamily: "Inter",
  },
  selectedDayText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  disabledDayText: {
    color: "#CCCCCC",
  },
});
