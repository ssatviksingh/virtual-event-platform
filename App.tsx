import React, { useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "./utils/notifications";

import SplashScreen from "./screens/SplashScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import MainTabs from "./screens/MainTabs";
import CreateEventScreen from "./screens/CreateEventScreen";
import EditEventScreen from "./screens/EditEventScreen";
import EventDetailScreen from "./screens/EventDetailScreen";
import LiveStreamScreen from "./screens/LiveStreamScreen";
import { ThemeProvider } from "./context/ThemeContext";
import { NavigationContainerRefContext } from "./context/NavigationContainerRefContext";

const Stack = createStackNavigator();

export default function App() {
  const navigationRef = useRef(null);

  useEffect(() => {
    registerForPushNotificationsAsync();
    Notifications.addNotificationResponseReceivedListener((response) => {
  console.log("FULL NOTIFICATION RESPONSE:", JSON.stringify(response, null, 2));
  // ...existing code
});
    const foregroundListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        const eventId = notification.request.content.data?.eventId;
        console.log("📩 [Foreground] Event ID from notification:", eventId);

        if (eventId) {
          navigationRef.current?.navigate("EventDetail", { eventId });
        }
      }
    );

    const tapListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const eventId = response.notification.request.content.data?.eventId;
        console.log("📩 [Tapped] Event ID from notification:", eventId);

        if (eventId) {
          navigationRef.current?.navigate("EventDetail", { eventId });
        }
      }
    );

    return () => {
      foregroundListener.remove();
      tapListener.remove();
    };
  }, []);

  return (
    <ThemeProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName="Splash">
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen
            name="Main"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
          <Stack.Screen name="EditEvent" component={EditEventScreen} />
          <Stack.Screen name="EventDetail" component={EventDetailScreen} />
          <Stack.Screen name="LiveStream" component={LiveStreamScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
