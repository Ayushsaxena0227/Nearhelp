import { auth } from "../utils/firebase";
import axios from "axios";

const API_URL = "http://localhost:5007";

export const submitReportAPI = async (reportData) => {
  const token = await auth.currentUser.getIdToken();
  const res = await axios.post(`${API_URL}/reports`, reportData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
