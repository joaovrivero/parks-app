import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useEffect, useState } from 'react';
import { TextInput, TouchableOpacity, View, Platform, StyleSheet } from 'react-native';

interface SearchInputProps {
  value: string;
  onSearchChange: (search: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export default function SearchInput({
  value,
  onSearchChange,
  placeholder = 'Search events...',
  debounceMs = 500,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, onSearchChange, debounceMs]);

  // Update local value when external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClear = () => {
    setLocalValue('');
    onSearchChange('');
  };

  const SearchContent = () => (
    <View className="flex-row items-center px-4 py-3">
      <Ionicons name="search" size={20} color="#14b8a1" />

      <TextInput
        value={localValue}
        onChangeText={setLocalValue}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        className="ml-3 flex-1 text-base text-dark-900"
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />

      {localValue.length > 0 && (
        <TouchableOpacity onPress={handleClear} className="ml-2">
          <Ionicons name="close-circle" size={20} color="#64748b" />
        </TouchableOpacity>
      )}
    </View>
  );

  // Web version with CSS backdrop filter
  if (Platform.OS === 'web') {
    return (
      <View
        className="mx-4 mb-3 overflow-hidden rounded-3xl border border-white/30 bg-white/70"
        style={styles.webGlass}>
        <SearchContent />
      </View>
    );
  }

  // Native version with BlurView
  return (
    <View className="mx-4 mb-3" style={styles.container}>
      <BlurView
        intensity={20}
        tint="light"
        className="overflow-hidden rounded-3xl border border-white/30">
        <SearchContent />
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  webGlass: {
    backdropFilter: 'blur(20px)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
});
