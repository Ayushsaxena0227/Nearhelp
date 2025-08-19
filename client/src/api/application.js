import axios from "axios";
import { auth } from "../utils/firebase";

const API_BASE = "http://localhost:5007";

export const applyToNeed = async (needId, message) => {
  const token = await auth.currentUser.getIdToken();
  const res = await axios.post(
    `${API_BASE}/applications/apply`,
    { needId, message },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

export const getApplicationsForNeed = async (needId) => {
  const token = await auth.currentUser.getIdToken();
  const res = await axios.get(`${API_BASE}/applications/${needId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// NEW: Get apps for posts I own
export const getApplicationsForOwner = async () => {
  const token = await auth.currentUser.getIdToken();
  const res = await axios.get(`${API_BASE}/applications/forOwner/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// NEW: Update app status
export const updateApplicationStatus = async (appId, status) => {
  const token = await auth.currentUser.getIdToken();
  const res = await axios.post(
    `${API_BASE}/applications/updateStatus`,
    { appId, status },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const getApplicationsByHelper = async () => {
  try {
    const token = await auth.currentUser.getIdToken();
    const res = await axios.get(`${API_BASE}/applications/by-helper`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching applications by helper:", error);
    return []; // Return empty array on error
  }
};
