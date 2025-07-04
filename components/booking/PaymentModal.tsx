import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
} from "react-native-gesture-handler";

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onProceed: () => void;
  totalAmount: number;
  currency?: string;
}

const { height: screenHeight } = Dimensions.get("window");

export default function PaymentModal({
  visible,
  onClose,
  onProceed,
  totalAmount,
  currency = "NGN",
}: PaymentModalProps) {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset translateY when modal opens
      translateY.setValue(0);

      // Slide up animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide down animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropOpacity]);

  const formatCurrency = (amount: number) => {
    const symbol = currency === "NGN" ? "₦" : "$";
    return `${symbol}${Number(amount).toLocaleString()}`;
  };

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const handleStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationY, velocityY } = event.nativeEvent;

      if (translationY > 100 || velocityY > 500) {
        // Close modal
        onClose();
      } else {
        // Snap back to original position
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      }
    }
  };

  const combinedTranslateY = Animated.add(slideAnim, translateY);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={styles.overlay}>
        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity,
            },
          ]}
        >
          <TouchableOpacity style={styles.backdropTouch} onPress={onClose} />
        </Animated.View>

        {/* Modal Content */}
        <PanGestureHandler
          onGestureEvent={handleGestureEvent}
          onHandlerStateChange={handleStateChange}
        >
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ translateY: combinedTranslateY }],
              },
            ]}
          >
            {/* Drag Handle */}
            <View style={styles.dragHandle} />

            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name="shield-checkmark" size={48} color="#10B981" />
              </View>
              <Text style={styles.modalTitle}>Complete Checkout</Text>
              <Text style={styles.modalSubtitle}>
                Secure payment powered by industry-leading encryption
              </Text>
            </View>

            {/* Content */}
            <View style={styles.modalContent}>
              <View style={styles.amountContainer}>
                <Text style={styles.amountLabel}>Total Amount</Text>
                <Text style={styles.amountValue}>
                  {formatCurrency(totalAmount)}
                </Text>
              </View>

              <View style={styles.securityInfo}>
                <View style={styles.securityItem}>
                  <Ionicons name="lock-closed" size={16} color="#10B981" />
                  <Text style={styles.securityText}>
                    256-bit SSL encryption
                  </Text>
                </View>
                <View style={styles.securityItem}>
                  <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                  <Text style={styles.securityText}>PCI DSS compliant</Text>
                </View>
                <View style={styles.securityItem}>
                  <Ionicons name="card" size={16} color="#10B981" />
                  <Text style={styles.securityText}>
                    Multiple payment options
                  </Text>
                </View>
              </View>

              <Text style={styles.redirectText}>
                You'll be securely redirected to our payment gateway to complete
                your transaction.
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.proceedButton}
                onPress={onProceed}
              >
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </PanGestureHandler>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backdropTouch: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34, // Safe area padding
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  modalHeader: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "RedHatDisplay-Bold",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    fontFamily: "Inter",
  },
  modalContent: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  amountContainer: {
    backgroundColor: "#F8F9FA",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  amountLabel: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
    fontFamily: "Inter",
  },
  amountValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#DC2626",
    fontFamily: "RedHatDisplay-Bold",
  },
  securityInfo: {
    marginBottom: 20,
  },
  securityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  securityText: {
    fontSize: 14,
    color: "#374151",
    fontFamily: "Inter",
  },
  redirectText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "Inter",
  },
  modalActions: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#DC2626",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  cancelButtonText: {
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "RedHatDisplay-Regular",
  },
  proceedButton: {
    flex: 2,
    flexDirection: "row",
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  proceedButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "RedHatDisplay-Regular",
  },
});
