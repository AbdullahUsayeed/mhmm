import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleBirthdayReminders(
  globeId: string,
  partnerName: string,
  birthDay: number,
  birthMonth: number
) {
  const now = new Date();
  const birthday = new Date(now.getFullYear(), birthMonth - 1, birthDay, 9, 0);
  if (birthday <= now) birthday.setFullYear(birthday.getFullYear() + 1);

  await Notifications.cancelAllScheduledNotificationsAsync();

  const sevenDaysBefore = new Date(birthday);
  sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7);
  if (sevenDaysBefore > now) {
    await Notifications.scheduleNotificationAsync({
      content: { title: `${partnerName}'s birthday in 7 days! 💕`, body: 'Time to add more memories to the globe.', data: { globeId } },
      trigger: { date: sevenDaysBefore },
    });
  }

  const oneDayBefore = new Date(birthday);
  oneDayBefore.setDate(oneDayBefore.getDate() - 1);
  if (oneDayBefore > now) {
    await Notifications.scheduleNotificationAsync({
      content: { title: `${partnerName}'s birthday is tomorrow! 🎂`, body: 'Your globe is ready. Share the link now!', data: { globeId } },
      trigger: { date: oneDayBefore },
    });
  }

  if (Platform.OS === 'ios') {
    await Notifications.scheduleNotificationAsync({
      content: { title: `Today is ${partnerName}'s birthday! 🎉`, body: 'Happy Birthday! Your 3D globe is waiting.', data: { globeId } },
      trigger: { date: birthday },
    });
  }
}
