import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { Users, Phone, Video, DollarSign, X } from "lucide-react";
const RightSidebar = () => {
  const { selectedUser, sendMessage } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showRateCardModal, setShowRateCardModal] = useState(false);
  const [rates, setRates] = useState({ instagram: "", tiktok: "", youtube: "" });

  const handleRateChange = (platform, value) => {
    setRates((prev) => ({ ...prev, [platform]: value }));
  };

  const handleSubmitRates = async () => {
    if (!rates.instagram && !rates.tiktok && !rates.youtube) {
      return; // Don't send an empty rate card
    }

    const message = {
      text: `Here's my rate card for your consideration.
      \n\nProposed Rates:
      \nInstagram: $${rates.instagram || 0}
      \nTikTok: $${rates.tiktok || 0}\n
      YouTube: $${rates.youtube || 0}`,
      rateCard: true, // Custom field to differentiate rate card messages
    };

    try {
      await sendMessage(message); // Using `sendMessage` like in `MessageInput`
      setShowRateCardModal(false); // Close modal
      setRates({ instagram: "", tiktok: "", youtube: "" }); // Reset form
    } catch (error) {
      console.error("Failed to send rate card:", error);
    }
  };

  return (
    <aside
      className="h-full w-72 border-l border-base-300 flex flex-col p-5 bg-base-100"
    >
     <div>
        <h2 className="font-bold mb-2">Project Details</h2>
     </div>

      {/* Upcoming Tasks */}
      <div className="mb-5">
        <h3 className="font-medium mb-2">Upcoming Tasks</h3>
        <ul className="text-sm space-y-1">
          <li>Review script - Due in 2 days</li>
          <li>Schedule photoshoot - Due in 5 days</li>
        </ul>
      </div>

      {/* Files */}
      <div className="mb-5">
        <h4 className="font-medium mb-2">Files</h4>
        <ul className="text-sm space-y-1">
          <li><a href="#" className="text-blue-500">Project_Brief.pdf</a></li>
          <li><a href="#" className="text-blue-500">Contract_Draft.docx</a></li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-5">
        <button className="btn btn-sm btn-primary flex items-center gap-2">
          <Phone size={16} /> Audio Call
        </button>
        <button className="btn btn-sm btn-primary flex items-center gap-2">
          <Video size={16} /> Video Call
        </button>
      </div>

      {/* Share Rate Card */}
      <button
        className="btn btn-sm btn-secondary flex items-center gap-2"
        onClick={() => setShowRateCardModal(true)}
      >
        <DollarSign size={16} /> Share Rate Card
      </button>

      {/* Rate Card Modal */}
      {showRateCardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg w-80">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">Rate Card</h4>
              <button
                className="btn btn-circle btn-sm"
                onClick={() => setShowRateCardModal(false)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Instagram Rate</label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={rates.instagram}
                  onChange={(e) => handleRateChange("instagram", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">TikTok Rate</label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={rates.tiktok}
                  onChange={(e) => handleRateChange("tiktok", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">YouTube Rate</label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={rates.youtube}
                  onChange={(e) => handleRateChange("youtube", e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="btn btn-sm btn-secondary"
                onClick={handleSubmitRates}
              >
                Submit Rates
              </button>
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => setShowRateCardModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default RightSidebar;
