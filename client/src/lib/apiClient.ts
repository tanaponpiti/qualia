import axios from "axios";

export async function sendToServer(text: string) {
  try {
    const response = await axios.post("/api/chat", { text });

    if (response.status === 200) {
      console.log("Server response:", response.data); // Or handle the response as needed
      return response.data;
    } else {
      console.error("Server request failed:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error sending request:", error);
    return null;
  }
}
