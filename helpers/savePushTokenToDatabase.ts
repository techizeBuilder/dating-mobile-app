import { API_BASE_URL } from "@/app/apiUrl";
import axios from "axios";

export const savePushTokenToDatabase = async (
  expoPushToken: string,
  userToken: string
): Promise<boolean> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/user/notification-token`,
      {
        notificationToken: expoPushToken,
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    console.log("Response: ", response.data);

    if (response.data.status) {
      console.log("Push token saved successfully ✅");
      return true;
    } else {
      console.log("Failed to save push token");
      return false;
    }
  } catch (error) {
    console.error("Error saving push token:", error);
    return false;
  }
};
