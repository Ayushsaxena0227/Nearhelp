import { auth } from "../utils/firebase";
import axios from "axios";

const API_URL = "http://localhost:5007";
export const createNeed = async (needData) => {
  const token = await auth.currentUser.getIdToken();
  const res = await axios.post(`${API_URL}/needs`, needData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getNearbyNeedsAPI = async (location, radius = 10) => {
  const token = await auth.currentUser.getIdToken();
  const res = await axios.get(`${API_URL}/needs/nearby`, {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      lat: location.latitude,
      lng: location.longitude,
      radius,
    },
  });
  return res.data;
};

// This is the old function to get all needs, which can be kept as a fallback
export const getNeedsAPI = async (location = null, radius = 25) => {
  const token = await auth.currentUser.getIdToken();
  const params = {};
  if (location) {
    params.userLat = location.latitude;
    params.userLon = location.longitude;
    params.radius = radius;
  }
  const res = await axios.get(`${API_URL}/needs`, {
    headers: { Authorization: `Bearer ${token}` },
    params, // Pass params object
  });
  return res.data;
};
