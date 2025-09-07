import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./HomeScreen";
import MyEventsScreen from "./MyEventsScreen";
import { Ionicons } from "@expo/vector-icons";
import FavoritesScreen from "./FavoritesScreen";

const Tab = createBottomTabNavigator();

const MainTabs = () => { 
  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({  
        headerShown: true, 
        tabBarIcon: ({ color, size }) => {
          let iconName = route.name === "All Events" ? "calendar" : "person"; // icon name
          return <Ionicons name={iconName} size={size} color={color} />; // icon
        },
      })}
    >
      <Tab.Screen name="All Events" component={HomeScreen} /> 
      <Tab.Screen name="My Events" component={MyEventsScreen} /> 
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} /> 
          ),
        }}
      />
    </Tab.Navigator> 
  );
};

export default MainTabs;
