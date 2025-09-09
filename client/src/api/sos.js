import { auth } from "../utils/firebase";
import axios from "axios";
const API_URL = "http://localhost:5007";

export const createSOSAPI = async (sosData) => {
  const token = await auth.currentUser.getIdToken();
  const res = await axios.post(`${API_URL}/sos`, sosData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
