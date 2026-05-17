import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { isBirthdayToday } from '../constants/theme';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function requestPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.log('Notification permission not granted');
  }
}

export default function RootLayout() {
  useEffect(() => {
    requestPermissions();

    if (isBirthdayToday()) {
      setTimeout(() => {
        Notifications.scheduleNotificationAsync({
          content: {
            title: 'Happy Birthday from Usayeed! 🎂',
            body: 'You are the most beautiful person in my world. I love you, Raisa! ❤️',
            sound: true,
          },
          trigger: null,
        });
      }, 500);
    }
  }, []);

  return (
    <>
      <StatusBar style="light" backgroundColor="#1a001a" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#1a001a' },
          animation: 'fade',
          animationDuration: 600,
        }}
      />
    </>
  );
}
