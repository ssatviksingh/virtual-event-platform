// components/EventCard.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  speaker: string;
  joinedCount: number;
  onPress: () => void;
}

const EventCard = ({
  id,
  title,
  date,
  speaker,
  joinedCount,
  onPress,
}: EventCardProps) => {
  const { darkMode } = useTheme();
  const [isFavorite, setIsFavorite] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    const loadFavorite = async () => {
      const favs = await AsyncStorage.getItem("favorites");
      if (favs) {
        const parsed = JSON.parse(favs);
        setIsFavorite(parsed.includes(id));
      }
    };
    loadFavorite();
  }, [id]);

  const toggleFavorite = async () => {
    try {
      const stored = await AsyncStorage.getItem("favorites");
      const current = stored ? JSON.parse(stored) : [];

      let updated;
      if (current.includes(id)) {
        updated = current.filter((favId) => favId !== id);
      } else {
        updated = [...current, id];
      }

      await AsyncStorage.setItem("favorites", JSON.stringify(updated));
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, { backgroundColor: darkMode ? "#1e1e1e" : "#fff" }]}
    >
      <View style={styles.rowBetween}>
        <Text style={[styles.title, { color: darkMode ? "#fff" : "#000" }]}>
          {title}
        </Text>
        <TouchableOpacity onPress={toggleFavorite}>
          <Ionicons
            name={isFavorite ? "star" : "star-outline"}
            size={22}
            color={isFavorite ? "#FFD700" : "gray"}
          />
        </TouchableOpacity>
      </View>
      <Text style={[styles.info, { color: darkMode ? "#ccc" : "#444" }]}>
        📅 {date}
      </Text>
      <Text style={[styles.info, { color: darkMode ? "#ccc" : "#444" }]}>
        🎤 {speaker}
      </Text>
      <Text style={[styles.info, { color: darkMode ? "#ccc" : "#444" }]}>
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
