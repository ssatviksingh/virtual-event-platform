import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import api from "../services/api";
import * as Notifications from "expo-notifications";

const sendTestNotification = async (eventId: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "✏️ Event Updated",
      body: "Your event details have been updated successfully.",
      data: {
        eventId, // pass the event _id here
      },
    },
    trigger: null, // fire immediately
  });
};

const EditEventScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { event } = route.params;

  const [title, setTitle] = useState(event.title);
  const [date, setDate] = useState(event.date);
  const [speaker, setSpeaker] = useState(event.speaker);
  const [description, setDescription] = useState(event.description);

  const handleUpdate = async () => {
    try {
      await api.put(`/events/${event._id}`, {
        title,
        date,
        speaker,
        description,
      });

      Alert.alert("Success", "Event updated successfully");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Update failed");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Edit Event</Text>

      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
      />
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="Date (e.g., July 20, 2025)"
      />
      <TextInput
        style={styles.input}
        value={speaker}
        onChangeText={setSpeaker}
        placeholder="Speaker"
      />
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={description}
        onChangeText={setDescription}
        placeholder="Description"
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Update Event</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditEventScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 16,
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
