import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
} from "react-native";
import {
  Settings,
  CreditCard as Edit3,
  Crown,
  ChevronRight,
  Camera,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useUserProfile } from "../context/userContext";
import { API_BASE_URL } from "../apiUrl";
import Loading from "@/components/Loading";
import axios from "axios";
import { fixImageUrl } from "../utils/fixImageUrl";

interface Plan {
  _id: string;
  name: string;
  price: number;
  duration_days: number;
  features: string[];
  isPopular: boolean;
}

export default function ProfileScreen() {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { user, setUser, token, loading, setLoading } = useUserProfile();
  const [plans, setPlans] = useState<Plan[]>([]);

  const [pLoading, setPLoading] = useState(false);

  const handleEditProfile = () => {
    router.push("/profile/edit");
  };
  console.log("userData : ", user);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!token) {
        setLoading(false);
        setPLoading(false);
        return;
      }

      try {
        setLoading(true);
        setPLoading(true);

        const [plansResponse, userResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/subscriptions/plans`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Process plans data
        if (
          plansResponse.data?.status &&
          Array.isArray(plansResponse.data.plans)
        ) {
          setPlans(plansResponse.data.plans);
        } else {
          console.warn("Invalid plans data structure received");
          setPlans([]);
        }

        // Process user data with proper interest handling
        if (userResponse.data?.status && userResponse.data.profile) {
          const profileData = userResponse.data.profile;

          // Ensure interests is always an array
          const formattedInterests = Array.isArray(profileData.interests)
            ? profileData.interests
            : [];

          setUser({
            ...profileData,
            interests: formattedInterests,
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        setLoading(false);
        setPLoading(false);
      }
    };

    fetchAllData();
  }, [token, refreshTrigger]); // Add refreshTrigger to dependencies

  interface Plan {
    name: string;
    planId: string;
    price: number;
  }

  const handleUpgrade = (plan: Plan) => {
    console.log("handle upgrade me plan : ", plan);
    router.push({
      pathname: "/payment/method",
      params: {
        name: plan.name,
        planId: plan._id,
        price: plan.price.toString(),
      },
    });
  };

  if (loading) {
    return <Loading />;
  }

  if (showUpgrade) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => setShowUpgrade(false)}
          >
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
          <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
        </View>

        {pLoading ? (
          <Text style={styles.loadingText}>Loading plans...</Text>
        ) : plans.length === 0 ? (
          <Text style={styles.noPlansText}>
            No subscription plans available.
          </Text>
        ) : (
          <ScrollView style={styles.plansContainer}>
            {plans.map((plan) => (
              <View
                key={plan._id}
                style={[styles.planCard, plan.isPopular && styles.popularPlan]}
              >
                {plan.isPopular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>Most Popular</Text>
                  </View>
                )}

                <View style={styles.planHeader}>
                  <Crown size={32} color="#FF00FF" />
                  <Text style={styles.planName}>{plan.name}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.currency}>$</Text>
                    <Text style={styles.price}>{plan.price}</Text>
                    <Text style={styles.interval}>
                      /
                      {plan.duration_days === 30
                        ? "month"
                        : `${plan.duration_days} days`}
                    </Text>
                  </View>
                </View>

                <View style={styles.featuresContainer}>
                  {plan.features?.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Text style={styles.featureText}>• {feature}</Text>
                    </View>
                  ))}
                </View>

                <LinearGradient
                  colors={['#FF00FF', '#8A2BE2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.upgradeButtonGradient}
                >
                  <Pressable onPress={() => handleUpgrade(plan)}>
                    <Text style={styles.upgradeButtonText}>
                      Choose {plan.name}
                    </Text>
                  </Pressable>
                </LinearGradient>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    );
  }


  const fixedProfileImage = fixImageUrl(user?.profile_image);


  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.coverImageContainer}>
            <Image
              source={{ uri: fixedProfileImage }}
              style={styles.coverImage}
            />

            <LinearGradient
              colors={["transparent", "#000"]}
              style={styles.coverGradient}
            />
          </View>

          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: fixedProfileImage }}
              style={styles.avatar}
            />

          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.name || "Jessica Parker"}</Text>
            <Text style={styles.location}>
              {user?.address?.country || "New York, NY"}
            </Text>
          </View>

          <Pressable style={styles.editButton} onPress={handleEditProfile}>
            <Edit3 size={20} color="#03d7fc" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </Pressable>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.matchCount || 0}</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {user?.response ? user?.response : 0}%{" "}
            </Text>
            <Text style={styles.statLabel}>Response</Text>
          </View>

        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <Text style={styles.bioText}>
            {user?.about ||
              "Adventure seeker and coffee enthusiast. Love exploring new places and meeting interesting people. Always up for spontaneous trips and trying new experiences! 🌎✈️"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.interestsContainer}>
            {user?.interests?.length > 0 ? (
              user.interests.map((interest, index) => {
                // Handle both string and object interests
                const interestName =
                  typeof interest === "string"
                    ? interest
                    : interest?.name || interest;

                return (
                  <View key={index} style={styles.interestTag}>
                    <Text style={styles.interestText}>{interestName}</Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.noPlansText}>No interests added yet.</Text>
            )}
          </View>
        </View>

        <Pressable
          style={styles.upgradeCard}
          onPress={() => setShowUpgrade(true)}
        >
          <View style={styles.upgradeContent}>
            <Crown size={32} color="#FF00FF" />
            <View style={styles.upgradeInfo}>
              <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
              <Text style={styles.upgradeSubtitle}>
                Get unlimited matches and more!
              </Text>
            </View>
          </View>
          <ChevronRight size={24} color="#03d7fc" />
        </Pressable>

        <Pressable
          style={styles.settingsButton}
          onPress={() => router.push("/settings")}
        >
          <Settings size={24} color="#FF00FF" />
          <Text style={styles.settingsText}>Settings</Text>
          <ChevronRight size={24} color="#03d7fc" />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: "center",
    paddingBottom: 24,
  },
  coverImageContainer: {
    width: "100%",
    height: 200,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  avatarContainer: {
    marginTop: -50,
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#03d7fc",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#000",
    borderWidth: 2,
    borderColor: "#03d7fc",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    alignItems: "center",
    marginTop: 16,
  },
  name: {
    fontFamily: "Orbitron-Bold",
    fontSize: 24,
    color: "#FF00FF",
    marginBottom: 4,
  },
  location: {
    fontFamily: "Rajdhani",
    fontSize: 16,
    color: "#00FFFF",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderWidth: 1,
    borderColor: "#03d7fc",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 8,
  },
  editButtonText: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 16,
    color: "#03d7fc",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 24,
    marginHorizontal: 20,
    borderRadius: 16,
    // backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderWidth: 1,
    borderColor: "#03d7fc",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontFamily: "Orbitron-Bold",
    fontSize: 24,
    color: "#03d7fc",
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: "Rajdhani",
    fontSize: 14,
    color: "#FFF",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#03d7fc",
    opacity: 0.5,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontFamily: "Orbitron-Bold",
    fontSize: 18,
    color: "#FF00FF",
    marginBottom: 12,
  },
  bioText: {
    fontFamily: "Rajdhani",
    fontSize: 16,
    color: "#FFF",
    lineHeight: 24,
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  interestTag: {
    // backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderWidth: 1,
    borderColor: "#03d7fc",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  interestText: {
    fontFamily: "Rajdhani",
    fontSize: 14,
    color: "#03d7fc",
  },
  upgradeCard: {
    margin: 20,
    padding: 20,
    // backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderWidth: 2,
    borderColor: "#03d7fc",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  upgradeContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  upgradeInfo: {
    flex: 1,
  },
  upgradeTitle: {
    fontFamily: "Orbitron-Bold",
    fontSize: 18,
    color: "#FF00FF",
    marginBottom: 4,
  },
  upgradeSubtitle: {
    fontFamily: "Rajdhani",
    fontSize: 14,
    color: "#FFF",
  },
  settingsButton: {
    margin: 20,
    padding: 20,
    // backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderWidth: 1,
    borderColor: "#03d7fc",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  settingsText: {
    flex: 1,
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 16,
    color: "#FFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 24,
    color: "#FF00FF",
  },
  plansContainer: {
    padding: 20,
    marginBottom: 20
  },
  planCard: {
    // backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderWidth: 2,
    borderColor: "#03d7fc",
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  popularPlan: {
    borderColor: "#00FFFF",
    backgroundColor: "rgba(0, 255, 255, 0.1)",
  },
  popularBadge: {
    position: "absolute",
    top: -12,
    right: 24,
    backgroundColor: "#00FFFF",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  popularText: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 12,
    color: "#000",
  },
  planHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  planName: {
    fontFamily: "Orbitron-Bold",
    fontSize: 24,
    color: "#FF00FF",
    marginVertical: 12,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  currency: {
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 24,
    color: "#FF00FF",
  },
  price: {
    fontFamily: "Orbitron-Bold",
    fontSize: 48,
    color: "#FF00FF",
    lineHeight: 48,
  },
  interval: {
    fontFamily: "Rajdhani",
    fontSize: 16,
    color: "#FF00FF",
    marginBottom: 8,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureItem: {
    marginBottom: 12,
  },
  featureText: {
    fontFamily: "Rajdhani",
    fontSize: 16,
    color: "#FFF",
  },
  upgradeButtonGradient: {
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
    paddingHorizontal: 4,
  },

  upgradeButtonText: {
    fontFamily: 'Rajdhani-SemiBold',
    fontSize: 19,
    color: '#FFFFFF',
  },
});
