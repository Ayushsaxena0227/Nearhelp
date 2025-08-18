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
} from "lucide-react";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth } from "../../utils/firebase";

export default function Chat() {
  const { matchId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [match, setMatch] = useState(null);
  const [typing, setTyping] = useState(false);
  const db = getFirestore();
  const bottomRef = useRef();
  const inputRef = useRef();

  // Subscribe to real-time message updates
  useEffect(() => {
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Auto-focus input
    inputRef.current?.focus();
  }, []);

  // TODO: Fetch match details from your backend
  // For now using basic data structure
  useEffect(() => {
    // You might want to add an API call here to get match details
    // const fetchMatchDetails = async () => {
    //   const matchData = await getMatchDetails(matchId);
    //   setMatch(matchData);
    // };
    // fetchMatchDetails();

    // Temporary match data - replace with your API call
    setMatch({
      matchId: matchId,
      otherName: "Helper", // You'll get this from your backend
      otherInitials: "H",
      needTitle: "Help Request",
      status: "active",
      lastSeen: "Recently",
    });
  }, [matchId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    await addDoc(collection(db, "matches", matchId, "messages"), {
      senderUid: auth.currentUser.uid,
      text: input.trim(),
      createdAt: serverTimestamp(),
    });
    setInput("");
  };

  const formatTime = (date) => {
    if (!date) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getMessageStatus = (message) => {
    // You can enhance this based on your message status logic
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

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Chat Header */}
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
              {match.otherInitials}
            </span>
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">{match.otherName}</h2>
            <p className="text-xs text-gray-500">
              {typing ? (
                <span className="flex items-center">
                  <span className="flex space-x-1 mr-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </span>
                  typing...
                </span>
              ) : (
                `Last seen ${match.lastSeen}`
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Info className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Need Context Banner */}
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

      {/* Messages Area */}
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
                          {match.otherInitials}
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

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSend} className="flex items-end space-x-3">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32 min-h-[48px] text-sm placeholder-gray-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
              rows={1}
              style={{
                height: "auto",
                minHeight: "48px",
              }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 128) + "px";
              }}
            />

            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>

          <button
            type="submit"
            disabled={!input.trim()}
            className={`p-3 rounded-full transition-all ${
              input.trim()
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl"
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
    </div>
  );
}
