// Import necessary dependencies
import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { FileIcon } from "lucide-react"; // Import the FileIcon
import axios from 'axios';

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    updateMessage, 
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);


    const mssg =[];
   
      for (const message of messages) {
        if (message.text && message.text.toLowerCase().includes("photo")) {
          mssg.push(message.text);
        }
      }
      console.log(mssg);
  const photoMessages = messages.filter((message) =>
    message.text?.toLowerCase().split(/\s+/).includes("photo"))
  .map((message)=>message.text)
  ;
  var n = 0;
  for (const message of mssg) {
    n++;
  }
console.log(n);
console.log(photoMessages.length);


  const transcribeAudio = async (audioUrl, messageId) => {
    try {
      const response = await fetch(audioUrl);
      const audioBlob = await response.blob();

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result.split(",")[1];
        const transcription = await fetchTranscription(base64Audio);

        if (transcription) {
          // Update the message with the transcription
          updateMessage(messageId, { transcription });
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error("Failed to transcribe audio:", error);
    }
  };

  // Function to fetch transcription from Google Speech-to-Text API
  const fetchTranscription = async (base64Audio) => {
    try {
      const response = await fetch(
        `https://speech.googleapis.com/v1p1beta1/speech:recognize?key=${process.env.GOOGLE_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            config: {
              encoding: "MP3",
              sampleRateHertz: 16000,
              languageCode: "en-US",
            },
            audio: {
              content: base64Audio,
            },
          }),
        }
      );

      const data = await response.json();
      return data.results
        ? data.results.map((result) => result.alternatives[0].transcript).join("\n")
        : null;
    } catch (error) {
      console.error("Error fetching transcription:", error);
      return null;
    }
  };
  const handleAcceptRateCard = async (messageId, senderId) => {
    if (senderId === authUser._id) {
      console.log("You cannot accept your own rate card.");
      return; // Prevent the sender from accepting the card
    }
  
    try {
      await axios.post(`http://localhost:5000/api/messages/${messageId}/accept`);
      console.log("Rate card accepted!");
  
      // Notify the sender that their rate card was accepted
      await axios.post(`http://localhost:5000/api/messages/${messageId}/notify`, {
        message: `Your rate card has been accepted by ${authUser.username}.`,
        senderId: authUser._id,
        receiverId: senderId,
      });
    } catch (error) {
      console.error("Failed to accept rate card:", error);
    }
  };
  
  const handleDeclineRateCard = async (messageId, senderId) => {
    if (senderId === authUser._id) {
      console.log("You cannot decline your own rate card.");
      return; // Prevent the sender from declining the card
    }
  
    try {
      await axios.post(`http://localhost:5000/api/messages/${messageId}/decline`);
      console.log("Rate card declined!");
  
      // Notify the sender that their rate card was declined
      await axios.post(`http://localhost:5000/api/messages/${messageId}/notify`, {
        message: `Your rate card has been declined by ${authUser.username}.`,
        senderId: authUser._id,
        receiverId: senderId,
      });
    } catch (error) {
      console.error("Failed to decline rate card:", error);
    }
  };
  
  
  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
               {message.card && (
              <div className="chat-bubble bg-gray-100 border border-gray-300 p-3 rounded-md">
                <h4 className="font-bold mb-2">Rate Card</h4>
                <p>{JSON.parse(atob(message.card)).text}</p>
                <ul className="mt-2 space-y-1">
                  {Object.entries(JSON.parse(atob(message.card)).proposedRates).map(([platform, rate]) => (
                    <li key={platform} className="flex justify-between">
                      <span className="font-medium">{platform.charAt(0).toUpperCase() + platform.slice(1)}:</span>
                      <span>${rate}</span>
                    </li>
                  ))}
                </ul>
                {/* Show buttons only if the current user is not the sender */}
                {message.senderId !== authUser._id && (
                  <div className="mt-4 flex gap-2">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleAcceptRateCard(message._id, message.senderId)} // Pass senderId
                    >
                      Accept
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleDeclineRateCard(message._id, message.senderId)} // Pass senderId
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            )}
            


              {message.audio && (
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <audio
                      controls
                      src={message.audio}
                      className="max-w-[200px] mb-2"
                    >
                      Your browser does not support audio playback
                    </audio>

                    <button
                      onClick={() => transcribeAudio(message.audio, message._id)}
                      className="btn btn-sm flex items-center space-x-1"
                      title="Transcribe Audio"
                    >
                      <FileIcon size={20} />
                    </button>
                  </div>
                  {message.transcription && (
                    <div className="bg-blue-50 border border-blue-200 p-2 rounded-md shadow-sm">
                      <p className="text-blue-800">{message.transcription}</p>
                    </div>
                  )}
                </div>
              )}

              {message.text && (
                <div className="chat-bubble">
                  <p>{message.text}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
