import { auth } from "../utils/firebase";
import axios from "axios";

const API_URL = "http://localhost:5007";

export const getUserProfileAPI = async (userId) => {
  const token = await auth.currentUser.getIdToken();
  const res = await axios.get(`${API_URL}/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
