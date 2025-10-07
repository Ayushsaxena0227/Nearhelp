import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
  Suspense,
} from "react";
import { useParams } from "react-router-dom";
import { Send, ArrowLeft, CheckCircle, Sparkles } from "lucide-react";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
} from "firebase/firestore";
import { auth } from "../../utils/firebase";
import { getMatchDetailsAPI } from "../../api/matches";
import { formatDistanceToNow } from "date-fns";
import { sendMessageWithRetry } from "../../utils/messageSender";
import { Virtuoso } from "react-virtuoso";

// Lazy-load the review modal to reduce initial bundle
const ReviewModal = React.lazy(() => import("../../components/ReviewModal"));

export default function Chat() {
  const { matchId } = useParams();

  // State
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [match, setMatch] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Refs
  const inputRef = useRef();

  // Stable Firestore instance
  const db = useMemo(() => getFirestore(), []);

  const currentUserUid = auth.currentUser?.uid;

  // Subscribe to messages (ascending)
  useEffect(() => {
    if (!matchId) return;
    let cancelled = false;

    const qMsgs = query(
      collection(db, "matches", matchId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(qMsgs, (snap) => {
      if (cancelled) return;
      const messagesData = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
        };
      });
      setMessages(messagesData);
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [db, matchId]);

  // Fetch static details once, merge live fields from match doc
  useEffect(() => {
    if (!matchId) return;
    let cancelled = false;

    // Fetch static details once (name, initials, needTitle, etc.)
    (async () => {
      try {
        const details = await getMatchDetailsAPI(matchId);
        if (!cancelled) setMatch(details);
      } catch (e) {
        if (!cancelled) console.error(e);
      }
    })();

    // Subscribe to live fields (status, lastSeen ...)
    const unsub = onSnapshot(doc(db, "matches", matchId), (docSnap) => {
      if (cancelled) return;
      if (docSnap.exists()) {
        const live = docSnap.data();
        setMatch((prev) =>
          prev
            ? {
                ...prev,
                status: live.status ?? prev.status,
                otherUserLastSeen:
                  live.otherUserLastSeen ?? prev.otherUserLastSeen,
              }
            : { ...live }
        );
      } else {
        setMatch(null);
      }
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [db, matchId]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Memo: is current user the seeker?
  const isCurrentUserSeeker = useMemo(() => {
    if (!match || !auth.currentUser) return false;
    return auth.currentUser.uid === match.seekerUid;
  }, [match]);

  // Memo: last seen text
  const lastSeenText = useMemo(() => {
    if (!match?.otherUserLastSeen?.seconds) return "Online";
    const lastSeenDate = new Date(match.otherUserLastSeen.seconds * 1000);
    return `Last seen ${formatDistanceToNow(lastSeenDate, {
      addSuffix: true,
    })}`;
  }, [match?.otherUserLastSeen?.seconds]);

  // Prepare messages for rendering (compute isOwn + showTimestamp once)
  const preparedMessages = useMemo(() => {
    let lastTs = null;
    return messages.map((m) => {
      const createdAt =
        m.createdAt instanceof Date ? m.createdAt : new Date(m.createdAt);
      const isOwnMessage = m.senderUid === currentUserUid;
      const showTimeStamp =
        !lastTs ||
        Math.abs(createdAt.getTime() - lastTs.getTime()) > 5 * 60 * 1000;
      lastTs = createdAt;
      return { ...m, createdAt, isOwnMessage, showTimeStamp };
    });
  }, [messages, currentUserUid]);

  // Format time small helper
  const formatTime = useCallback((date) => {
    if (!date) return "";
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, []);

  // Send handler
  const handleSend = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      const messageToSend = String(input || "").trim();
      if (!messageToSend || isSending) return;

      setInput("");
      setIsSending(true);
      try {
        await sendMessageWithRetry(matchId, messageToSend);
      } catch (error) {
        console.error("Failed to send message:", error);
        alert("Message could not be sent. Please try again.");
        setInput(messageToSend); // restore text
      } finally {
        setIsSending(false);
      }
    },
    [input, isSending, matchId]
  );

  const getMessageStatus = useCallback(() => {
    return <div className="w-2 h-2 bg-blue-200 rounded-full"></div>;
  }, []);

  const handleReviewSubmitted = useCallback(() => {
    setShowReviewModal(false);
  }, []);

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mx-auto mb-6 animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl opacity-30 animate-ping"></div>
          </div>
          <p className="text-xl font-semibold bg-gradient-to-r from-slate-600 to-slate-800 bg-clip-text text-transparent">
            Loading conversation...
          </p>
        </div>
      </div>
    );
  }

  if (!auth.currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/40">
          <p className="text-xl font-bold text-slate-800">
            Please log in to view chat
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-white/40 shadow-lg px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-white/60 rounded-2xl transition-all duration-300 hover:scale-110 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">
                  {match.otherUserInitials}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-800">
                {match.otherUserName}
              </h2>
              <p className="text-sm text-slate-500 font-medium">
                {lastSeenText}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isCurrentUserSeeker && match.status !== "completed" && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="flex items-center px-5 py-2.5 text-sm font-bold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <CheckCircle size={18} className="mr-2" />
                Mark Complete
              </button>
            )}
            {match.status === "completed" && (
              <div className="flex items-center px-5 py-2.5 text-sm font-bold text-emerald-700 bg-emerald-50 rounded-2xl border-2 border-emerald-200">
                <CheckCircle size={18} className="mr-2" />
                Completed
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Topic Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100 px-6 py-4">
        <div className="flex items-center justify-center space-x-3">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <div className="text-center">
            <p className="text-sm font-bold text-blue-900">
              Connected about: {match.needTitle}
            </p>
            <p className="text-xs text-blue-600 font-medium">
              Help each other safely and be kind!
            </p>
          </div>
          <Sparkles className="w-5 h-5 text-purple-600" />
        </div>
      </div>

      {/* Messages Area (virtualized for large threads) */}
      <div className="flex-1">
        {preparedMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full px-6 py-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-slate-200 to-slate-300 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                <Send className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">
                No Messages Yet
              </h3>
              <p className="text-slate-500 font-medium">
                Start the conversation!
              </p>
            </div>
          </div>
        ) : preparedMessages.length <= 30 ? (
          // Small threads: keep your original rendering + spacing
          <div className="overflow-y-auto px-6 py-6 space-y-4">
            {preparedMessages.map((msg, index) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                match={match}
                formatTime={formatTime}
                getMessageStatus={getMessageStatus}
                showTimestamp={msg.showTimeStamp}
              />
            ))}
          </div>
        ) : (
          // Large threads: virtualize for performance
          <Virtuoso
            className="overflow-y-auto px-6 py-6"
            data={preparedMessages}
            increaseViewportBy={{ top: 300, bottom: 600 }}
            followOutput="smooth"
            itemContent={(index, msg) => (
              <div className="mb-4">
                <MessageBubble
                  msg={msg}
                  match={match}
                  formatTime={formatTime}
                  getMessageStatus={getMessageStatus}
                  showTimestamp={msg.showTimeStamp}
                />
              </div>
            )}
          />
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white/90 backdrop-blur-xl border-t border-white/40 p-6">
        <form onSubmit={handleSend} className="flex items-end space-x-4">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              className="w-full px-5 py-4 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 resize-none max-h-32 text-sm font-medium transition-all duration-300 bg-white/80 backdrop-blur-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message..."
              rows={1}
              style={{ height: "auto", minHeight: "56px" }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 128) + "px";
              }}
              disabled={isSending}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className={`p-4 rounded-2xl transition-all duration-300 transform ${
              input.trim() && !isSending
                ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-110"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isSending ? (
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-6 h-6" />
            )}
          </button>
        </form>
        <p className="text-xs text-slate-500 mt-3 text-center font-medium">
          Be respectful and kind. Report any inappropriate behavior.
        </p>
      </div>

      {/* Review Modal (lazy-loaded) */}
      {showReviewModal && (
        <Suspense fallback={null}>
          <ReviewModal
            match={match}
            onClose={() => setShowReviewModal(false)}
            onReviewSubmitted={handleReviewSubmitted}
          />
        </Suspense>
      )}
    </div>
  );
}

/* ------------- Presentational bubble (kept same UI) ------------- */
const MessageBubble = React.memo(function MessageBubble({
  msg,
  match,
  formatTime,
  getMessageStatus,
  showTimestamp,
}) {
  const isOwnMessage = msg.isOwnMessage;
  return (
    <div>
      {showTimestamp && (
        <div className="flex justify-center mb-6">
          <span className="text-xs text-slate-500 bg-white/80 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/40 font-semibold">
            {formatTime(msg.createdAt)}
          </span>
        </div>
      )}
      <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
        <div
          className={`flex items-end space-x-3 max-w-[75%] ${
            isOwnMessage ? "flex-row-reverse space-x-reverse" : ""
          }`}
        >
          {!isOwnMessage && (
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-white font-bold text-xs">
                {match.otherUserInitials}
              </span>
            </div>
          )}
          <div
            className={`relative px-5 py-3 rounded-2xl max-w-full shadow-md ${
              isOwnMessage
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-sm"
                : "bg-white border border-white/40 text-slate-800 rounded-bl-sm"
            }`}
          >
            <p className="text-sm leading-relaxed break-words font-medium">
              {msg.text}
            </p>
            {isOwnMessage && (
              <div className="flex items-center justify-end mt-2 space-x-2">
                <span className="text-xs text-blue-100 font-medium">
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
});
