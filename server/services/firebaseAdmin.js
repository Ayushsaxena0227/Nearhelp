import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Parse the Firebase admin key and fix the private key formatting
const firebaseKey = JSON.parse(process.env.FIREBASE_ADMIN_KEY);

// Replace escaped newlines with actual newlines in the private key
if (firebaseKey.private_key) {
  firebaseKey.private_key = firebaseKey.private_key.replace(/\\n/g, "\n");
}

admin.initializeApp({
  credential: admin.credential.cert(firebaseKey),
});

export default admin;
