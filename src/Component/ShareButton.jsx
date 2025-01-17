/* eslint-disable react/prop-types */
import { message } from "antd";
import { FaShareAlt } from "react-icons/fa";

const ShareButton = ({ userId, accountId, date }) => {
    const handleShare = () => {
        const url = `/stream-report/${userId}/${accountId}/${date}`;
        navigator.clipboard.writeText(window.location.origin + url);
        message.success("Link copied to clipboard!");
    };

    return (
        <>
            <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg shadow-md">
                <span>Share Stream Report</span>
                <FaShareAlt className="text-white" />
            </button>
        </>
    );
};

export default ShareButton;
