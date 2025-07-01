import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { memo } from "react";
import { StyleSheet, View } from "react-native";

interface PriceFilterProps {
  priceFilter: string;
  onPriceFilterChange: (filter: string) => void;
  priceRanges: { min: number; max: number; currency: string };
  tourCount: number;
}

function PriceFilter({
  priceFilter,
  onPriceFilterChange,
  priceRanges,
  tourCount,
}: PriceFilterProps) {
  const generatePriceOptions = () => {
    if (tourCount === 0) {
      return [
        { value: "all", label: "All Prices" },
        { value: "low", label: "Under $100" },
        { value: "medium", label: "$100 - $300" },
        { value: "high", label: "Over $300" },
      ];
    }

    const { min, max, currency } = priceRanges;
    const range = max - min;

    const lowThreshold = min + range * 0.33;
    const highThreshold = min + range * 0.67;

    const formatCurrency = (amount: number) => {
      try {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount);
      } catch {
        return `${currency} ${Math.round(amount)}`;
      }
    };

    return [
      { value: "all", label: "All Prices" },
      { value: "low", label: `Under ${formatCurrency(lowThreshold)}` },
      {
        value: "medium",
        label: `${formatCurrency(lowThreshold)} - ${formatCurrency(
          highThreshold
        )}`,
      },
      { value: "high", label: `Over ${formatCurrency(highThreshold)}` },
    ];
  };

  const priceOptions = generatePriceOptions();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="filter" size={20} color="#DC2626" />
      </View>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={priceFilter}
          onValueChange={onPriceFilterChange}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          {priceOptions.map((option) => (
            <Picker.Item
              key={option.value}
              label={option.label}
              value={option.value}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
}

export default memo(PriceFilter);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 180,
  },
  iconContainer: {
    paddingLeft: 12,
  },
  pickerContainer: {
    flex: 1,
  },
  picker: {
    height: 50,
    color: "#000000",
  },
  pickerItem: {
    fontSize: 16,
    color: "#000000",
  },
});
