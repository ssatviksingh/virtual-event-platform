import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import EventCard from "../components/EventCard";
import api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { useLayoutEffect } from "react";

const HomeScreen = () => { 
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { darkMode, toggleTheme } = useTheme();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState<"upcoming" | "past">("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  //Universal dark mode toggle 
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 16 }}>
          <Text style={{ color: darkMode ? "#fff" : "#000", fontSize: 16 }}>
            {darkMode ? "☀️" : "🌙"} // dark mode toggle
          </Text>
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: darkMode ? "#121212" : "#fff", // dark mode toggle
      },
      headerTintColor: darkMode ? "#fff" : "#000",
    });
  }, [navigation, darkMode]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token"); // remove token from async storage  
    await AsyncStorage.removeItem("user"); // remove user from async storage  

    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  const fetchEvents = async () => {
    try {
      setLoading(true); // set loading to true
      const res = await api.get("/events");
      console.log("📅 Raw Events:", res.data);
      setEvents(res.data); // set events
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error("❌ Failed to load events:", err.message); // log error
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(
    () => {
      if (isFocused) {
        fetchEvents(); // fetch events
        loadFavorites();
      }
    },
    [isFocused],
    [showOnlyFavorites]
  );

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem("favorites"); // get favorites from async storage
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load favorites:", e.message); // log error
    }
  };

  const parseDate = (str: string) => new Date(`${str}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events.filter((e) => parseDate(e.date) >= today); // filter events by date
  const pastEvents = events.filter((e) => parseDate(e.date) < today); // filter events by date

  const eventsToShow = viewType === "upcoming" ? upcomingEvents : pastEvents;

  const filteredBySearch = eventsToShow.filter((event) => { // filter events by search query
    const q = searchQuery.toLowerCase();
    return (
      event.title.toLowerCase().includes(q) ||
      event.speaker.toLowerCase().includes(q) ||
      event.date.includes(q)
    );
  });

  const displayedEvents = showOnlyFavorites
    ? filteredBySearch.filter((e) => favorites.includes(e._id)) // filter events by favorites ids
    : filteredBySearch;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: darkMode ? "#121212" : "#f2f2f2" }, // dark mode toggle 
      ]}
    >
      <Text
        style={[
          styles.header,
          { color: darkMode ? "#fff" : "#000" }, // dynamic text color
        ]}
      >
        {viewType === "upcoming" ? "Upcoming Events" : "Past Events"} // view type
      </Text>

      {/* Toggle buttons */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            {
              backgroundColor:
                viewType === "upcoming" // view type
                  ? "#4CAF50"
                  : darkMode
                  ? "#333"
                  : "#ccc",
            },
          ]}
          onPress={() => setViewType("upcoming")} // set view type to upcoming
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Upcoming</Text> // upcoming text
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            {
              backgroundColor:
                viewType === "past" ? "#4CAF50" : darkMode ? "#333" : "#ccc", // view type
            },
          ]}
          onPress={() => setViewType("past")} // set view type to past
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Past</Text> // past text
        </TouchableOpacity>
      </View>

      {/* 🔍 Search Bar */}
      <TextInput
        style={[
          styles.searchInput,
          {
            backgroundColor: darkMode ? "#1e1e1e" : "#fff", // dark mode toggle
            color: darkMode ? "#fff" : "#000",
            borderColor: darkMode ? "#555" : "#ccc",
          },
        ]}
        placeholder="Search by title or speaker"
        placeholderTextColor={darkMode ? "#aaa" : "#888"}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <TouchableOpacity
        onPress={() => setShowOnlyFavorites((prev) => !prev)} // set show only favorites to the opposite of the current state
        style={{
          alignSelf: "center",
          marginBottom: 12,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 16,
          backgroundColor: "#FFD700",
        }}
      >
        <Text style={{ fontWeight: "bold", color: "#000" }}>
          {showOnlyFavorites ? "⭐ Showing Favorites" : "📋 All Events"} // show only favorites text
        </Text>
      </TouchableOpacity>

      {/* Event list */}
      <FlatList
        data={displayedEvents}
        keyExtractor={(item) => item._id} // key extractor
        renderItem={({ item }) => (
          <EventCard
            id={item._id}
            title={item.title} // title
            date={item.date} // date  
            speaker={item.speaker} // speaker
            joinedCount={item.joinedCount}
            onPress={() => navigation.navigate("EventDetail", { event: item })}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No {viewType} events found.</Text> // empty text
        }
        contentContainerStyle={{ paddingBottom: 140 }}
        refreshing={loading}
        onRefresh={fetchEvents} // fetch events
      />

      {/* 🔐 Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text> // logout text
      </TouchableOpacity>

      {/* + Create Event */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("CreateEvent")} // navigate to create event
      >
        <Text style={styles.fabText}>+</Text> // fab text
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: "#f2f2f2",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#ccc",
    marginHorizontal: 5,
  },
  activeToggle: {
    backgroundColor: "#4CAF50",
  },
  toggleText: {
    color: "#fff",
    fontWeight: "bold",
  },
  searchInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    fontSize: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
  },
  createButton: {
    backgroundColor: "#2196F3",
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  createText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: "#f44336",
    padding: 12,
    margin: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 100,
  },
  fabText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 2,
  },
});
