import React, { useEffect } from 'react';

const Notification = ({ message, type, onClose }) => {
    if (!message) return null;
    const baseStyle = "p-4 rounded-md my-4 text-white flex justify-between items-center shadow-lg";
    const styles = {
        error: "bg-red-500",
        success: "bg-green-500",
    };
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-5 right-5 z-50 animate-fade-in-down ${baseStyle} ${styles[type]}`}>
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 font-bold text-xl">&times;</button>
        </div>
    );
};

export default Notification;