import dayjs from 'dayjs';
import * as Notifications from 'expo-notifications';

import { Event } from '~/types/db';

/**
 * Schedule a notification to remind user about an upcoming event
 * @param event The event to remind about
 * @param hoursBeforeEvent How many hours before the event to send reminder
 */
export async function scheduleEventReminderNotification(
  event: Event,
  hoursBeforeEvent: number
): Promise<string | null> {
  try {
    const eventDate = dayjs(event.date_time);
    const reminderDate = eventDate.subtract(hoursBeforeEvent, 'hour');
    const now = dayjs();

    // Only schedule if reminder time is in the future
    if (reminderDate.isBefore(now)) {
      console.log('Reminder time is in the past, skipping');
      return null;
    }

    const secondsUntilReminder = reminderDate.diff(now, 'second');

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Evento em ${hoursBeforeEvent}h! 🎉`,
        body: `${event.title} começa em breve! Não esqueça de participar.`,
        data: {
          type: 'event_reminder',
          eventId: event.id,
          hoursBeforeEvent,
        },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: secondsUntilReminder,
      },
    });

    console.log(`Scheduled reminder notification: ${notificationId}`);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling event reminder:', error);
    return null;
  }
}

/**
 * Schedule notifications to notify event creator that someone joined their event
 * @param eventTitle The title of the event
 * @param eventId The ID of the event
 * @param participantName The name of the user who joined
 */
export async function scheduleParticipantNotification(
  eventTitle: string,
  eventId: string,
  participantName: string
): Promise<string | null> {
  try {
    // Schedule immediate notification (1 second delay to ensure it shows)
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Nova participação! 👥',
        body: `${participantName} acabou de participar do seu evento "${eventTitle}"`,
        data: {
          type: 'new_participant',
          eventId,
          participantName,
        },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
      },
    });

    console.log(`Scheduled participant notification: ${notificationId}`);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling participant notification:', error);
    return null;
  }
}

/**
 * Schedule notification to notify event creator about a new comment
 * @param eventTitle The title of the event
 * @param eventId The ID of the event
 * @param commenterName The name of the user who commented
 * @param commentText The comment text (truncated if too long)
 */
export async function scheduleCommentNotification(
  eventTitle: string,
  eventId: string,
  commenterName: string,
  commentText: string
): Promise<string | null> {
  try {
    // Truncate comment if too long
    const truncatedComment =
      commentText.length > 50 ? `${commentText.slice(0, 50)}...` : commentText;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Novo comentário em "${eventTitle}" 💬`,
        body: `${commenterName}: ${truncatedComment}`,
        data: {
          type: 'new_comment',
          eventId,
          commenterName,
        },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
      },
    });

    console.log(`Scheduled comment notification: ${notificationId}`);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling comment notification:', error);
    return null;
  }
}

/**
 * Cancel all scheduled notifications for a specific event
 * @param eventId The ID of the event
 */
export async function cancelEventNotifications(eventId: string): Promise<void> {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

    for (const notification of scheduledNotifications) {
      if (notification.content.data?.eventId === eventId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        console.log(`Cancelled notification: ${notification.identifier}`);
      }
    }
  } catch (error) {
    console.error('Error cancelling event notifications:', error);
  }
}

/**
 * Get all pending notification requests
 */
export async function getPendingNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}
