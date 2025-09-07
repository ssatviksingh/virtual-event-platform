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

export default function FavoritesScreen() { // favorites screen
  const [favorites, setFavorites] = useState<string[]>([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const loadData = async () => {
    try {
      const fav = await AsyncStorage.getItem("favorites"); // get favorites from async storage
      setFavorites(fav ? JSON.parse(fav) : []);
      const res = await api.get("/events");
      setEvents(res.data); // set events
    } catch (err) {
      console.error("Failed to fetch favorites or events", err); // log error
    } finally {
      setLoading(false);
      setRefreshing(false); // set refreshing to false
    }
  };

  useEffect(
    () => {
      if (isFocused) {
        setLoading(true); // set loading to true
        loadData();
      }
    },
    [isFocused],
    [showOnlyFavorites]
  );

  const onRefresh = () => {
    setRefreshing(true); // set refreshing to true
    loadData();
  };

  const favoriteEvents = events.filter((e) => favorites.includes(e._id)); // filter events by favorites ids

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />; // if loading, return activity indicator if loading

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}> // view
      <FlatList
        data={favoriteEvents}
        keyExtractor={(item) => item._id} // key extractor
        renderItem={({ item }) => (
          <EventCard
            id={item._id}
            title={item.title} // title   
            date={item.date} // date
            speaker={item.speaker} // speaker
            joinedCount={item.joinedCount} // joined count
            onPress={() => navigation.navigate("EventDetail", { event: item })} // on press
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> // refresh control
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No favorites yet.</Text> // empty text
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
