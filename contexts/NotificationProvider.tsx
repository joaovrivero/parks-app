import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { Platform } from 'react-native';

import { useAuth } from './AuthProvider';

import { supabase } from '~/utils/supabase';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  requestPermissions: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const { user } = useAuth();

  useEffect(() => {
    // Register for push notifications when user logs in
    if (user) {
      registerForPushNotificationsAsync().then((token) => {
        if (token) {
          setExpoPushToken(token);
          // Save token to Supabase for future push notifications
          savePushToken(token);
        }
      });
    }

    // Listener for notifications received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    // Listener for user interactions with notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
      // Here you could navigate to specific screens based on notification data
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [user]);

  const requestPermissions = async (): Promise<boolean> => {
    // On Android 13+, create a notification channel before requesting permissions
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10b981',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  };

  const savePushToken = async (token: string) => {
    if (!user) return;

    try {
      // Update or insert push token for user
      const { error } = await supabase
        .from('expo_push_tokens')
        .upsert({ user_id: user.id, token, updated_at: new Date().toISOString() });

      if (error) {
        console.error('Error saving push token:', error);
      }
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{ expoPushToken, notification, requestPermissions }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10b981',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return;
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      console.log('Project ID not found');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('Expo push token:', token);
  } catch (e) {
    // Suppress FCM errors in development - requires Firebase setup for production
    if (e instanceof Error && e.message.includes('FirebaseApp')) {
      console.log(
        'Push notifications require FCM setup. See: https://docs.expo.dev/push-notifications/fcm-credentials/'
      );
    } else {
      console.log('Error getting push token:', e);
    }
  }

  return token;
}
