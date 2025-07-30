import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import {
  useNavigation,
  useRoute,
  useIsFocused,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import EventNotes from "../components/EventNotes";
import * as Notifications from "expo-notifications";


const EventDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();

  const eventFromParams = route.params?.event;
  const eventIdFromNotification = route.params?.eventId;

  const [event, setEvent] = useState(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const stored = await AsyncStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserId(parsed.id);
      }
    };
    fetchUser();
  }, []);

  console.log("📩 Event ID from notification:", eventIdFromNotification);

  useEffect(() => {
    const fetchEvent = async () => {
      const id = eventIdFromNotification || eventFromParams?._id;

      if (!id) {
        console.warn("❗ No event ID provided.");
        Alert.alert("Missing Event", "No event data provided.");
        navigation.navigate("Main");
        return;
      }

      try {
        const res = await api.get(`/events/${id}`);
        if (!res.data) {
          throw new Error("Event not found");
        }
        setEvent(res.data);
        console.log("✅ Loaded event data:", res.data);
      } catch (err) {
        console.error("❌ Failed to load event:", err.message);
        Alert.alert("Error", "Event not found or deleted.");
        navigation.navigate("Main");
      }
    };

    if (isFocused) {
      fetchEvent();
    }
  }, [isFocused]);

  useEffect(() => {
    const checkRSVP = async () => {
      if (!event?._id) return;

      try {
        const res = await api.get(`/events/${event._id}/status`);
        setHasJoined(res.data.joined);
      } catch (err) {
        console.warn("RSVP check failed:", err.message);
        setHasJoined(false);
      }
    };

    if (event) checkRSVP();
  }, [event]);

  const handleJoinLive = async () => {
    try {
      await api.post(`/events/${event._id}/rsvp`);
      // Send local notification after RSVP
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🎉 RSVP Successful",
          body: `You have joined the event: ${event.title}`,
          data: { eventId: event._id },
        },
        trigger: null,
      });
    } catch (err) {
      console.warn("RSVP error:", err.response?.data?.message || err.message);
    } finally {
      navigation.navigate("LiveStream", { event });
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/events/${event._id}`);
      Alert.alert("Deleted", "Event deleted successfully");
      navigation.navigate("Main");
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Delete failed");
    }
  };

  if (!event) return null;

  return (
    <View style={styles.container}>
      <View style={styles.bannerPlaceholder} />
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.date}>📅 {event.date}</Text>
      <Text style={styles.speaker}>🎤 Speaker: {event.speaker}</Text>
      <Text style={styles.desc}>{event.description}</Text>
      {event && userId && (
  <EventNotes eventId={event._id} userId={userId} />
)}

      {hasJoined ? (
        <View style={styles.joinedBox}>
          <Text style={styles.joinedText}>
            ✅ You have already joined this event
          </Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleJoinLive}>
          <Text style={styles.buttonText}>Join Live</Text>
        </TouchableOpacity>
      )}

      {event.creator?._id === userId && (
        <>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#FFA000" }]}
            onPress={() => navigation.navigate("EditEvent", { event })}
          >
            <Text style={styles.buttonText}>Edit Event</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#D32F2F" }]}
            onPress={handleDelete}
          >
            <Text style={styles.buttonText}>Delete Event</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default EventDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  bannerPlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#ccc",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    marginHorizontal: 16,
  },
  date: {
    fontSize: 16,
    color: "#555",
    marginTop: 8,
    marginHorizontal: 16,
  },
  speaker: {
    fontSize: 16,
    marginTop: 8,
    marginHorizontal: 16,
  },
  desc: {
    fontSize: 16,
    marginTop: 16,
    marginHorizontal: 16,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    margin: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  joinedBox: {
    backgroundColor: "#e0f2f1",
    padding: 14,
    margin: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  joinedText: {
    color: "#2e7d32",
    fontWeight: "bold",
    fontSize: 16,
  },
});
