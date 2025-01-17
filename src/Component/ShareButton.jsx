/* eslint-disable react/prop-types */
import { message } from "antd";
import { FaShareAlt } from "react-icons/fa";

const ShareButton = ({ userId, accountId, date }) => {
    const handleShare = async () => {
        message.info("Generating link, please wait...");
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/get-streams-url`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
                body: JSON.stringify({ user_id: userId, account_id: accountId, date: date }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || "Failed to get streams URL");
            }
            const url = `${window.location.origin}/stream-report/${result.data.encryptedUrl}`;
            navigator.clipboard.writeText(url);
            message.success("Link generated successfully!");
        } catch (error) {
            console.error(error);
            message.error("Failed get link. Please try again later.");
        }
    };

    return (
        <>
            <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 font-medium text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600">
                <span>Share Stream Report</span>
                <FaShareAlt className="text-white" />
            </button>
        </>
    );
};

export default ShareButton;
