import React, { useEffect } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        navigation.replace("Main"); // Auto-login if token is found
      } else {
        navigation.replace("Login"); // Redirect to login if no token
      }
    };

    checkLogin();
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#000" />
      <Text>Loading...</Text>
    </View>
  );
};

export default SplashScreen;
