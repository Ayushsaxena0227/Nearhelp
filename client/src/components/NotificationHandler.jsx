// import React, { useEffect } from "react";
// import toast from "react-hot-toast";
// import { getMessaging, onMessage } from "firebase/messaging";
// import { requestForToken } from "../utils/firebase-messaging-config";
// import axios from "axios";
// import { auth, app } from "../utils/firebase"; // Make sure 'app' is exported from firebase.js

// const NotificationHandler = () => {
//   // This useEffect handles asking for permission and saving the token.
//   // It runs when the user logs in.
//   useEffect(() => {
//     const setupNotifications = async () => {
//       if (auth.currentUser) {
//         const fcmToken = await requestForToken();
//         if (fcmToken) {
//           try {
//             const authToken = await auth.currentUser.getIdToken();
//             await axios.post(
//               "http://localhost:5007/users/save-fcm-token",
//               { token: fcmToken },
//               { headers: { Authorization: `Bearer ${authToken}` } }
//             );
//           } catch (error) {
//             console.error("Error saving FCM token:", error);
//           }
//         }
//       }
//     };

//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       if (user) {
//         setupNotifications();
//       }
//     });

//     return () => unsubscribe(); // Cleanup the listener
//   }, []);

//   // This useEffect handles listening for FOREGROUND messages.
//   useEffect(() => {
//     const messaging = getMessaging(app);
//     const unsubscribe = onMessage(messaging, (payload) => {
//       console.log("Received foreground message: ", payload);
//       // Show the toast notification
//       toast.custom((t) => (
//         <div
//           className={`${
//             t.visible ? "animate-enter" : "animate-leave"
//           } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
//         >
//           <div className="flex-1 w-0 p-4">
//             <div className="flex items-start">
//               <div className="ml-3 flex-1">
//                 <p className="text-sm font-medium text-gray-900">
//                   {payload.notification.title}
//                 </p>
//                 <p className="mt-1 text-sm text-gray-500">
//                   {payload.notification.body}
//                 </p>
//               </div>
//             </div>
//           </div>
//           <div className="flex border-l border-gray-200">
//             <button
//               onClick={() => toast.dismiss(t.id)}
//               className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       ));
//     });

//     return () => unsubscribe(); // Cleanup the listener when the component unmounts
//   }, []);

//   return null;
// };

// export default NotificationHandler;
