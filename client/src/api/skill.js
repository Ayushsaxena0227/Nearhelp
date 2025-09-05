import { auth } from "../utils/firebase";
import axios from "axios";

const API_URL = "http://localhost:5007";

export const createSkillAPI = async (skillData) => {
  const token = await auth.currentUser.getIdToken();
  const res = await axios.post(`${API_URL}/skills`, skillData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Reverted to the simple getSkills function
export const getSkillsAPI = async () => {
  const token = await auth.currentUser.getIdToken();
  const res = await axios.get(`${API_URL}/skills`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  // console.log(res);
  return res.data;
};
