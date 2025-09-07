import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

type RootStackParamList = { // root stack param list
  Login: undefined;
  Home: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, "Login">; // navigation prop for login screen

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState(""); // email state
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields"); // alert error
      return;
    }

    try {
      const res = await api.post("/auth/login", { email, password }); // post login
      const { token, user } = res.data;

      // Store token & user
      await AsyncStorage.setItem("token", res.data.token); // store token
      await AsyncStorage.setItem("user", JSON.stringify(user));

      Alert.alert("Welcome", `Logged in as ${user.name}`); // alert welcome
      navigation.navigate("Main");
    } catch (err) {
      Alert.alert("Login Failed", "Invalid credentials"); // alert login failed
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Virtual Event Platform</Text> // title   

      <TextInput
        style={styles.input}
        placeholder="Email" 
        keyboardType="email-address" 
        autoCapitalize="none" 
        onChangeText={setEmail} // on change text
        value={email}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword} // on change text
        value={password}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}> // login button
        <Text style={styles.buttonText}>Login</Text> // login text
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}> // register button
        <Text style={styles.link}>Don't have an account? Register</Text> // register text
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#f4f4f4", 
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 36,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  link: {
    color: "#007bff",
    textAlign: "center",
    marginTop: 12,
  },
});
