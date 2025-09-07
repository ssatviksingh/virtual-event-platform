import React, { useEffect } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SplashScreen = ({ navigation }) => { 
  useEffect(() => {
    const checkLogin = async () => { 
      const token = await AsyncStorage.getItem("token"); // get token from async storage
      if (token) {
        navigation.replace("Main"); // auto-login if token is found
      } else {
        navigation.replace("Login"); // redirect to login if no token
      }
    };

    checkLogin(); // check login
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#000" />
      <Text>Loading...</Text> // loading text
    </View>
  );
};

export default SplashScreen;
