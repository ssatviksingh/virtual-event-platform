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
            {darkMode ? "☀️" : "🌙"}
          </Text>
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: darkMode ? "#121212" : "#fff",
      },
      headerTintColor: darkMode ? "#fff" : "#000",
    });
  }, [navigation, darkMode]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");

    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/events");
      console.log("📅 Raw Events:", res.data);
      setEvents(res.data);
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error("❌ Failed to load events:", err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(
    () => {
      if (isFocused) {
        fetchEvents();
        loadFavorites();
      }
    },
    [isFocused],
    [showOnlyFavorites]
  );

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem("favorites");
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load favorites:", e.message);
    }
  };

  const parseDate = (str: string) => new Date(`${str}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events.filter((e) => parseDate(e.date) >= today);
  const pastEvents = events.filter((e) => parseDate(e.date) < today);

  const eventsToShow = viewType === "upcoming" ? upcomingEvents : pastEvents;

  const filteredBySearch = eventsToShow.filter((event) => {
    const q = searchQuery.toLowerCase();
    return (
      event.title.toLowerCase().includes(q) ||
      event.speaker.toLowerCase().includes(q) ||
      event.date.includes(q)
    );
  });

  const displayedEvents = showOnlyFavorites
    ? filteredBySearch.filter((e) => favorites.includes(e._id))
    : filteredBySearch;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: darkMode ? "#121212" : "#f2f2f2" },
      ]}
    >
      <Text
        style={[
          styles.header,
          { color: darkMode ? "#fff" : "#000" }, // dynamic text color
        ]}
      >
        {viewType === "upcoming" ? "Upcoming Events" : "Past Events"}
      </Text>

      {/* Toggle buttons */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            {
              backgroundColor:
                viewType === "upcoming"
                  ? "#4CAF50"
                  : darkMode
                  ? "#333"
                  : "#ccc",
            },
          ]}
          onPress={() => setViewType("upcoming")}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Upcoming</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            {
              backgroundColor:
                viewType === "past" ? "#4CAF50" : darkMode ? "#333" : "#ccc",
            },
          ]}
          onPress={() => setViewType("past")}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Past</Text>
        </TouchableOpacity>
      </View>

      {/* 🔍 Search Bar */}
      <TextInput
        style={[
          styles.searchInput,
          {
            backgroundColor: darkMode ? "#1e1e1e" : "#fff",
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
        onPress={() => setShowOnlyFavorites((prev) => !prev)}
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
          {showOnlyFavorites ? "⭐ Showing Favorites" : "📋 All Events"}
        </Text>
      </TouchableOpacity>

      {/* Event list */}
      <FlatList
        data={displayedEvents}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <EventCard
            id={item._id}
            title={item.title}
            date={item.date}
            speaker={item.speaker}
            joinedCount={item.joinedCount}
            onPress={() => navigation.navigate("EventDetail", { event: item })}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No {viewType} events found.</Text>
        }
        contentContainerStyle={{ paddingBottom: 140 }}
        refreshing={loading}
        onRefresh={fetchEvents}
      />

      {/* 🔐 Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* + Create Event */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("CreateEvent")}
      >
        <Text style={styles.fabText}>+</Text>
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
