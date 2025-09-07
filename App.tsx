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

const Stack = createStackNavigator(); // create stack navigator

export default function App() {
  const navigationRef = useRef(null); // navigation ref

  useEffect(() => {
    registerForPushNotificationsAsync(); // register for push notifications
    Notifications.addNotificationResponseReceivedListener((response) => {
  console.log("FULL NOTIFICATION RESPONSE:", JSON.stringify(response, null, 2)); // log notification response
});
    const foregroundListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        const eventId = notification.request.content.data?.eventId; // event id
        console.log("📩 [Foreground] Event ID from notification:", eventId); // log notification event id

        if (eventId) {
          navigationRef.current?.navigate("EventDetail", { eventId }); // navigate to event detail
        }
      }
    );

    const tapListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const eventId = response.notification.request.content.data?.eventId; // event id
        console.log("📩 [Tapped] Event ID from notification:", eventId);

        if (eventId) {
          navigationRef.current?.navigate("EventDetail", { eventId }); // navigate to event detail
        }
      }
    );

    return () => {
      foregroundListener.remove(); // remove foreground listener
      tapListener.remove(); // remove tap listener
    };
  }, []);

  return (
    <ThemeProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName="Splash"> // stack navigator
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
