import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import DatePicker from 'react-native-date-picker';

interface DateRangeFilterProps {
  dateFrom: Date | null;
  dateTo: Date | null;
  onDateFromChange: (date: Date | null) => void;
  onDateToChange: (date: Date | null) => void;
}

export default function DateRangeFilter({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: DateRangeFilterProps) {
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const formatDate = (date: Date | null) => {
    if (!date) return 'Select date';
    return dayjs(date).format('MMM DD, YYYY');
  };

  const handleClearFilter = () => {
    onDateFromChange(null);
    onDateToChange(null);
  };

  const hasActiveFilter = dateFrom || dateTo;

  return (
    <View className="mx-4 mb-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium text-gray-700">Filter by date:</Text>
        {hasActiveFilter && (
          <TouchableOpacity onPress={handleClearFilter} className="flex-row items-center">
            <Ionicons name="close-circle-outline" size={16} color="#6B7280" />
            <Text className="ml-1 text-sm text-gray-600">Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="mt-2 flex-row space-x-3">
        {/* From Date Button */}
        <TouchableOpacity
          onPress={() => setShowFromPicker(true)}
          className={`flex-1 flex-row items-center justify-center rounded-lg border px-3 py-2 ${
            dateFrom ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white'
          }`}>
          <Ionicons name="calendar-outline" size={16} color={dateFrom ? '#3B82F6' : '#6B7280'} />
          <Text
            className={`ml-2 text-sm ${dateFrom ? 'font-medium text-brand-600' : 'text-gray-600'}`}>
            {formatDate(dateFrom)}
          </Text>
        </TouchableOpacity>

        {/* To Date Button */}
        <TouchableOpacity
          onPress={() => setShowToPicker(true)}
          className={`flex-1 flex-row items-center justify-center rounded-lg border px-3 py-2 ${
            dateTo ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white'
          }`}>
          <Ionicons name="calendar-outline" size={16} color={dateTo ? '#3B82F6' : '#6B7280'} />
          <Text
            className={`ml-2 text-sm ${dateTo ? 'font-medium text-brand-600' : 'text-gray-600'}`}>
            {formatDate(dateTo)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* From Date Picker */}
      <DatePicker
        modal
        open={showFromPicker}
        date={dateFrom || new Date()}
        mode="date"
        onConfirm={(date) => {
          setShowFromPicker(false);
          onDateFromChange(date);
        }}
        onCancel={() => setShowFromPicker(false)}
        title="Select start date"
        confirmText="Select"
        cancelText="Cancel"
      />

      {/* To Date Picker */}
      <DatePicker
        modal
        open={showToPicker}
        date={dateTo || new Date()}
        mode="date"
        minimumDate={dateFrom || undefined}
        onConfirm={(date) => {
          setShowToPicker(false);
          onDateToChange(date);
        }}
        onCancel={() => setShowToPicker(false)}
        title="Select end date"
        confirmText="Select"
        cancelText="Cancel"
      />
    </View>
  );
}
