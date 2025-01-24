import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, audio, card } = req.body; // Add `card` field
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl, audioUrl;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    if (audio) {
      const audioUploadResponse = await cloudinary.uploader.upload(audio, {
        resource_type: "video",
      });
      audioUrl = audioUploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      audio: audioUrl,
      card, // Save card if present
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const acceptRateCard = async (req, res) => {
  try {
    console.log("Accept rate card route hit", req.params.id);
    const { id } = req.params;
    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ error: "Message not found" });

    console.log("Rate card accepted for message:", id);
    res.status(200).json({ message: "Rate card accepted." });
  } catch (error) {
    console.error("Error in acceptRateCard controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const declineRateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ error: "Message not found" });

    // Perform any logic for decline (e.g., notifying the sender)
    console.log(`Rate card from message ${id} declined.`);

    res.status(200).json({ message: "Rate card declined." });
  } catch (error) {
    console.error("Error in declineRateCard controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const notifySender = async (req, res) => {
  try {
    const { message, senderId, receiverId } = req.body;

    // You can implement your notification logic here (e.g., send a message to the sender)
    const newNotification = new Notification({
      message,
      senderId,
      receiverId,
    });

    await newNotification.save();
    res.status(200).json({ message: "Notification sent." });
  } catch (error) {
    console.error("Error in notifySender:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
