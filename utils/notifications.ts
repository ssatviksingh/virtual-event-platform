import * as Notifications from 'expo-notifications'; // notifications 
import * as Device from 'expo-device'; // device
import { Alert } from 'react-native';

export async function registerForPushNotificationsAsync() { // register for push notifications
  if (!Device.isDevice) {
    Alert.alert('Must use physical device for Push Notifications'); // alert
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync(); // get permissions
  let finalStatus = existingStatus; // final status

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync(); // request permissions
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert('Permission not granted!'); // alert
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data; // get push token
  console.log('📲 Push token:', token);
  return token;
}

// Show notification even in foreground
Notifications.setNotificationHandler({ // set notification handler
  handleNotification: async () => ({
    shouldShowAlert: true, // should show alert
    shouldPlaySound: false, // should play sound
    shouldSetBadge: false, // should set badge
    shouldShowBanner: true,
    shouldShowList: true, // should show list
  }),
}); // set notification handler
