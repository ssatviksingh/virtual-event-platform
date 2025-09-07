import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import api from "../services/api";
import EventCard from "../components/EventCard";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { useLayoutEffect } from "react";

export default function MyEventsScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState<"upcoming" | "past">("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { darkMode } = useTheme();

  useLayoutEffect(() => { // use layout effect
    navigation.setOptions({
      headerStyle: {
        backgroundColor: darkMode ? "#121212" : "#fff", // dark mode toggle
      },
      headerTintColor: darkMode ? "#fff" : "#000",
    });
  }, [navigation, darkMode]);



  const fetchMyEvents = async () => {
    try {
      setLoading(true); // set loading to true
      const res = await api.get("/events/my-created");
      setEvents(res.data);
    } catch (e) {
      console.log("err", e.message); // log error 
      console.log("Error response:", e.response?.data);
      console.log("Status:", e.response?.status);
      setEvents([]); // set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { // use effect
    if (isFocused) {
      // Add a small delay to prevent rapid refreshes
      const timer = setTimeout(() => {
        fetchMyEvents(); // fetch my events
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isFocused]);

  const parseDate = (str: string) => new Date(`${str}T00:00:00`); // parse date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events.filter((e) => parseDate(e.date) >= today); // filter events by date
  const pastEvents = events.filter((e) => parseDate(e.date) < today);
  const eventsToShow = viewType === "upcoming" ? upcomingEvents : pastEvents; // filter events by date

  const displayedEvents = eventsToShow
    .filter((event) => {
      const q = searchQuery.toLowerCase(); // search query
      return (
        event.title.toLowerCase().includes(q) ||
        event.speaker.toLowerCase().includes(q) ||
        event.date.includes(q) // filter events by date
      );
    });

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />; // if loading, return activity indicator

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: darkMode ? "#121212" : "#f2f2f2", // dark mode toggle
        paddingTop: 40,
      }}
    >
      <Text style={[styles.header, { color: darkMode ? "#fff" : "#000" }]}>
        {viewType === "upcoming" 
          ? "My Created Upcoming Events" // upcoming events
          : "My Created Past Events"} // past events
      </Text>

      {/* Toggle buttons */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewType === "upcoming" && styles.activeToggle,
          ]}
          onPress={() => setViewType("upcoming")} // set view type to upcoming events
        >
          <Text style={styles.toggleText}>Upcoming</Text> // upcoming text
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewType === "past" && styles.activeToggle,
          ]}
          onPress={() => setViewType("past")} // set view type to past events
        >
          <Text style={styles.toggleText}>Past</Text> // past text
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search your created events" // search input
        value={searchQuery}
        onChangeText={setSearchQuery} // on change text
        placeholderTextColor={darkMode ? "#aaa" : "#888"}
      />

      <FlatList
        data={displayedEvents}
        keyExtractor={(item) => item._id}
        refreshing={loading}
        onRefresh={fetchMyEvents} // fetch my events
        renderItem={({ item }) => ( 
          <EventCard
            id={item._id}
            title={item.title} // title   
            date={item.date} // date
            speaker={item.speaker} // speaker
            joinedCount={item.joinedCount} // joined count
            onPress={() => navigation.navigate("EventDetail", { event: item })} // navigate to event detail
          />
        )} 
        ListEmptyComponent={
          <Text
            style={[styles.emptyText, { color: darkMode ? "#fff" : "#000" }]}
          >
            No created {viewType} events found. // no created events text
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
});
