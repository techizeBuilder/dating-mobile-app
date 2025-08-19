import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, MapPin } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { useState } from 'react';

type Gender = 'female' | 'male' | 'others';

export default function FilterScreen() {
  const [filters, setFilters] = useState({
    location: 'New York City',
    gender: null as Gender | null,
    ageRange: [20, 40],
    distance: 25,
  });

  const handleApplyFilters = () => {
    // Apply filters and go back
    router.back();
  };

  const handleResetFilters = () => {
    setFilters({
      location: 'New York City',
      gender: null,
      ageRange: [20, 40],
      distance: 25,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FF00FF" />
        </Pressable>
        <Text style={styles.title}>Filters</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationInput}>
            <MapPin size={20} color="#FF00FF" />
            <TextInput
              style={styles.input}
              value={filters.location}
              onChangeText={(text) => setFilters({ ...filters, location: text })}
              placeholder="Enter location"
              placeholderTextColor="#666"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gender</Text>
          <View style={styles.genderButtons}>
            {(['female', 'male', 'others'] as const).map((gender) => (
              <Pressable
                key={gender}
                style={[
                  styles.genderButton,
                  filters.gender === gender && styles.genderButtonActive,
                ]}
                onPress={() => setFilters({ ...filters, gender })}
              >
                <Text style={[
                  styles.genderButtonText,
                  filters.gender === gender && styles.genderButtonTextActive,
                ]}>
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Age Range</Text>
          <Text style={styles.rangeText}>
            {filters.ageRange[0]} - {filters.ageRange[1]}
          </Text>
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={18}
              maximumValue={60}
              value={filters.ageRange[0]}
              onValueChange={(value) => setFilters({
                ...filters,
                ageRange: [Math.round(value), filters.ageRange[1]]
              })}
              minimumTrackTintColor="#FF00FF"
              maximumTrackTintColor="#333"
              thumbTintColor="#FF00FF"
            />
            <Slider
              style={styles.slider}
              minimumValue={18}
              maximumValue={60}
              value={filters.ageRange[1]}
              onValueChange={(value) => setFilters({
                ...filters,
                ageRange: [filters.ageRange[0], Math.round(value)]
              })}
              minimumTrackTintColor="#FF00FF"
              maximumTrackTintColor="#333"
              thumbTintColor="#FF00FF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distance (km)</Text>
          <Text style={styles.rangeText}>{filters.distance} km</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={100}
            value={filters.distance}
            onValueChange={(value) => setFilters({
              ...filters,
              distance: Math.round(value)
            })}
            minimumTrackTintColor="#FF00FF"
            maximumTrackTintColor="#333"
            thumbTintColor="#FF00FF"
          />
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            style={styles.resetButton}
            onPress={handleResetFilters}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </Pressable>

          <Pressable
            style={styles.applyButton}
            onPress={handleApplyFilters}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 32,
    color: '#FF00FF',
    textShadowColor: '#FF00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 18,
    color: '#FF00FF',
    marginBottom: 12,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FF00FF',
    gap: 8,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'Rajdhani',
    fontSize: 16,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FF00FF',
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#FF00FF',
  },
  genderButtonText: {
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 16,
    color: '#FF00FF',
  },
  genderButtonTextActive: {
    color: '#000000',
  },
  rangeText: {
    fontFamily: 'Rajdhani',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sliderContainer: {
    gap: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
    paddingBottom: 20,
  },
  resetButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FF00FF',
    alignItems: 'center',
  },
  resetButtonText: {
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 16,
    color: '#FF00FF',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#FF00FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 16,
    color: '#000000',
  },
});