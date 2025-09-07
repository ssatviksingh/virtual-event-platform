import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Props {
  eventId: string;
  userId: string;
}

const EventNotes: React.FC<Props> = ({ eventId, userId }) => { // event notes component
  const [note, setNote] = useState("");

  const storageKey = `notes_${userId}_${eventId}`;

  useEffect(() => {
    const loadNote = async () => {
      try {
        const saved = await AsyncStorage.getItem(storageKey); // get note from async storage
        if (saved) setNote(saved);
      } catch (e) {
        console.log("Failed to load note:", e); // log error
      }
    };
    loadNote();
  }, [storageKey]);

  const saveNote = async (text: string) => {
    setNote(text); // set note
    try {
      await AsyncStorage.setItem(storageKey, text);
    } catch (e) {
      console.log("Failed to save note:", e); // log error
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>📝 Your Notes</Text> // label
      <TextInput
        style={styles.input}
        placeholder="Write your thoughts here..." // placeholder
        value={note}
        onChangeText={saveNote} // on change text
        multiline
      />
    </View>
  );
};

export default EventNotes;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  label: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 6,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    backgroundColor: "#fff",
  },
});
