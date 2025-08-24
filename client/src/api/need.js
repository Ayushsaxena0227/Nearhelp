import { auth } from "../utils/firebase";
import axios from "axios";
const API_URL = "http://localhost:5007";
export const createNeed = async (needData) => {
  const token = await auth.currentUser.getIdToken();
  const res = await fetch("http://localhost:5007/needs/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(needData),
  });
  return res.json();
};
export const getNearbyNeedsAPI = async (location, radius = 10) => {
  const token = await auth.currentUser.getIdToken();
  const res = await axios.get(`${API_URL}/needs/nearby`, {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      lat: location.lat,
      lng: location.lng,
      radius,
    },
  });
  return res.data;
};

export const getNeeds = async () => {
  const res = await fetch("http://localhost:5007/needs");
  return res.json();
};
