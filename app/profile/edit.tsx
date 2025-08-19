import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Image, ScrollView, FlatList } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Camera, MapPin, Plus, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../apiUrl';
import { useUserProfile } from '../context/userContext';
import Toast from 'react-native-toast-message';
import GradientInput from '@/components/GradientInput';
import SelectInput from '@/components/SelectInput';
import MultipleSelectInput from '@/components/MultiSelectInput';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import Loading from '@/components/Loading';

export default function EditProfileScreen() {
  const { token, user, setUser, loading, setLoading } = useUserProfile();
  const [updating, setUpdating] = useState(false)
  const [interests, setInterests] = useState([]);
  useEffect(() => {
    const fetchAndStoreInterests = async () => {
      try {

        const response = await fetch(`${API_BASE_URL}/interests`);
        const data = await response.json();
        console.log('Response:', data);
        setInterests(data.interests || []);
        setLoading(false)
      } catch (error) {
        console.error('Error fetching interests:', error);
        setLoading(false)
      }
    };

    fetchAndStoreInterests();
  }, []);


  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    about: '',
    age: '',
    gender: '',
    genderPreference: '',
    profession: '',
    marital_status: '',

    height: '',
    weight: '',
    skin_color: '',
    category: '',
    likes: [],
    interests: [],
    hobbies: [],
    address: {
      country: '',
      state: '',
      city: '',
      pincode: '',
      locality: '',
    },
    profileImage: '',
  });

  console.log("profile update formdta : ", profile)
  console.log("user in edit form : ", user

  )
  // Load user profile data if available
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.mobile || '',
        about: user.about || '',
        age: user.age ? String(user.age) : '',
        gender: user.i_am || user.gender || '',
        genderPreference: user.interested_in || user.genderPreference || '',
        profession: user.profession || '',
        marital_status: user.marital_status || '',
        height: user.height ? String(user.height) : '',
        weight: user.weight ? String(user.weight) : '',
        skin_color: user.skin_color || '',
        category: user.category || '',
        likes: user.likes || [],
        interests: user.interests || [],
        hobbies: user.hobbies || [],
        address: {
          country: user.address?.country || '',
          state: user.address?.state || '',
          city: user.address?.city || '',
          pincode: user.address?.pincode || '',
          locality: user.address?.locality || '',
        },
        profileImage: user.profile_image || '',
      });
    }
  }, [user]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfile({ ...profile, profileImage: result.assets[0].uri });
    }
  };

  const parseCommaSeparated = (text: string): string[] =>
    text
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);



  const handleUpdateProfile = async () => {
    try {
      setUpdating(true)
      const cleanedLikes = parseCommaSeparated(profile.likes.join(","));
      const cleanedHobbies = parseCommaSeparated(profile.hobbies.join(","));
      const formData = new FormData();

      formData.append('name', profile.name);
      formData.append('email', profile.email);
      formData.append('mobile', profile.phone);
      formData.append('i_am', profile.gender);
      formData.append('interested_in', profile.genderPreference);
      formData.append('age', profile.age);
      formData.append('about', profile.about);
      // formData.append("likes", JSON.stringify(profile.likes));
      // formData.append("hobbies", JSON.stringify(profile.hobbies));
      formData.append("hobbies", JSON.stringify(cleanedHobbies));
      formData.append("likes", JSON.stringify(cleanedLikes));
      formData.append("interests", JSON.stringify(profile.interests));
      formData.append('skin_color', profile.skin_color);
      formData.append('height', profile.height);
      formData.append('weight', profile.weight);
      formData.append('profession', profile.profession);
      formData.append('marital_status', profile.marital_status);
      formData.append('category', profile.category);
      formData.append('address', JSON.stringify(profile.address));

      // Attach profile image if present and is a local file
      const fileUri = profile.profileImage;
      if (fileUri && fileUri.startsWith('file://')) {
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists) {
          formData.append('profile_image', {
            uri: fileInfo.uri,
            name: `profile.jpg`,
            type: 'image/jpeg',
          });
        }
      }

      for (let pair of formData.entries()) {
        console.log(pair[0] + ':', pair[1]);
      }

      const response = await fetch(`${API_BASE_URL}/user/profile/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,

        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.status) {
        Toast.show({
          type: 'success',
          text1: 'Profile Updated',
        });

        setUser(data.data);
        router.push("/(tabs)/profile");
      } else {
        Toast.show({
          type: 'error',
          text1: 'Update Failed',
          text2: data.message || 'Something went wrong',
        });
      }
      setUpdating(false)
    } catch (err) {
      console.error('Update Error:', err);
      setUpdating(false)
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: 'Try again later',
      });
    }
  };

  const handleInterestsChange = (selectedItems: any[]) => {
    const idsOnly = selectedItems
      .map(item => {
        if (!item) return null;
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && item.value) return item.value;
        return null;
      })
      .filter(Boolean);

    setProfile({ ...profile, interests: idsOnly });
  };

  if (loading) {
    return (
      <Loading />
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.push('/profile')} style={styles.backButton}>
          <ArrowLeft size={24} color="#FF00FF" />
        </Pressable>
        <Text style={styles.title}>Edit Profile</Text>
      </View>

      <FlatList
        data={[]}
        keyExtractor={() => 'dummy'}
        renderItem={null}
        showsVerticalScrollIndicator={false}
        style={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.avatarSection}>
              <Image
                source={{
                  uri:
                    profile.profileImage?.startsWith("file://") || profile.profileImage?.startsWith("http")
                      ? profile.profileImage
                      : user?.profile_image?.startsWith("http:/") && !user?.profile_image?.startsWith("http://")
                        ? user.profile_image.replace("http:/", "http://")
                        : user?.profile_image || "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop",
                }}
                style={styles.avatar}
              />

              <Pressable style={styles.cameraButton} onPress={pickImage}>
                <Camera size={20} color="#00ffff" />
              </Pressable>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <GradientInput>
                  <TextInput
                    style={styles.inputInner}
                    value={profile.name}
                    onChangeText={(text) => setProfile({ ...profile, name: text })}
                    placeholder="Enter your name"
                    placeholderTextColor="#666"
                  />
                </GradientInput>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <GradientInput>
                  <TextInput
                    style={styles.inputInner}
                    value={profile.email}
                    onChangeText={(text) => setProfile({ ...profile, email: text })}
                    keyboardType="email-address"
                    placeholder="Enter your email"
                    placeholderTextColor="#666"
                  />
                </GradientInput>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone</Text>
                <GradientInput>
                  <TextInput
                    style={styles.inputInner}
                    value={profile.phone}
                    onChangeText={(text) => setProfile({ ...profile, phone: text })}
                    keyboardType="phone-pad"
                    placeholder="Enter your phone"
                    placeholderTextColor="#666"
                  />
                </GradientInput>
              </View>

              <View style={styles.row}>
                <SelectInput
                  label="Gender"
                  value={profile.gender}
                  onValueChange={(val) => setProfile({ ...profile, gender: val })}
                  items={[
                    { label: 'Male', value: 'Male' },
                    { label: 'Female', value: 'Female' },
                    { label: 'Other', value: 'Other' }
                  ]}
                  placeholder="Select Gender"
                />

                <SelectInput
                  label="Gender Preference"
                  value={profile.genderPreference}
                  onValueChange={(val) => setProfile({ ...profile, genderPreference: val })}
                  items={[
                    { label: 'Male', value: 'Male' },
                    { label: 'Female', value: 'Female' },
                    { label: 'Both', value: 'Both' }
                  ]}
                  placeholder="Select Gender Preference"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Height (cm)</Text>
                  <GradientInput>
                    <TextInput
                      style={styles.inputInner}
                      value={String(profile.height)}
                      onChangeText={(text) => setProfile({ ...profile, height: Number(text) })}
                      keyboardType="numeric"
                      placeholder="150"
                      placeholderTextColor="#666"
                    />
                  </GradientInput>
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Weight (kg)</Text>
                  <GradientInput>
                    <TextInput
                      style={styles.inputInner}
                      value={String(profile.weight)}
                      onChangeText={(text) => setProfile({ ...profile, weight: Number(text) })}
                      keyboardType="numeric"
                      placeholder="65"
                      placeholderTextColor="#666"
                    />
                  </GradientInput>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Skin Color</Text>
                <GradientInput>
                  <TextInput
                    style={styles.inputInner}
                    value={profile.skin_color}
                    onChangeText={(text) => setProfile({ ...profile, skin_color: text })}
                    placeholderTextColor="#666"
                    placeholder="Fair, Wheatish, Dark"
                  />
                </GradientInput>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Profession</Text>
                <GradientInput>
                  <TextInput
                    style={styles.inputInner}
                    value={profile.profession}
                    onChangeText={(text) =>
                      setProfile({ ...profile, profession: text })
                    }
                    placeholder="Software Engineer"
                    placeholderTextColor="#666"
                  />
                </GradientInput>
              </View>

              <View style={styles.inputGroup}>

                <SelectInput
                  label="Marital Status"
                  value={profile.marital_status}
                  onValueChange={(val) => setProfile({ ...profile, marital_status: val })}
                  items={[
                    { label: 'Married', value: 'married' },
                    { label: 'Unmarried', value: 'unmarried' },
                    { label: 'Widow', value: 'widow' }
                  ]}
                  placeholder="Select Marital Status"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Country</Text>
                <GradientInput>
                  <TextInput
                    style={styles.inputInner}
                    value={profile.address.country}
                    onChangeText={(text) =>
                      setProfile({ ...profile, address: { ...profile.address, country: text } })
                    }
                    placeholder="India"
                    placeholderTextColor="#666"
                  />
                </GradientInput>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>State</Text>
                <GradientInput>
                  <TextInput
                    style={styles.inputInner}
                    value={profile.address.state}
                    onChangeText={(text) =>
                      setProfile({ ...profile, address: { ...profile.address, state: text } })
                    }
                    placeholder="Gujarat"
                    placeholderTextColor="#666"
                  />
                </GradientInput>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>City</Text>
                <GradientInput>
                  <TextInput
                    style={styles.inputInner}
                    value={profile.address.city}
                    onChangeText={(text) =>
                      setProfile({ ...profile, address: { ...profile.address, city: text } })
                    }
                    placeholder="Surat"
                    placeholderTextColor="#666"
                  />
                </GradientInput>
              </View>

              <View style={styles.inputGroup}>

                <SelectInput

                  label="Category"
                  value={profile.category}
                  onValueChange={(val) => setProfile({ ...profile, category: val })}
                  items={[
                    { label: 'Casual Dating', value: 'Casual Dating' },
                    { label: 'Serious Relationship', value: 'Serious Relationship' },
                    { label: 'Friendship', value: 'Friendship' }
                  ]}
                  placeholder="Select Category"
                />
              </View>


              <View style={styles.inputGroup}>
                <Text style={styles.label}>About</Text>
                <GradientInput>
                  <TextInput
                    style={[styles.inputInner, styles.textArea]}
                    value={profile.about}
                    onChangeText={(text) => setProfile({ ...profile, about: text })}
                    multiline
                    numberOfLines={4}
                    placeholder="About yourself"
                    placeholderTextColor="#666"
                  />
                </GradientInput>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Likes (comma-separated)</Text>
                <GradientInput>
                  <TextInput
                    style={styles.inputInner}
                    value={profile.likes?.join(', ')}
                    onChangeText={(text) =>
                      setProfile({ ...profile, likes: text.split(',').map(item => item.trim()) })
                    }
                    placeholder="Movies, Travel"
                    placeholderTextColor="#666"
                  />
                </GradientInput>
              </View>

              <View style={styles.inputGroup}>

                <MultipleSelectInput
                  label="Interests"
                  value={profile.interests.map((i) => (typeof i === 'string' ? i : i._id))}
                  onValueChange={handleInterestsChange}
                  items={interests.map((interest) => ({
                    label: interest.name,
                    value: interest.id,
                  }))}
                  placeholder="Select Interests"
                />

              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Hobbies</Text>
                <GradientInput>
                  <TextInput
                    style={styles.inputInner}
                    value={profile.hobbies?.join(', ')}
                    onChangeText={(text) =>
                      setProfile({ ...profile, hobbies: text.split(',').map(item => item.trim()) })
                    }
                    placeholder="Reading, Dancing"
                    placeholderTextColor="#666"
                  />
                </GradientInput>
              </View>
            </View>
          </>
        }
      />

      <View style={styles.footer}>
        <Pressable disabled={updating} onPress={handleUpdateProfile} style={styles.updateWrapper}>
          <LinearGradient
            colors={['#FF00FF', '#8A2BE2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.updateButton}
          >
            <Text style={styles.updateButtonText}>{updating ? "Updating..." : "Update"}</Text>
          </LinearGradient>
        </Pressable>
      </View>

    </View >
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
    fontSize: 24,
    color: '#FF00FF',
    textShadowColor: '#FF00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#00ffff',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#00ffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 6,
  },
  label: {
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 14,
    color: '#FF00FF',
    marginBottom: 8,
  },
  input: {
    height: 48,
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#FF00FF',
    borderRadius: 24,
    paddingHorizontal: 16,
    color: '#FFF',
    fontFamily: 'Rajdhani',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectInput: {
    height: 48,
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#FF00FF',
    borderRadius: 24,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    color: '#FFF',
    fontFamily: 'Rajdhani',
  },
  locationInput: {
    height: 48,
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#FF00FF',
    borderRadius: 24,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    color: '#FFF',
    fontFamily: 'Rajdhani',
    flex: 1,
  },
  sectionTitle: {
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 16,
    color: '#FF00FF',
    marginTop: 16,
    marginBottom: 8,
  },
  interestButton: {
    height: 48,
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#FF00FF',
    borderRadius: 24,
    paddingHorizontal: 16,
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 24,
  },
  photoItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF00FF',
  },
  addPhotoButton: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF00FF',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 20,
  },

  updateWrapper: {
    width: '100%',
  },

  updateButton: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF00FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
    width: '100%',
  },

  updateButtonText: {
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  gradientBorder: {
    padding: 2,
    borderRadius: 24,
    marginBottom: 16,
  },
  inputInner: {
    height: 48,
    backgroundColor: '#000',
    borderRadius: 22,
    paddingHorizontal: 16,
    color: '#FFF',
    fontFamily: 'Rajdhani',
    justifyContent: 'center',
  },

  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },

});