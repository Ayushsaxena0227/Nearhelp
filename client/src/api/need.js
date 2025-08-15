import { auth } from "../utils/firebase";

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

export const getNeeds = async () => {
  const res = await fetch("http://localhost:5007/needs");
  return res.json();
};
