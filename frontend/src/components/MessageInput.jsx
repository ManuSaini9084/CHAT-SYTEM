import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Mic, StopCircle } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Audio recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: "audio/mp3" });
        console.log(audioBlob);
        setAudioBlob(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast.error("Failed to start recording: " + error.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
  
    // Check if there is at least text, image, or audio
    if (!text.trim() && !imagePreview && !audioBlob) return;
  
    try {
      let audioPreview = null;
      if (audioBlob) {
        audioPreview = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(audioBlob);
        });
      }
  
      await sendMessage({
        text: text.trim() || null, // Send null if no text is provided
        image: imagePreview || null, // Send null if no image is provided
        audio: audioPreview || null, // Send null if no audio is provided
      });
  
      // Clear form
      setText("");
      setImagePreview(null);
      setAudioBlob(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };
  


  return (
    <div className="p-4 w-full">
    {imagePreview && (
      <div className="mb-3 flex items-center gap-2">
        <div className="relative">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
          />
          <button
            onClick={removeImage}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center text-gray-500 hover:text-emerald-500"
            type="button"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    )}
  
    {audioBlob && (
      <div className="mb-3 flex items-center gap-2">
        <audio
          controls
          src={URL.createObjectURL(audioBlob)}
          className="w-full"
        ></audio>
        <button
          onClick={() => setAudioBlob(null)}
          className="btn btn-circle btn-sm text-gray-500 hover:text-emerald-500"
          type="button"
        >
          <X size={16} />
        </button>
      </div>
    )}
  
    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
      <div className="flex-1 flex gap-2">
        <input
          type="text"
          className="w-full input input-bordered rounded-lg input-sm sm:input-md"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
        />
        <button
          type="button"
          className={`hidden sm:flex btn btn-circle hover:text-emerald-500 ${
            imagePreview ? "text-emerald-500" : "text-gray-500"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <Image size={20} />
        </button>
        {isRecording ? (
          <button
            type="button"
            className={`hidden sm:flex btn btn-circle text-gray-500 hover:text-emerald-500`}
            onClick={stopRecording}
          >
            <StopCircle size={22} />
          </button>
        ) : (
          <button
            type="button"
            className={`hidden sm:flex btn btn-circle text-gray-500 hover:text-emerald-500`}
            onClick={startRecording}
          >
            <Mic size={22} />
          </button>
        )}
      </div>
      <button
        type="submit"
        className="hidden sm:flex btn btn-circle text-gray-500 hover:text-emerald-500"
        disabled={!text.trim() && !imagePreview && !audioBlob}
      >
        <Send size={22} />
      </button>
    </form>
  </div>
  
  );
};

export default MessageInput;
