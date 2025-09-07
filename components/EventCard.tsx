// components/EventCard.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";

interface EventCardProps { // event card props
  id: string;
  title: string;
  date: string;
  speaker: string;
  joinedCount: number;
  onPress: () => void;
}

const EventCard = ({ // event card component
  id,
  title,
  date,
  speaker,
  joinedCount,
  onPress,
}: EventCardProps) => {
  const { darkMode } = useTheme(); // theme context
  const [isFavorite, setIsFavorite] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    const loadFavorite = async () => {
      const favs = await AsyncStorage.getItem("favorites"); // get favorites from async storage
      if (favs) {
        const parsed = JSON.parse(favs); // parse favorites
        setIsFavorite(parsed.includes(id));
      }
    };
    loadFavorite();
  }, [id]);

  const toggleFavorite = async () => {
    try {
      const stored = await AsyncStorage.getItem("favorites"); // get favorites from async storage
      const current = stored ? JSON.parse(stored) : [];

      let updated; // updated favorites
      if (current.includes(id)) {
        updated = current.filter((favId) => favId !== id);
      } else {
        updated = [...current, id]; // add id to favorites
      }

      await AsyncStorage.setItem("favorites", JSON.stringify(updated));
      setIsFavorite(!isFavorite); // set is favorite to the opposite of the current state
    } catch (err) {
      console.error("Failed to toggle favorite:", err); // log error
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress} // on press
      style={[styles.card, { backgroundColor: darkMode ? "#1e1e1e" : "#fff" }]}
    >
      <View style={styles.rowBetween}>
        <Text style={[styles.title, { color: darkMode ? "#fff" : "#000" }]}> // title
          {title}
        </Text>
        <TouchableOpacity onPress={toggleFavorite}> // toggle favorite
          <Ionicons
            name={isFavorite ? "star" : "star-outline"}
            size={22}
            color={isFavorite ? "#FFD700" : "gray"} // star color
          />
        </TouchableOpacity>
      </View>
      <Text style={[styles.info, { color: darkMode ? "#ccc" : "#444" }]}> // date
        📅 {date}
      </Text>
      <Text style={[styles.info, { color: darkMode ? "#ccc" : "#444" }]}> // speaker
        🎤 {speaker}
      </Text>
      <Text style={[styles.info, { color: darkMode ? "#ccc" : "#444" }]}> // joined count
        👥 {joinedCount} Joined
      </Text>
    </TouchableOpacity>
  );
};

export default EventCard; 

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  info: {
    marginTop: 4,
    fontSize: 14,
  },
});
