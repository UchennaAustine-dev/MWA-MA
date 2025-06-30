import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  SafeAreaView,
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
  minimumDate,
}: DatePickerModalProps) {
  const [tempDate, setTempDate] = useState(selectedDate);

  // Update tempDate when selectedDate changes
  useEffect(() => {
    if (visible) {
      setTempDate(selectedDate);
    }
  }, [visible, selectedDate]);

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      // On Android, the picker closes automatically
      if (event.type === "set" && date) {
        onSelectDate(date);
      }
      onClose();
    } else {
      // On iOS, update temp date
      if (date) {
        setTempDate(date);
      }
    }
  };

  const handleConfirm = () => {
    onSelectDate(tempDate);
    onClose();
  };

  const handleCancel = () => {
    setTempDate(selectedDate); // Reset to original date
    onClose();
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  // For Android, render the native picker directly
  if (Platform.OS === "android" && visible) {
    return (
      <DateTimePicker
        value={selectedDate}
        mode="date"
        display="default"
        minimumDate={minimumDate}
        onChange={handleDateChange}
      />
    );
  }

  // For iOS, render custom modal
  if (Platform.OS === "ios") {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancel}
      >
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleCancel}
              style={styles.headerButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity
              onPress={handleConfirm}
              style={styles.headerButton}
            >
              <Text style={styles.confirmButtonText}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Selected Date Display */}
          <View style={styles.selectedDateContainer}>
            <Ionicons name="calendar" size={24} color="#007AFF" />
            <Text style={styles.selectedDateText}>{formatDate(tempDate)}</Text>
          </View>

          {/* Date Picker */}
          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              minimumDate={minimumDate}
              onChange={handleDateChange}
              style={styles.picker}
              textColor="#000"
            />
          </View>

          {/* Bottom Actions */}
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.todayButton}
              onPress={() => setTempDate(new Date())}
            >
              <Text style={styles.todayButtonText}>Today</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
  },
  confirmButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  selectedDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    backgroundColor: "#f8f9fa",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    gap: 12,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  pickerContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  picker: {
    height: 200,
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  todayButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  todayButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
});
