import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import api from "../services/api";
import { StackNavigationProp } from "@react-navigation/stack";

type RootStackParamList = {
  Register: undefined;
  Login: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, "Register">; // navigation prop for register screen

const RegisterScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [name, setName] = useState(""); // name state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // password state

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill all fields"); // alert error
      return;
    }

    try {
      const res = await api.post("/auth/register", { name, email, password }); // post register
      Alert.alert("Success", "Account created. Please login.");
      navigation.navigate("Login"); // navigate to login
    } catch (err) {
      Alert.alert("Error", "Registration failed"); // alert error
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text> // register text

      <TextInput
        style={styles.input}
        placeholder="Full Name" // full name
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email" // email
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password" // password
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}> // create account button
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}> // login button
        <Text style={styles.link}>Already have an account? Login</Text> 
      </TouchableOpacity>
    </View>
  );
};

export default RegisterScreen;

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
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  link: {
    color: "#007bff",
    textAlign: "center",
    marginTop: 10,
  },
});
