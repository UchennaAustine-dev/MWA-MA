import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Country {
  name: string;
  iso2: string;
  dialCode: string;
  flag: string;
}

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: any;
  disabled?: boolean;
  error?: boolean;
}

const POPULAR_COUNTRIES = [
  "US",
  "GB",
  "CA",
  "AU",
  "DE",
  "FR",
  "NG",
  "IN",
  "CN",
  "JP",
];

export default function PhoneInput({
  value,
  onChange,
  placeholder = "Enter phone number",
  style,
  disabled = false,
  error = false,
}: PhoneInputProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const isInitialized = useRef(false);
  const lastEmittedValue = useRef("");

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2,idd,flag"
        );
        const data = await response.json();

        const formattedCountries: Country[] = data
          .filter(
            (country: any) => country.idd?.root && country.idd?.suffixes?.[0]
          )
          .map((country: any) => ({
            name: country.name.common,
            iso2: country.cca2,
            dialCode: `${country.idd.root}${country.idd.suffixes[0]}`,
            flag: country.flag,
          }))
          .sort((a: Country, b: Country) => {
            const aIsPopular = POPULAR_COUNTRIES.includes(a.iso2);
            const bIsPopular = POPULAR_COUNTRIES.includes(b.iso2);

            if (aIsPopular && !bIsPopular) return -1;
            if (!aIsPopular && bIsPopular) return 1;
            if (aIsPopular && bIsPopular) {
              return (
                POPULAR_COUNTRIES.indexOf(a.iso2) -
                POPULAR_COUNTRIES.indexOf(b.iso2)
              );
            }
            return a.name.localeCompare(b.name);
          });

        setCountries(formattedCountries);

        const defaultCountry =
          formattedCountries.find((c) => c.iso2 === "NG") ||
          formattedCountries[0];
        if (defaultCountry) {
          setSelectedCountry(defaultCountry);
        }
      } catch (error) {
        console.error("Failed to fetch countries:", error);
        const fallbackCountries: Country[] = [
          { name: "Nigeria", iso2: "NG", dialCode: "+234", flag: "🇳🇬" },
          { name: "United States", iso2: "US", dialCode: "+1", flag: "🇺🇸" },
          { name: "United Kingdom", iso2: "GB", dialCode: "+44", flag: "🇬🇧" },
          { name: "Canada", iso2: "CA", dialCode: "+1", flag: "🇨🇦" },
        ];
        setCountries(fallbackCountries);
        setSelectedCountry(fallbackCountries[0]);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    if (!isInitialized.current && countries.length > 0 && selectedCountry) {
      if (value && value !== selectedCountry.dialCode) {
        const matchedCountry = countries.find((country) =>
          value.startsWith(country.dialCode)
        );

        if (matchedCountry) {
          setSelectedCountry(matchedCountry);
          setPhoneNumber(value.substring(matchedCountry.dialCode.length));
        } else {
          setPhoneNumber(value);
        }
      }
      isInitialized.current = true;
    }
  }, [value, countries, selectedCountry]);

  useEffect(() => {
    if (isInitialized.current && selectedCountry) {
      const fullNumber = phoneNumber
        ? `${selectedCountry.dialCode}${phoneNumber}`
        : selectedCountry.dialCode;

      if (fullNumber !== lastEmittedValue.current) {
        lastEmittedValue.current = fullNumber;
        onChange(fullNumber);
      }
    }
  }, [selectedCountry, phoneNumber, onChange]);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowModal(false);
    setSearchTerm("");
  };

  const handlePhoneChange = (text: string) => {
    const newPhoneNumber = text.replace(/[^\d]/g, "");
    setPhoneNumber(newPhoneNumber);
  };

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.dialCode.includes(searchTerm) ||
      country.iso2.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderCountryItem = ({ item }: { item: Country }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => handleCountrySelect(item)}
    >
      <Text style={styles.flag}>{item.flag}</Text>
      <View style={styles.countryInfo}>
        <Text style={styles.countryName}>{item.name}</Text>
        <Text style={styles.dialCode}>{item.dialCode}</Text>
      </View>
      {selectedCountry?.iso2 === item.iso2 && (
        <View style={styles.selectedIndicator} />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.countrySelector}>
          <ActivityIndicator size="small" color="#666" />
        </View>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          placeholder="Loading..."
          editable={false}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.countrySelector, error && styles.errorBorder]}
        onPress={() => setShowModal(true)}
        disabled={disabled}
      >
        <Text style={styles.flag}>{selectedCountry?.flag}</Text>
        <Text style={styles.selectedDialCode}>{selectedCountry?.dialCode}</Text>
        <Ionicons name="chevron-down" size={16} color="#666" />
      </TouchableOpacity>

      <TextInput
        style={[
          styles.input,
          error && styles.errorBorder,
          disabled && styles.disabledInput,
        ]}
        value={phoneNumber}
        onChangeText={handlePhoneChange}
        placeholder={placeholder}
        keyboardType="phone-pad"
        editable={!disabled}
      />

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#666"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search countries..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              autoFocus
            />
          </View>

          <FlatList
            data={filteredCountries}
            renderItem={renderCountryItem}
            keyExtractor={(item) => item.iso2}
            style={styles.countryList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    overflow: "hidden",
  },
  countrySelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#f9fafb",
    borderRightWidth: 1,
    borderRightColor: "#d1d5db",
    minWidth: 100,
  },
  flag: {
    fontSize: 18,
    marginRight: 8,
  },
  selectedDialCode: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginRight: 4,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  disabledInput: {
    backgroundColor: "#f9fafb",
    color: "#9ca3af",
  },
  errorBorder: {
    borderColor: "#ef4444",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  countryList: {
    flex: 1,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  countryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  countryName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  dialCode: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
  },
});
