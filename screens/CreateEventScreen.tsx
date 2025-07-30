import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import api from "../services/api";
import * as Notifications from "expo-notifications"; 

const CreateEventScreen = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [tags, setTags] = useState("");


  const handleDateChange = (event, selectedDate) => {
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) setDate(selectedDate);
  };

  const handleSubmit = async () => {
    try {
      console.log("📌 Tags Array:", tags.split(",").map((t) => t.trim()));

      const res = await api.post("/events", {
        title,
        speaker,
        description,
        date: date.toISOString().split("T")[0], // format as YYYY-MM-DD
        tags: tags.split(",").map((t) => t.trim()),
      });

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🎉 New Event Created",
          body: `Event "${res.data.title}" is now live.`,
          data: { eventId: res.data._id },
        },
        trigger: null,
      });

      Alert.alert("Success", "Event created successfully");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Creation failed");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Create Event</Text>

      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Event Title"
      />
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={styles.dateInput}
      >
        <Text style={{ fontSize: 16 }}>{date.toDateString()}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

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

      <TextInput
        style={styles.input}
        value={tags}
        onChangeText={setTags}
        placeholder="Tags (comma separated, e.g. tech, webinar, free)"
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Create</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreateEventScreen;

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
  dateInput: {
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
