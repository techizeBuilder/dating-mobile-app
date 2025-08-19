import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useUserProfile } from "../context/userContext";
import { API_BASE_URL } from "../apiUrl";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";
import { useInterests } from "../context/interestContext";
import SelectInput from "@/components/SelectInput";
import MultipleSelectInput from "@/components/MultiSelectInput";

type Address = {
  country: string;
  state: string;
  city: string;
  pincode: string;
  locality: string;
};

interface ProfileData {
  name: string;
  email: string;
  i_am: string;
  interested_in: string;
  age: number | null;
  about: string;
  likes: string[];
  interests: string[];
  hobbies: string[];
  skin_color: string;
  height: number | null;
  weight: number | null;
  address: Address;
  profession: string;
  marital_status: string;
  category: string;
}

export default function ProfileScreen() {
  const { updateProfile, profile: contextProfile, token } = useUserProfile();
  const [isLoading, setIsLoading] = useState(false);
  console.log("context profile in final step : ", contextProfile);

  const [interests, setInterests] = useState([]);
  useEffect(() => {
    const fetchAndStoreInterests = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/interests`);
        const data = await response.json();
        console.log("Response:", data);
        setInterests(data.interests || []);
      } catch (error) {
        console.error("Error fetching interests:", error);
      }
    };

    fetchAndStoreInterests();
  }, []);

  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    i_am: "",
    interested_in: "",
    age: null,
    about: "",
    likes: [],
    interests: [],
    hobbies: [],
    skin_color: "",
    height: null,
    weight: null,
    address: {
      country: "",
      state: "",
      city: "",
      pincode: "",
      locality: "",
    },
    profession: "",
    marital_status: "",
    category: "",
  });

  const isValid = () => {
    return (
      profile.name.trim() !== "" &&
      profile.email.trim() !== "" &&
      profile.about.trim() !== ""
    );
  };

  const handleChange = (field: keyof ProfileData, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (field: keyof Address, value: string) => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      address: {
        ...prevProfile.address,
        [field]: value,
      },
    }));
  };

  const handleInterestsChange = (selectedItems: any[]) => {
    const idsOnly = selectedItems
      .map((item) => {
        if (!item) return null;
        if (typeof item === "string") return item;
        if (typeof item === "object" && item.value) return item.value;
        return null;
      })
      .filter(Boolean);

    setProfile({ ...profile, interests: idsOnly });
  };

  // Function to handle comma separated array values for likes, interests, and hobbies
  const handleArrayChange = (field: keyof ProfileData, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value.split(",").map((item) => item.trim()),
    }));
  };

  const parseCommaSeparated = (text: string): string[] =>
    text
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0); // this line removes empty items


  const handleContinue = async () => {
    if (isValid()) {
      const cleanedProfile = {
        name: profile.name.trim(),
        email: profile.email.trim(),
        i_am: contextProfile.i_am || "",
        interested_in: contextProfile.interested_in || "",
        mobile: contextProfile.mobile,
        country_code: contextProfile.country_code,
        profession: profile.profession.trim(),
        marital_status: profile.marital_status.trim(),

        // UI-based fields
        about: profile.about.trim(),
        interests: profile.interests,
        skin_color: profile.skin_color.trim(),
        height: profile.height ?? 0,
        weight: profile.weight ?? 0,
        address: profile.address,
        age: profile.age ?? 0,
        // hobbies: profile.hobbies,
        // likes: profile.likes,
        hobbies: parseCommaSeparated(profile.hobbies.join(",")),
        likes: parseCommaSeparated(profile.likes.join(",")),
        category: profile.category.trim() || "Friendship",
      };

      updateProfile(cleanedProfile);
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE_URL}/user/profile/setup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(cleanedProfile),
        });

        const data = await res.json();
        console.log("Profile Setup API Response:", data);
        if (data.status) {
          Toast.show({
            type: "success",
            text1: "Profile Created",
            text2: "Welcome aboard!",
            position: "top",
          });

          router.push("/auth/notifications");
        } else {
          Toast.show({
            type: "error",
            text1: "Setup Failed",
            text2: data.errors?.[0]?.message || "Something went wrong.",
            position: "top",
          });
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error("Setup error:", error);
        Toast.show({
          type: "error",
          text1: "Network Error",
          text2: "Please try again later.",
          position: "top",
        });
      }
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <ArrowLeft size={24} color="#FF00FF" />
      </Pressable>

      <Text style={styles.title}>Create Your Profile</Text>
      <Text style={styles.subtitle}>Tell us about yourself</Text>
      <FlatList
        data={[]}
        keyExtractor={() => "dummy"}
        renderItem={null}
        showsVerticalScrollIndicator={false}
        style={styles.form}
        ListHeaderComponent={
          <>
            {/* Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name*</Text>
              <LinearGradient
                colors={["#FF00FF", "#00FFFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.inputGradient}
              >
                <View style={{ backgroundColor: "#000", borderRadius: 10 }}>
                  <TextInput
                    style={styles.input}
                    value={profile.name}
                    onChangeText={(text) => handleChange("name", text)}
                    placeholderTextColor="#666"
                    placeholder="e.g. John Doe"
                  />
                </View>
              </LinearGradient>
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email*</Text>
              <LinearGradient
                colors={["#FF00FF", "#00FFFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.inputGradient}
              >
                <View style={{ backgroundColor: "#000", borderRadius: 10 }}>
                  <TextInput
                    style={styles.input}
                    value={profile.email}
                    onChangeText={(text) => handleChange("email", text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#666"
                    placeholder="e.g. farhan@gmail.com"
                  />
                </View>
              </LinearGradient>
            </View>

            {/* About You */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>About You*</Text>
              <LinearGradient
                colors={["#FF00FF", "#00FFFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.inputGradient}
              >
                <View style={{ backgroundColor: "#000", borderRadius: 10 }}>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={profile.about}
                    onChangeText={(text) => handleChange("about", text)}
                    multiline
                    numberOfLines={4}
                    placeholderTextColor="#666"
                    placeholder="e.g. I am a software engineer..."
                  />
                </View>
              </LinearGradient>
            </View>

            {/* Interests */}
            <View>
              <MultipleSelectInput
                label="Interests"
                value={profile.interests.map((i) =>
                  typeof i === "string" ? i : i._id
                )}
                onValueChange={handleInterestsChange}
                items={interests.map((interest) => ({
                  label: interest.name,
                  value: interest.id,
                }))}
                placeholder="Select Interests"
              />
            </View>

            {/* Hobbies */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Hobbies (comma separated)</Text>
              <LinearGradient
                colors={["#FF00FF", "#00FFFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.inputGradient}
              >
                <View style={{ backgroundColor: "#000", borderRadius: 10 }}>
                  <TextInput
                    style={styles.input}
                    value={profile.hobbies.join(", ")}
                    onChangeText={(text) => handleArrayChange("hobbies", text)}
                    placeholderTextColor="#666"
                    placeholder="e.g. Swimming, Drawing"
                  />
                </View>
              </LinearGradient>
            </View>

            {/* Height & Weight */}
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Height (cm)</Text>
                <LinearGradient
                  colors={["#FF00FF", "#00FFFF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.inputGradient}
                >
                  <View style={{ backgroundColor: "#000", borderRadius: 10 }}>
                    <TextInput
                      style={styles.input}
                      value={profile.height ? profile.height.toString() : ""}
                      onChangeText={(text) =>
                        handleChange("height", Number(text))
                      }
                      keyboardType="numeric"
                      placeholderTextColor="#666"
                      placeholder="e.g. 180"
                    />
                  </View>
                </LinearGradient>
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Weight (kg)</Text>
                <LinearGradient
                  colors={["#FF00FF", "#00FFFF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.inputGradient}
                >
                  <View style={{ backgroundColor: "#000", borderRadius: 10 }}>
                    <TextInput
                      style={styles.input}
                      value={profile.weight ? profile.weight.toString() : ""}
                      onChangeText={(text) =>
                        handleChange("weight", Number(text))
                      }
                      keyboardType="numeric"
                      placeholderTextColor="#666"
                      placeholder="e.g. 70"
                    />
                  </View>
                </LinearGradient>
              </View>
            </View>

            {/* Skin Color */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Skin Color</Text>
              <LinearGradient
                colors={["#FF00FF", "#00FFFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.inputGradient}
              >
                <View style={{ backgroundColor: "#000", borderRadius: 10 }}>
                  <TextInput
                    style={styles.input}
                    value={profile.skin_color}
                    onChangeText={(text) => handleChange("skin_color", text)}
                    placeholderTextColor="#666"
                    placeholder="e.g. Fair, Brown"
                  />
                </View>
              </LinearGradient>
            </View>

            {/** Age & Category */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Age</Text>
              <LinearGradient
                colors={["#FF00FF", "#00FFFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.inputGradient}
              >
                <View style={{ backgroundColor: "#000", borderRadius: 10 }}>
                  <TextInput
                    style={styles.input}
                    value={profile.age ? profile.age.toString() : ""}
                    onChangeText={(text) => handleChange("age", Number(text))}
                    keyboardType="numeric"
                    placeholderTextColor="#666"
                    placeholder="e.g. 25"
                  />
                </View>
              </LinearGradient>
            </View>

            {/* Marital Status */}
            <View>
              <SelectInput
                label="Marital Status"
                value={profile.marital_status}
                onValueChange={(val) =>
                  setProfile({ ...profile, marital_status: val })
                }
                items={[
                  { label: "Married", value: "married" },
                  { label: "Unmarried", value: "unmarried" },
                  { label: "Widow", value: "widow" },
                ]}
                placeholder="Select Marital Status"
              />
            </View>

            {/* Profession */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Profession</Text>
              <LinearGradient
                colors={["#FF00FF", "#00FFFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.inputGradient}
              >
                <View style={{ backgroundColor: "#000", borderRadius: 10 }}>
                  <TextInput
                    style={styles.input}
                    value={profile.profession}
                    onChangeText={(text) => handleChange("profession", text)}
                    placeholderTextColor="#666"
                    placeholder="e.g. Software Engineer"
                  />
                </View>
              </LinearGradient>
            </View>

            {/* Category */}
            <View>
              <SelectInput
                label="Category"
                value={profile.category}
                onValueChange={(val) =>
                  setProfile({ ...profile, category: val })
                }
                items={[
                  { label: "Casual Dating", value: "Casual Dating" },
                  {
                    label: "Serious Relationship",
                    value: "Serious Relationship",
                  },
                  { label: "Friendship", value: "Friendship" },
                ]}
                placeholder="Select Category"
              />
            </View>

            {/* Likes */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Likes (comma separated)</Text>
              <LinearGradient
                colors={["#FF00FF", "#00FFFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.inputGradient}
              >
                <View style={{ backgroundColor: "#000", borderRadius: 10 }}>
                  <TextInput
                    style={styles.input}
                    value={profile.likes.join(", ")}
                    onChangeText={(text) => handleArrayChange("likes", text)}
                    placeholderTextColor="#666"
                    placeholder="e.g. Gym, Music"
                  />
                </View>
              </LinearGradient>
            </View>

            {/* Address Fields */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Country</Text>
              <LinearGradient
                colors={["#FF00FF", "#00FFFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.inputGradient}
              >
                <View style={{ backgroundColor: "#000", borderRadius: 10 }}>
                  <TextInput
                    style={styles.input}
                    value={profile.address.country}
                    onChangeText={(text) =>
                      handleAddressChange("country", text)
                    }
                    placeholderTextColor="#666"
                    placeholder="e.g. India, USA"
                  />
                </View>
              </LinearGradient>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>State</Text>
              <LinearGradient
                colors={["#FF00FF", "#00FFFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.inputGradient}
              >
                <View style={{ backgroundColor: "#000", borderRadius: 10 }}>
                  <TextInput
                    style={styles.input}
                    value={profile.address.state}
                    onChangeText={(text) => handleAddressChange("state", text)}
                    placeholderTextColor="#666"
                    placeholder="e.g. Maharashtra, California"
                  />
                </View>
              </LinearGradient>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>City</Text>
              <LinearGradient
                colors={["#FF00FF", "#00FFFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.inputGradient}
              >
                <View style={{ backgroundColor: "#000", borderRadius: 10 }}>
                  <TextInput
                    style={styles.input}
                    value={profile.address.city}
                    onChangeText={(text) => handleAddressChange("city", text)}
                    placeholderTextColor="#666"
                    placeholder="e.g. Mumbai, Los Angeles"
                  />
                </View>
              </LinearGradient>
            </View>

            {/* <View style={styles.inputContainer}>
              <Text style={styles.label}>Locality</Text>
              <LinearGradient
                colors={["#FF00FF", "#00FFFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.inputGradient}
              >
                <View style={{ backgroundColor: "#000", borderRadius: 10 }}>
                  <TextInput
                    style={styles.input}
                    value={profile.address.locality}
                    onChangeText={(text) =>
                      handleAddressChange("locality", text)
                    }
                    placeholderTextColor="#666"
                    placeholder="e.g. Downtown, Andheri East"
                  />
                </View>
              </LinearGradient>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Pincode</Text>
              <LinearGradient
                colors={["#FF00FF", "#00FFFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.inputGradient}
              >
                <View style={{ backgroundColor: "#000", borderRadius: 10 }}>
                  <TextInput
                    style={styles.input}
                    value={profile.address.pincode}
                    onChangeText={(text) =>
                      handleAddressChange("pincode", text)
                    }
                    keyboardType="numeric"
                    placeholderTextColor="#666"
                    placeholder="e.g. 400001, 90001"
                  />
                </View>
              </LinearGradient>
            </View> */}

            <Pressable
              onPress={handleContinue}
              disabled={!isValid()}
              style={{
                width: "100%",
                opacity: !isValid() ? 0.5 : 1,
              }}
            >
              <LinearGradient
                colors={['#FF00FF', '#8A2BE2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  height: 48,
                  borderRadius: 24,
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#FF00FF",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 10,
                  elevation: 5,
                  width: "100%",
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Rajdhani-SemiBold',
                    fontSize: 20,
                    color: '#FFFFFF',
                  }}
                >
                  {isLoading ? "Loading..." : "Continue"}
                </Text>
              </LinearGradient>
            </Pressable>
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 24,
  },
  backButton: {
    marginTop: 24,
    marginBottom: 16,
  },
  title: {
    fontFamily: "Orbitron-Bold",
    fontSize: 28,
    color: "#FF00FF",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Rajdhani",
    fontSize: 18,
    color: "#00FFFF",
    marginBottom: 24,
    fontWeight: 'bold',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 16,
    color: "#FF00FF",
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    color: "#fff",
    fontFamily: "Rajdhani",
    fontSize: 16,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
    paddingTop: 16,
  },
  inputGradient: {
    borderRadius: 12,
    padding: 2,
  },

  row: {
    flexDirection: "row",
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  button: {
    width: "100%",
    height: 56,
    backgroundColor: "#FF00FF",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF00FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
    marginVertical: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 18,
    color: "#000000",
  },
});
