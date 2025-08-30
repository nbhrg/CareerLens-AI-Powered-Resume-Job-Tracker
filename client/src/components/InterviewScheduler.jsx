import React, { useState } from "react";
import { Calendar, Clock, MapPin, Video, Phone, X } from "lucide-react";
import { toast } from "react-toastify";

// API base URL - should match the one in utils/api.js
const API_BASE_URL = "http://localhost:5000/api";

const InterviewScheduler = ({
    isOpen,
    onClose,
    jobDetails,
    candidateDetails,
    onInterviewScheduled,
}) => {
    const [formData, setFormData] = useState({
        title: `Interview for ${jobDetails?.title || "Position"}`,
        description: "",
        type: "video",
        scheduledDateTime: "",
        duration: 60,
        location: "",
        meetingLink: "",
        phoneNumber: "",
        notes: "",
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.scheduledDateTime) {
            toast.error("Please select a date and time for the interview");
            return;
        }

        if (new Date(formData.scheduledDateTime) <= new Date()) {
            toast.error(
                "Interview must be scheduled for a future date and time"
            );
            return;
        }

        if (formData.type === "in-person" && !formData.location) {
            toast.error("Please provide a location for in-person interview");
            return;
        }

        if (formData.type === "video" && !formData.meetingLink) {
            toast.error("Please provide a meeting link for video interview");
            return;
        }

        if (formData.type === "phone" && !formData.phoneNumber) {
            toast.error("Please provide a phone number for phone interview");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/interviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    jobId: jobDetails.id,
                    candidateId: candidateDetails.id,
                    ...formData,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to schedule interview");
            }

            toast.success("Interview scheduled successfully!");
            onInterviewScheduled(data.interview);
            onClose();
        } catch (error) {
            console.error("Error scheduling interview:", error);
            toast.error(error.message || "Failed to schedule interview");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const getTypeIcon = (type) => {
        switch (type) {
            case "video":
                return <Video className="h-5 w-5" />;
            case "phone":
                return <Phone className="h-5 w-5" />;
            case "in-person":
                return <MapPin className="h-5 w-5" />;
            default:
                return <Calendar className="h-5 w-5" />;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Schedule Interview
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Candidate and Job Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-gray-900 mb-2">
                            Interview Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600">Candidate:</p>
                                <p className="font-medium">
                                    {candidateDetails?.firstName}{" "}
                                    {candidateDetails?.lastName}
                                </p>
                                <p className="text-gray-500">
                                    {candidateDetails?.email}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Position:</p>
                                <p className="font-medium">
                                    {jobDetails?.title}
                                </p>
                                <p className="text-gray-500">
                                    {jobDetails?.company?.name}
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Interview Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Interview Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Brief description of the interview..."
                            />
                        </div>

                        {/* Interview Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Interview Type *
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {["video", "phone", "in-person"].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                type,
                                            }))
                                        }
                                        className={`p-3 border rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                                            formData.type === type
                                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                                : "border-gray-300 hover:border-gray-400"
                                        }`}
                                    >
                                        {getTypeIcon(type)}
                                        <span className="capitalize text-sm">
                                            {type === "in-person"
                                                ? "In Person"
                                                : type}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date and Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date & Time *
                                </label>
                                <input
                                    type="datetime-local"
                                    name="scheduledDateTime"
                                    value={formData.scheduledDateTime}
                                    onChange={handleInputChange}
                                    min={new Date().toISOString().slice(0, 16)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Duration (minutes) *
                                </label>
                                <select
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value={30}>30 minutes</option>
                                    <option value={45}>45 minutes</option>
                                    <option value={60}>1 hour</option>
                                    <option value={90}>1.5 hours</option>
                                    <option value={120}>2 hours</option>
                                </select>
                            </div>
                        </div>

                        {/* Conditional Fields Based on Type */}
                        {formData.type === "video" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Meeting Link *
                                </label>
                                <input
                                    type="url"
                                    name="meetingLink"
                                    value={formData.meetingLink}
                                    onChange={handleInputChange}
                                    placeholder="https://zoom.us/j/..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        )}

                        {formData.type === "phone" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    placeholder="+1 (555) 123-4567"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        )}

                        {formData.type === "in-person" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Location *
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="Office address or meeting room"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        )}

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Additional Notes
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Any additional information for the candidate..."
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                            >
                                {loading && (
                                    <Clock className="h-4 w-4 animate-spin" />
                                )}
                                Schedule Interview
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InterviewScheduler;
