import { useEffect, useState, useCallback, useRef } from 'react';
import { View, TextInput, Text, Pressable, ActivityIndicator } from 'react-native';

import { useAuth } from '~/contexts/AuthProvider';
import { useLocation } from '~/contexts/LocationProvider';
import { getSuggestions, retrieveDetails } from '~/utils/AddressAutocomplete';

export default function AddressAutocomplete({ onSelected }) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const { session } = useAuth();
  const { location, hasPermission, requestPermission } = useLocation();
  const abortControllerRef = useRef(null);

  const search = useCallback(
    async (searchInput) => {
      if (searchInput.length < 3) {
        setSuggestions([]);
        return;
      }

      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        setIsLoading(true);

        const userLocation = location
          ? {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }
          : undefined;

        const data = await getSuggestions(
          searchInput,
          session.access_token,
          abortControllerRef.current.signal,
          userLocation
        );
        setSuggestions(data.suggestions || []);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [session.access_token, location]
  );

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      search(input);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [input, search]);

  const onSuggestionClick = async (suggestion) => {
    setSelectedLocation(suggestion);
    setInput(suggestion.name);
    setSuggestions([]);

    const details = await retrieveDetails(suggestion.mapbox_id, session.access_token);
    onSelected(details);
  };

  return (
    <View>
      <View className="flex flex-row items-center gap-3">
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Location (type at least 3 characters)"
          className="flex-1 rounded-md border border-gray-200 p-3"
        />
        {isLoading && <ActivityIndicator size="small" color="#666" />}
      </View>

      {!hasPermission && (
        <Pressable onPress={requestPermission} className="mt-2 rounded bg-blue-100 p-2">
          <Text className="text-center text-blue-800">Enable location for better suggestions</Text>
        </Pressable>
      )}

      <View className="gap-2">
        {suggestions.map((item) => (
          <Pressable
            onPress={() => onSuggestionClick(item)}
            key={item.name}
            className="rounded border border-gray-300 p-2">
            <Text className="font-bold">{item.name}</Text>
            <Text>{item.place_formatted}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
