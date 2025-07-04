import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

interface ProgressStepsProps {
  currentStep: number;
}

export default function ProgressSteps({ currentStep }: ProgressStepsProps) {
  const steps = [
    { label: "Flight Selected", step: 1, icon: "airplane" },
    { label: "Traveler Info", step: 2, icon: "person" },
    { label: "Payment", step: 3, icon: "card" },
  ];

  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return "completed";
    if (stepNumber === currentStep) return "current";
    return "pending";
  };

  const getStepColors = (status: string) => {
    switch (status) {
      case "completed":
        return {
          dot: "#10B981",
          text: "#10B981",
          line: "#10B981",
        };
      case "current":
        return {
          dot: "#DC2626",
          text: "#DC2626",
          line: "#E5E7EB",
        };
      default:
        return {
          dot: "#E5E7EB",
          text: "#9CA3AF",
          line: "#E5E7EB",
        };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        {steps.map((step, index) => {
          const status = getStepStatus(step.step);
          const colors = getStepColors(status);
          const isLast = index === steps.length - 1;

          return (
            <View key={step.step} style={styles.stepWrapper}>
              {/* Step Content */}
              <View style={styles.stepContent}>
                {/* Step Dot */}
                <View style={[styles.stepDot, { backgroundColor: colors.dot }]}>
                  {status === "completed" ? (
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                  ) : status === "current" ? (
                    <View style={styles.currentDotInner}>
                      <Ionicons
                        name={step.icon as any}
                        size={16}
                        color="#FFFFFF"
                      />
                    </View>
                  ) : (
                    <Text style={[styles.stepNumber, { color: colors.text }]}>
                      {step.step}
                    </Text>
                  )}
                </View>

                {/* Step Label */}
                <View style={styles.labelContainer}>
                  <Text style={[styles.stepLabel, { color: colors.text }]}>
                    {step.label}
                  </Text>
                  {status === "current" && (
                    <View style={styles.currentIndicator} />
                  )}
                </View>
              </View>

              {/* Connecting Line */}
              {!isLast && (
                <View style={styles.lineContainer}>
                  <View
                    style={[styles.stepLine, { backgroundColor: colors.line }]}
                  />
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 4,
    marginBottom: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  stepWrapper: {
    flex: 1,
    alignItems: "center",
    position: "relative",
  },
  stepContent: {
    alignItems: "center",
    zIndex: 2,
  },
  stepDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentDotInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "RedHatDisplay-Bold",
  },
  labelContainer: {
    alignItems: "center",
    minHeight: 40,
  },
  stepLabel: {
    fontSize: 13,
    textAlign: "center",
    fontWeight: "600",
    fontFamily: "Inter",
    lineHeight: 18,
    maxWidth: 80,
  },
  currentIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#DC2626",
    marginTop: 6,
  },
  lineContainer: {
    position: "absolute",
    top: 22,
    left: "50%",
    right: "-50%",
    zIndex: 1,
    alignItems: "center",
  },
  stepLine: {
    height: 3,
    width: "100%",
    borderRadius: 1.5,
  },
  progressBarContainer: {
    paddingHorizontal: 22,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: "#F1F5F9",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 2,
    // transition: "width 0.3s ease",
  },
});
