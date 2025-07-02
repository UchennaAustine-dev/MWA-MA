// import { Ionicons } from "@expo/vector-icons";
// import axios from "axios";
// import { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   FlatList,
//   Modal,
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import type { City } from "../types/flight-types";

// interface CitySearchModalProps {
//   visible: boolean;
//   onClose: () => void;
//   onSelectCity: (city: City) => void;
//   title: string;
//   selectedCity?: City;
// }

// export default function CitySearchModal({
//   visible,
//   onClose,
//   onSelectCity,
//   title,
//   selectedCity,
// }: CitySearchModalProps) {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [suggestions, setSuggestions] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);

//   const fetchSuggestions = async (keyword: string) => {
//     if (keyword.length < 2) {
//       setSuggestions([]);
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.get(
//         "https://api.manwhitaroes.com/flight/search",
//         { params: { keyword } }
//       );
//       setSuggestions(response?.data || []);
//     } catch (error) {
//       console.error("Error fetching city suggestions:", error);
//       setSuggestions([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const timeoutId = setTimeout(() => {
//       if (searchTerm) {
//         fetchSuggestions(searchTerm);
//       }
//     }, 300);

//     return () => clearTimeout(timeoutId);
//   }, [searchTerm]);

//   const handleSelectCity = (item: any) => {
//     const city: City = {
//       code: item?.iataCode || "",
//       name: toTitleCase(item?.name || ""),
//       country: toTitleCase(item?.countryName || ""),
//       fullName: toTitleCase(item?.name || ""),
//       airport: item?.airport || "",
//     };
//     onSelectCity(city);
//     setSearchTerm("");
//     setSuggestions([]);
//     onClose();
//   };

//   const toTitleCase = (str: string): string => {
//     if (!str) return "";
//     return str
//       .toLowerCase()
//       .split(" ")
//       .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//       .join(" ");
//   };

//   const renderCityItem = ({ item }: { item: any }) => (
//     <TouchableOpacity
//       style={styles.cityItem}
//       onPress={() => handleSelectCity(item)}
//     >
//       <View style={styles.cityItemContent}>
//         <Ionicons name="airplane" size={20} color="#666" />
//         <View style={styles.cityInfo}>
//           <Text style={styles.cityName}>{toTitleCase(item?.name || "")}</Text>
//           <Text style={styles.cityDetails}>
//             {item?.airport ? `${toTitleCase(item.airport)}, ` : ""}
//             {toTitleCase(item?.countryName || "")}
//           </Text>
//         </View>
//         <Text style={styles.cityCode}>{item?.iataCode}</Text>
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       presentationStyle="pageSheet"
//     >
//       <SafeAreaView style={styles.container}>
//         <View style={styles.header}>
//           <Text style={styles.title}>{title}</Text>
//           <TouchableOpacity onPress={onClose} style={styles.closeButton}>
//             <Ionicons name="close" size={24} color="#333" />
//           </TouchableOpacity>
//         </View>

//         <View style={styles.searchContainer}>
//           <Ionicons
//             name="search"
//             size={20}
//             color="#666"
//             style={styles.searchIcon}
//           />
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Search cities..."
//             value={searchTerm}
//             onChangeText={setSearchTerm}
//             autoFocus
//           />
//           {loading && (
//             <ActivityIndicator
//               size="small"
//               color="#007AFF"
//               style={styles.loadingIcon}
//             />
//           )}
//         </View>

//         {selectedCity?.name && (
//           <View style={styles.selectedCityContainer}>
//             <Text style={styles.selectedCityLabel}>Currently Selected:</Text>
//             <View style={styles.selectedCity}>
//               <Text style={styles.selectedCityName}>{selectedCity.name}</Text>
//               <Text style={styles.selectedCityCode}>{selectedCity.code}</Text>
//             </View>
//           </View>
//         )}

//         <FlatList
//           data={suggestions}
//           renderItem={renderCityItem}
//           keyExtractor={(item, index) => `${item.iataCode}-${index}`}
//           style={styles.list}
//           showsVerticalScrollIndicator={false}
//           ListEmptyComponent={
//             searchTerm.length >= 2 && !loading ? (
//               <View style={styles.emptyContainer}>
//                 <Text style={styles.emptyText}>No cities found</Text>
//               </View>
//             ) : null
//           }
//         />
//       </SafeAreaView>
//     </Modal>
//   );
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
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#eee",
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   closeButton: {
//     padding: 4,
//   },
//   searchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     margin: 16,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     backgroundColor: "#f5f5f5",
//     borderRadius: 8,
//   },
//   searchIcon: {
//     marginRight: 8,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 16,
//     color: "#333",
//   },
//   loadingIcon: {
//     marginLeft: 8,
//   },
//   selectedCityContainer: {
//     margin: 16,
//     marginTop: 0,
//     padding: 12,
//     backgroundColor: "#e3f2fd",
//     borderRadius: 8,
//   },
//   selectedCityLabel: {
//     fontSize: 12,
//     color: "#666",
//     marginBottom: 4,
//   },
//   selectedCity: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   selectedCityName: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#333",
//   },
//   selectedCityCode: {
//     fontSize: 14,
//     color: "#666",
//     fontWeight: "500",
//   },
//   list: {
//     flex: 1,
//   },
//   cityItem: {
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f0f0f0",
//   },
//   cityItemContent: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   cityInfo: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   cityName: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#333",
//     marginBottom: 2,
//   },
//   cityDetails: {
//     fontSize: 14,
//     color: "#666",
//   },
//   cityCode: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#007AFF",
//   },
//   emptyContainer: {
//     padding: 32,
//     alignItems: "center",
//   },
//   emptyText: {
//     fontSize: 16,
//     color: "#666",
//   },
// });

import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAirportDetails } from "../hooks/useAirportDetails";
import type { City } from "../types/flight-types";

interface CitySearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCity: (city: City) => void;
  title: string;
  selectedCity?: City;
}

interface CityItemProps {
  item: any;
  onSelect: (item: any) => void;
}

const CityItem = ({ item, onSelect }: CityItemProps) => {
  const { airportDetails, loading } = useAirportDetails(item?.iataCode);

  const toTitleCase = (str: string): string => {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <TouchableOpacity style={styles.cityItem} onPress={() => onSelect(item)}>
      <View style={styles.cityItemContent}>
        <Ionicons name="airplane" size={20} color="#666" />
        <View style={styles.cityInfo}>
          <Text style={styles.cityName}>
            {airportDetails?.name || toTitleCase(item?.name || "")}
          </Text>
          <Text style={styles.cityDetails}>
            {airportDetails?.city || toTitleCase(item?.name || "")}
            {airportDetails?.country && `, ${airportDetails.country}`}
            {!airportDetails?.country &&
              item?.countryName &&
              `, ${toTitleCase(item.countryName)}`}
          </Text>
          {/* {airportDetails?.timezone && <Text style={styles.cityTimezone}>Timezone: {airportDetails.timezone}</Text>} */}
        </View>
        <View style={styles.cityCodeContainer}>
          <Text style={styles.cityCode}>{item?.iataCode}</Text>
          {loading && <ActivityIndicator size="small" color="#007AFF" />}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function CitySearchModal({
  visible,
  onClose,
  onSelectCity,
  title,
  selectedCity,
}: CitySearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async (keyword: string) => {
    if (keyword.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        "https://api.manwhitaroes.com/flight/search",
        {
          params: { keyword },
        }
      );
      setSuggestions(response?.data || []);
    } catch (error) {
      console.error("Error fetching city suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        fetchSuggestions(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSelectCity = (item: any) => {
    const toTitleCase = (str: string): string => {
      if (!str) return "";
      return str
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    const city: City = {
      code: item?.iataCode || "",
      name: toTitleCase(item?.name || ""),
      country: toTitleCase(item?.countryName || ""),
      fullName: toTitleCase(item?.name || ""),
      airport: item?.airport || "",
    };
    onSelectCity(city);
    setSearchTerm("");
    setSuggestions([]);
    onClose();
  };

  const renderCityItem = ({ item }: { item: any }) => (
    <CityItem item={item} onSelect={handleSelectCity} />
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
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
            placeholder="Search cities or airports..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            autoFocus
          />
          {loading && (
            <ActivityIndicator
              size="small"
              color="#007AFF"
              style={styles.loadingIcon}
            />
          )}
        </View>

        {selectedCity?.name && (
          <View style={styles.selectedCityContainer}>
            <Text style={styles.selectedCityLabel}>Currently Selected:</Text>
            <View style={styles.selectedCity}>
              <Text style={styles.selectedCityName}>{selectedCity.name}</Text>
              <Text style={styles.selectedCityCode}>{selectedCity.code}</Text>
            </View>
          </View>
        )}

        <FlatList
          data={suggestions}
          renderItem={renderCityItem}
          keyExtractor={(item, index) => `${item.iataCode}-${index}`}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            searchTerm.length >= 2 && !loading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No cities found</Text>
              </View>
            ) : null
          }
        />
      </SafeAreaView>
    </Modal>
  );
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  loadingIcon: {
    marginLeft: 8,
  },
  selectedCityContainer: {
    margin: 16,
    marginTop: 0,
    padding: 12,
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
  },
  selectedCityLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  selectedCity: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedCityName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  selectedCityCode: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  list: {
    flex: 1,
  },
  cityItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  cityItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cityInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cityName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  cityDetails: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  cityTimezone: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
  cityCodeContainer: {
    alignItems: "center",
    minWidth: 60,
  },
  cityCode: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 4,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});
