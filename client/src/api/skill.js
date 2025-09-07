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

// This is the old function to get ALL skills
export const getSkillsAPI = async (location = null, radius = 25) => {
  const token = await auth.currentUser.getIdToken();
  const params = {};
  if (location) {
    params.userLat = location.latitude;
    params.userLon = location.longitude;
    params.radius = radius;
  }
  const res = await axios.get(`${API_URL}/skills`, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return res.data;
};

// 👇 THIS IS THE NEW FUNCTION THAT WAS MISSING
export const getNearbySkillsAPI = async (location, radius = 10) => {
  const token = await auth.currentUser.getIdToken();
  const res = await axios.get(`${API_URL}/skills/nearby`, {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      lat: location.latitude,
      lng: location.longitude,
      radius,
    },
  });
  return res.data;
};
