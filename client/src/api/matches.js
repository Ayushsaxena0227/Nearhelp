import axios from "axios";
import { auth } from "../utils/firebase";

const API = "http://localhost:5007";

export const getMatchesForUser = async () => {
  const token = await auth.currentUser.getIdToken();
  const res = await axios.get(`${API}/matches`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getMessages = async (matchId) => {
  const token = await auth.currentUser.getIdToken();
  const res = await axios.get(`${API}/matches/${matchId}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
export const getMatchDetailsAPI = async (matchId) => {
  ``;
  const token = await auth.currentUser.getIdToken();
  const res = await axios.get(`${API}/matches/${matchId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const sendMessage = async (matchId, text) => {
  const token = await auth.currentUser.getIdToken();
  const res = await axios.post(
    `${API}/matches/${matchId}/messages`,
    { text },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const hideMatchAPI = async (matchId) => {
  const token = await auth.currentUser.getIdToken();
  const res = await axios.put(
    `${API_URL}/matches/${matchId}/hide`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};
