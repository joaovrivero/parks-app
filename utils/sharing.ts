import dayjs from 'dayjs';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

import { Event } from '~/types/db';

/**
 * Share event details with other apps
 * @param event The event to share
 */
export async function shareEvent(event: Event): Promise<void> {
  try {
    // Check if sharing is available on this platform
    const isAvailable = await Sharing.isAvailableAsync();

    if (!isAvailable) {
      Alert.alert(
        'Compartilhamento indisponível',
        'O compartilhamento não está disponível neste dispositivo.'
      );
      return;
    }

    // Format event date and time
    const eventDate = dayjs(event.date);
    const formattedDate = eventDate.format('DD/MM/YYYY');
    const formattedTime = eventDate.format('HH:mm');

    // Create formatted message
    const message = `🎉 *${event.title}*

📅 Data: ${formattedDate}
⏰ Horário: ${formattedTime}
📍 Local: ${event.location}

${event.description}

Veja mais detalhes e participe: parksapp://event/${event.id}

#ParksApp #Eventos`;

    // For now, we'll create a temporary text "file" to share
    // In a real implementation, you might want to generate an image or PDF
    // Since expo-sharing works best with actual files, we'll use Alert.alert with share options
    // On mobile, we can use the native share sheet

    // Use React Native's Share API for better text sharing
    const { Share } = await import('react-native');

    const result = await Share.share({
      message,
      title: event.title,
    });

    if (result.action === Share.sharedAction) {
      console.log('Event shared successfully');
    } else if (result.action === Share.dismissedAction) {
      console.log('Share dismissed');
    }
  } catch (error) {
    console.error('Error sharing event:', error);
    Alert.alert('Erro', 'Não foi possível compartilhar o evento.');
  }
}

/**
 * Check if sharing is available on the current platform
 */
export async function isSharingAvailable(): Promise<boolean> {
  try {
    return await Sharing.isAvailableAsync();
  } catch (error) {
    console.error('Error checking sharing availability:', error);
    return false;
  }
}
