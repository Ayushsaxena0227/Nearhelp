import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Send,
  ArrowLeft,
  MoreVertical,
  Phone,
  Video,
  Info,
  Paperclip,
  Smile,
  Image as ImageIcon,
  CheckCircle,
} from "lucide-react";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
} from "firebase/firestore";
import { auth } from "../../utils/firebase";
import { getMatchDetailsAPI, sendMessage } from "../../api/matches"; // 1. Import sendMessage
import ReviewModal from "../../components/ReviewModal";
import { formatDistanceToNow } from "date-fns";

export default function Chat() {
  const { matchId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [match, setMatch] = useState(null);
  const db = getFirestore();
  const bottomRef = useRef();
  const inputRef = useRef();
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    if (!matchId) return;
    const q = query(
      collection(db, "matches", matchId, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const messagesData = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() || new Date(),
      }));
      setMessages(messagesData);
    });
    return unsub;
  }, [matchId]);

  useEffect(() => {
    if (!matchId) return;
    const unsub = onSnapshot(doc(db, "matches", matchId), (docSnap) => {
      if (docSnap.exists()) {
        getMatchDetailsAPI(matchId).then(setMatch).catch(console.error);
      } else {
        setMatch(null);
      }
    });
    return unsub;
  }, [matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 👇 2. UPDATED: This function now correctly calls your backend API
  const handleSend = async (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    setInput(""); // Clear input immediately for a snappy UI
    try {
      // Call the backend API to send the message and trigger the notification
      await sendMessage(matchId, trimmedInput);
    } catch (error) {
      console.error("Failed to send message:", error);
      setInput(trimmedInput); // Restore input if sending fails
      alert("Message could not be sent. Please try again.");
    }
  };

  const handleReviewSubmitted = () => {
    setShowReviewModal(false);
  };

  const formatTime = (date) => {
    if (!date) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getMessageStatus = (message) => {
    return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
  };

  if (!match) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  const isCurrentUserSeeker = auth.currentUser.uid === match.seekerUid;
  let lastSeenText = "Online";
  if (match.otherUserLastSeen?.seconds) {
    const lastSeenDate = new Date(match.otherUserLastSeen.seconds * 1000);
    lastSeenText = `Last seen ${formatDistanceToNow(lastSeenDate, {
      addSuffix: true,
    })}`;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors lg:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {match.otherUserInitials}
            </span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">
              {match.otherUserName}
            </h2>
            <p className="text-xs text-gray-500">{lastSeenText}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isCurrentUserSeeker && match.status !== "completed" && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="flex items-center px-4 py-2 text-sm font-semibold bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
            >
              <CheckCircle size={16} className="mr-2" /> Mark as Complete
            </button>
          )}
          {match.status === "completed" && (
            <div className="flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg">
              <CheckCircle size={16} className="mr-2" /> Completed
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border-b border-blue-100 px-4 py-3">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm font-medium text-blue-900">
              Connected about: {match.needTitle}
            </p>
            <p className="text-xs text-blue-600">
              Help each other safely and be kind! 🤝
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            if (msg.type === "system") {
              return (
                <div key={msg.id} className="flex justify-center my-4">
                  <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
                    <CheckCircle size={14} className="mr-2 text-green-500" />
                    {msg.text}
                  </div>
                </div>
              );
            }
            const isOwnMessage = msg.senderUid === auth.currentUser.uid;
            const showTimeStamp =
              index === 0 ||
              Math.abs(
                new Date(messages[index - 1].createdAt).getTime() -
                  new Date(msg.createdAt).getTime()
              ) >
                5 * 60 * 1000;
            return (
              <div key={msg.id}>
                {showTimeStamp && (
                  <div className="flex justify-center mb-4">
                    <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full border">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                )}
                <div
                  className={`flex ${
                    isOwnMessage ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex items-end space-x-2 max-w-[70%] ${
                      isOwnMessage ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    {!isOwnMessage && (
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-medium text-xs">
                          {match.otherUserInitials}
                        </span>
                      </div>
                    )}
                    <div
                      className={`relative px-4 py-2 rounded-2xl max-w-full ${
                        isOwnMessage
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                          : "bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm"
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words">
                        {msg.text}
                      </p>
                      {isOwnMessage && (
                        <div className="flex items-center justify-end mt-1 space-x-1">
                          <span className="text-xs text-blue-100">
                            {formatTime(msg.createdAt)}
                          </span>
                          {getMessageStatus(msg)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSend} className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 resize-none max-h-32 text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Type a message..."
              rows={1}
              style={{ height: "auto", minHeight: "48px" }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 128) + "px";
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim()}
            className={`p-3 rounded-full transition-all ${
              input.trim()
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Be respectful and kind. Report any inappropriate behavior.
        </p>
      </div>

      {showReviewModal && (
        <ReviewModal
          match={match}
          onClose={() => setShowReviewModal(false)}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
}
