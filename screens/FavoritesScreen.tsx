import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import api from "../services/api";
import EventCard from "../components/EventCard";

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const loadData = async () => {
    try {
      const fav = await AsyncStorage.getItem("favorites");
      setFavorites(fav ? JSON.parse(fav) : []);
      const res = await api.get("/events");
      setEvents(res.data);
    } catch (err) {
      console.error("Failed to fetch favorites or events", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(
    () => {
      if (isFocused) {
        setLoading(true);
        loadData();
      }
    },
    [isFocused],
    [showOnlyFavorites]
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const favoriteEvents = events.filter((e) => favorites.includes(e._id));

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
        data={favoriteEvents}
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No favorites yet.</Text>
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#888",
  },
});
