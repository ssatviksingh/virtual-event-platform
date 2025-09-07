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

const CreateEventScreen = () => { // create event screen
  const navigation = useNavigation();
  const [title, setTitle] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [tags, setTags] = useState("");


  const handleDateChange = (event, selectedDate) => { // handle date change
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) setDate(selectedDate);
  };

  const handleSubmit = async () => { // handle submit function in create event screen
    try {
      console.log("📌 Tags Array:", tags.split(",").map((t) => t.trim()));

      const res = await api.post("/events", {
        title,
        speaker,
        description,
        date: date.toISOString().split("T")[0], // format as YYYY-MM-DD
        tags: tags.split(",").map((t) => t.trim()),
      });

      await Notifications.scheduleNotificationAsync({ // schedule notification async
        content: {
          title: "🎉 New Event Created",
          body: `Event "${res.data.title}" is now live.`,
          data: { eventId: res.data._id },
        },
        trigger: null, // trigger null
      });

      Alert.alert("Success", "Event created successfully"); // alert success
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Creation failed"); // alert error
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Create Event</Text> // heading

      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle} // on change text
        placeholder="Event Title"
      />
      <TouchableOpacity
        onPress={() => setShowPicker(true)} // on press
        style={styles.dateInput}
      >
        <Text style={{ fontSize: 16 }}>{date.toDateString()}</Text> // date
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date} // date
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <TextInput
        style={styles.input}
        value={speaker}
        onChangeText={setSpeaker} // on change text
        placeholder="Speaker"
      />
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={description} // description in create event screen 
        onChangeText={setDescription}
        placeholder="Description"
        multiline
      />

      <TextInput
        style={styles.input}
        value={tags}
        onChangeText={setTags} // on change text
        placeholder="Tags (comma separated, e.g. tech, webinar, free)"
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Create</Text> // create button
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
