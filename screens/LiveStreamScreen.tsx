import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { Video } from "expo-av";
import { useRoute, RouteProp } from "@react-navigation/native";

type Event = {
  id: string;
  title: string;
  date: string;
  speaker: string;
  description: string;
};

type RootStackParamList = { // root stack param list
  LiveStream: { event: Event };
};

type LiveRouteProp = RouteProp<RootStackParamList, "LiveStream">; // live route prop

const LiveStreamScreen = () => {
  const route = useRoute<LiveRouteProp>(); // use route
  const { event } = route.params;

  const [messages, setMessages] = useState<string[]>([]); // messages state
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, message]); // set messages
      setMessage("");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.eventTitle}>{event.title} - Live</Text> // event title

      {/* 🎥 Dummy Video Player */}
      <Video
        source={{
          uri: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4", // video source
        }}
        useNativeControls
        resizeMode="contain"
        style={styles.video}
      />

      {/* 💬 Chat */} 
      <FlatList
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => <Text style={styles.chatMsg}>👤 {item}</Text>} // render item
        contentContainerStyle={styles.chatBox}
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={message} // message
          onChangeText={setMessage} // on change text
          placeholder="Type your message..." // placeholder
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}> // send button
          <Text style={styles.sendText}>Send</Text> // send text
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LiveStreamScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  video: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  chatBox: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  chatMsg: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    marginVertical: 4,
    borderRadius: 8,
  },
  inputContainer: {
    flexDirection: "row",
    paddingVertical: 6,
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  sendText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
