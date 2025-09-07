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


const EventDetailScreen = () => { // event detail screen
  const navigation = useNavigation(); 
  const route = useRoute(); 
  const isFocused = useIsFocused(); 

  const eventFromParams = route.params?.event; // event from params
  const eventIdFromNotification = route.params?.eventId; // event id from notification

  const [event, setEvent] = useState(null); // event state
  const [hasJoined, setHasJoined] = useState(false); // has joined state
  const [userId, setUserId] = useState(""); // user id state

  useEffect(() => {
    const fetchUser = async () => {
      const stored = await AsyncStorage.getItem("user"); // get user from async storage
      if (stored) {
        const parsed = JSON.parse(stored); // parse user
        setUserId(parsed.id);
      }
    };
    fetchUser();
  }, []);

  console.log("📩 Event ID from notification:", eventIdFromNotification); // log event id from notification

  useEffect(() => {
    const fetchEvent = async () => {
      const id = eventIdFromNotification || eventFromParams?._id; // id from notification or params

      if (!id) {
        console.warn("❗ No event ID provided."); // log no event id provided
        Alert.alert("Missing Event", "No event data provided.");
        navigation.navigate("Main");
        return;
      }

      try {
        const res = await api.get(`/events/${id}`); // get event from api
        if (!res.data) {
          throw new Error("Event not found");
        }
        setEvent(res.data);
        console.log("✅ Loaded event data:", res.data); // log event data
      } catch (err) {
        console.error("❌ Failed to load event:", err.message); // log failed to load event
        Alert.alert("Error", "Event not found or deleted.");
        navigation.navigate("Main");
      }
    };

    if (isFocused) {
      fetchEvent(); // fetch event
    }
  }, [isFocused]);

  useEffect(() => {
    const checkRSVP = async () => {
      if (!event?._id) return; // if event id is not found, return

      try {
        const res = await api.get(`/events/${event._id}/status`); // get event status from api
        setHasJoined(res.data.joined);
      } catch (err) {
        console.warn("RSVP check failed:", err.message); // log rsvp check failed
        setHasJoined(false);
      }
    };

    if (event) checkRSVP(); // check rsvp
  }, [event]);

  const handleJoinLive = async () => {
    try {
      await api.post(`/events/${event._id}/rsvp`); // post rsvp to api
      // Send local notification after RSVP
      await Notifications.scheduleNotificationAsync({ // schedule notification async
        content: {
          title: "🎉 RSVP Successful",
          body: `You have joined the event: ${event.title}`,
          data: { eventId: event._id },
        },
        trigger: null, // trigger null
      });
    } catch (err) {
      console.warn("RSVP error:", err.response?.data?.message || err.message); // log rsvp error
    } finally {
      navigation.navigate("LiveStream", { event }); // navigate to live stream
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/events/${event._id}`); // delete event from api
      Alert.alert("Deleted", "Event deleted successfully");
      navigation.navigate("Main");
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Delete failed"); // alert error  
    }
  };

  if (!event) return null; // if event is not found, return null

  return (
    <View style={styles.container}>
      <View style={styles.bannerPlaceholder} />
      <Text style={styles.title}>{event.title}</Text> // title  
      <Text style={styles.date}>📅 {event.date}</Text> // date
      <Text style={styles.speaker}>🎤 Speaker: {event.speaker}</Text> // speaker
      <Text style={styles.desc}>{event.description}</Text> // description
      {event && userId && (
  <EventNotes eventId={event._id} userId={userId} /> // event notes
)}

      {hasJoined ? (
        <View style={styles.joinedBox}>
          <Text style={styles.joinedText}>
            ✅ You have already joined this event // joined text
          </Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleJoinLive}>
          <Text style={styles.buttonText}>Join Live</Text> // join live button
        </TouchableOpacity>
      )}

      {event.creator?._id === userId && (
        <>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#FFA000" }]}
            onPress={() => navigation.navigate("EditEvent", { event })}
          >
            <Text style={styles.buttonText}>Edit Event</Text> // edit event button
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#D32F2F" }]}
            onPress={handleDelete}
          >
            <Text style={styles.buttonText}>Delete Event</Text> // delete event button
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
