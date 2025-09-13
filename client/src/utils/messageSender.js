import { refreshFCMToken } from "./firebase-messaging-config";

export const sendMessageWithRetry = async (
  matchId,
  messageText,
  maxRetries = 1
) => {
  const authToken = localStorage.getItem("token");
  if (!authToken) {
    throw new Error("No authentication token found");
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `📤 Sending message (attempt ${attempt + 1}/${maxRetries + 1})...`
      );

      const response = await fetch(
        `http://localhost:5007/matches/${matchId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ text: messageText }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Message sent successfully");
        return result;
      }

      // Handle server errors
      const errorData = await response.json();
      console.error(
        `❌ Server responded with error: ${response.status}`,
        errorData
      );

      // If this is the first attempt and we get a 500 error (which might be FCM token related)
      if (attempt === 0 && response.status === 500) {
        console.log(
          "🔄 First attempt failed, refreshing FCM token and retrying..."
        );

        // Try to refresh the FCM token
        const tokenRefreshed = await refreshFCMToken();
        if (tokenRefreshed) {
          console.log("✅ FCM token refreshed, retrying message send...");
          continue; // Retry the request
        } else {
          console.log("❌ Could not refresh FCM token");
        }
      }

      // If we've exhausted retries or it's a different error, throw
      if (attempt === maxRetries) {
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error(
        `❌ Error sending message (attempt ${attempt + 1}):`,
        error
      );

      // If this is a network error and not the last attempt, continue to retry
      if (
        attempt < maxRetries &&
        (error.name === "TypeError" || error.message.includes("fetch"))
      ) {
        console.log("🔄 Network error, retrying...");
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
        continue;
      }

      // If we've exhausted retries, throw the error
      if (attempt === maxRetries) {
        throw error;
      }
    }
  }
};
