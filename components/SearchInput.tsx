import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useEffect, useState, useRef, memo } from 'react';
import { TextInput, TouchableOpacity, View, Platform, StyleSheet } from 'react-native';

interface SearchInputProps {
  value: string;
  onSearchChange: (search: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

const SearchInput = memo(function SearchInput({
  value,
  onSearchChange,
  placeholder = 'Search events...',
  debounceMs = 500,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const onSearchChangeRef = useRef(onSearchChange);

  // Keep the ref updated
  useEffect(() => {
    onSearchChangeRef.current = onSearchChange;
  }, [onSearchChange]);

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChangeRef.current(localValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs]);

  // Update local value when external value changes (only if different and not from user input)
  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value);
    }
  }, [value]);

  const handleClear = () => {
    setLocalValue('');
    onSearchChangeRef.current('');
  };

  const searchContent = (
    <View className="flex-row items-center px-4 py-3">
      <Ionicons name="search" size={20} color="#1DDD96" />

      <TextInput
        value={localValue}
        onChangeText={setLocalValue}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        className="ml-3 flex-1 text-base text-dark-900"
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        blurOnSubmit={false}
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
        className="mx-4 mb-3 overflow-hidden rounded-3xl border-2 border-dark-200/60 bg-white/80"
        style={styles.webGlass}>
        {searchContent}
      </View>
    );
  }

  // Native version with BlurView
  return (
    <View className="mx-4 mb-3" style={styles.container}>
      <BlurView
        intensity={30}
        tint="light"
        className="overflow-hidden rounded-3xl border-2 border-dark-200/60 bg-white/10">
        {searchContent}
      </BlurView>
    </View>
  );
});

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

export default SearchInput;
