/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { toast } from "react-toastify";
import { candidateAPI } from "../../utils/api";

const UploadResume = () => {
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch candidate profile on mount
        const fetchProfile = async () => {
            try {
                const data = await candidateAPI.getFullProfile();
                setFormData(data);
            } catch (err) {
                toast.error("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFile = async (file) => {
        setUploadedFile(file);
        setUploading(true);
        try {
            await candidateAPI.uploadResume(file);
            toast.success("Resume uploaded successfully!");
        } catch (err) {
            toast.error(err.message || "Upload failed");
        }
        setUploading(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleNestedChange = (parent, child, value) => {
        setFormData((prev) => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [child]: value,
            },
        }));
    };

    const handleArrayChange = (field, idx, key, value) => {
        setFormData((prev) => {
            const arr = [...(prev[field] || [])];
            arr[idx] = { ...arr[idx], [key]: value };
            return { ...prev, [field]: arr };
        });
    };

    const handleAddArrayItem = (field, emptyObj) => {
        setFormData((prev) => ({
            ...prev,
            [field]: [...(prev[field] || []), emptyObj],
        }));
    };

    const handleRemoveArrayItem = (field, idx) => {
        setFormData((prev) => {
            const arr = [...(prev[field] || [])];
            arr.splice(idx, 1);
            return { ...prev, [field]: arr };
        });
    };

    const handleSave = async () => {
        try {
            const updatedProfile = await candidateAPI.updateFullProfile(
                formData
            );
            setFormData(updatedProfile); // Update with the new data including updated profileCompleteness
            toast.success("Profile updated successfully!");
            setEditMode(false);
        } catch (err) {
            toast.error(err.message || "Update failed");
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Upload Resume
                </h1>
                <p className="text-gray-600 mt-2">
                    Upload your resume (PDF). Your profile info will be
                    autofilled below and can be edited.
                </p>
            </div>

            {/* Upload Section */}
            <div className="bg-white shadow rounded-lg p-6">
                <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center ${
                        dragActive
                            ? "border-blue-400 bg-blue-50"
                            : "border-gray-300"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                        {uploadedFile
                            ? uploadedFile.name
                            : "Drop your resume here"}
                    </p>
                    <p className="text-gray-600 mb-4">
                        or click to browse files (PDF or Word only)
                    </p>
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) =>
                            e.target.files && handleFile(e.target.files[0])
                        }
                        className="hidden"
                        id="resume-upload"
                    />
                    <label
                        htmlFor="resume-upload"
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer"
                    >
                        Choose File
                    </label>
                    {uploading && (
                        <div className="mt-2 text-blue-600">Uploading...</div>
                    )}
                </div>
            </div>

            {/* Profile Form */}
            {formData && (
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Profile Information
                            </h2>
                            {/* Profile Completeness Indicator */}
                            <div className="flex items-center space-x-2">
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                            (formData.profileCompleteness ||
                                                0) >= 80
                                                ? "bg-green-500"
                                                : (formData.profileCompleteness ||
                                                      0) >= 60
                                                ? "bg-yellow-500"
                                                : "bg-red-500"
                                        }`}
                                        style={{
                                            width: `${
                                                formData.profileCompleteness ||
                                                0
                                            }%`,
                                        }}
                                    />
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                    {formData.profileCompleteness || 0}%
                                    Complete
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                            {(formData.profileCompleteness || 0) < 100 && (
                                <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-md">
                                    💡 Complete your profile to stand out to
                                    recruiters!
                                </div>
                            )}
                            {!editMode && (
                                <button
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 whitespace-nowrap cursor-pointer"
                                    onClick={() => setEditMode(true)}
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                    </div>
                    <form
                        className="space-y-8"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSave();
                        }}
                    >
                        {/* Personal Information Section */}
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName || ""}
                                        onChange={handleInputChange}
                                        disabled={!editMode}
                                        required
                                        className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                            !editMode
                                                ? "bg-gray-100 cursor-not-allowed"
                                                : "bg-white"
                                        }`}
                                        placeholder="Enter your first name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName || ""}
                                        onChange={handleInputChange}
                                        disabled={!editMode}
                                        required
                                        className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                            !editMode
                                                ? "bg-gray-100 cursor-not-allowed"
                                                : "bg-white"
                                        }`}
                                        placeholder="Enter your last name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email || ""}
                                        onChange={handleInputChange}
                                        disabled
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 cursor-not-allowed text-gray-600"
                                        placeholder="Your email address"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Email cannot be changed
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone || ""}
                                        onChange={handleInputChange}
                                        disabled={!editMode}
                                        required
                                        className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                            !editMode
                                                ? "bg-gray-100 cursor-not-allowed"
                                                : "bg-white"
                                        }`}
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date of Birth{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={
                                            formData.dateOfBirth
                                                ? formData.dateOfBirth.slice(
                                                      0,
                                                      10
                                                  )
                                                : ""
                                        }
                                        onChange={handleInputChange}
                                        disabled={!editMode}
                                        required
                                        className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                            !editMode
                                                ? "bg-gray-100 cursor-not-allowed"
                                                : "bg-white"
                                        }`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address Information Section */}
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
                                Address Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="md:col-span-2 lg:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Street Address
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="123 Main Street, Apt 4B"
                                        value={formData.address?.street || ""}
                                        onChange={(e) =>
                                            handleNestedChange(
                                                "address",
                                                "street",
                                                e.target.value
                                            )
                                        }
                                        disabled={!editMode}
                                        className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                            !editMode
                                                ? "bg-gray-100 cursor-not-allowed"
                                                : "bg-white"
                                        }`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="New York"
                                        value={formData.address?.city || ""}
                                        onChange={(e) =>
                                            handleNestedChange(
                                                "address",
                                                "city",
                                                e.target.value
                                            )
                                        }
                                        disabled={!editMode}
                                        className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                            !editMode
                                                ? "bg-gray-100 cursor-not-allowed"
                                                : "bg-white"
                                        }`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        State/Province
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="NY"
                                        value={formData.address?.state || ""}
                                        onChange={(e) =>
                                            handleNestedChange(
                                                "address",
                                                "state",
                                                e.target.value
                                            )
                                        }
                                        disabled={!editMode}
                                        className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                            !editMode
                                                ? "bg-gray-100 cursor-not-allowed"
                                                : "bg-white"
                                        }`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ZIP/Postal Code
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="10001"
                                        value={formData.address?.zipCode || ""}
                                        onChange={(e) =>
                                            handleNestedChange(
                                                "address",
                                                "zipCode",
                                                e.target.value
                                            )
                                        }
                                        disabled={!editMode}
                                        className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                            !editMode
                                                ? "bg-gray-100 cursor-not-allowed"
                                                : "bg-white"
                                        }`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Country
                                    </label>
                                    <select
                                        value={formData.address?.country || ""}
                                        onChange={(e) =>
                                            handleNestedChange(
                                                "address",
                                                "country",
                                                e.target.value
                                            )
                                        }
                                        disabled={!editMode}
                                        className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                            !editMode
                                                ? "bg-gray-100 cursor-not-allowed"
                                                : "bg-white"
                                        }`}
                                    >
                                        <option value="">Select Country</option>
                                        <option value="US">
                                            United States
                                        </option>
                                        <option value="CA">Canada</option>
                                        <option value="GB">
                                            United Kingdom
                                        </option>
                                        <option value="AU">Australia</option>
                                        <option value="IN">India</option>
                                        <option value="DE">Germany</option>
                                        <option value="FR">France</option>
                                        <option value="JP">Japan</option>
                                        <option value="SG">Singapore</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Professional Information Section */}
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
                                Professional Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Years of Experience
                                    </label>
                                    <select
                                        name="experience"
                                        value={formData.experience || 0}
                                        onChange={handleInputChange}
                                        disabled={!editMode}
                                        className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                            !editMode
                                                ? "bg-gray-100 cursor-not-allowed"
                                                : "bg-white"
                                        }`}
                                    >
                                        <option value={0}>
                                            Fresh Graduate / No Experience
                                        </option>
                                        <option value={1}>1 year</option>
                                        <option value={2}>2 years</option>
                                        <option value={3}>3 years</option>
                                        <option value={4}>4 years</option>
                                        <option value={5}>5 years</option>
                                        <option value={6}>6-10 years</option>
                                        <option value={10}>10+ years</option>
                                    </select>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Skills
                                    </label>
                                    <textarea
                                        name="skills"
                                        rows={3}
                                        value={
                                            Array.isArray(formData.skills)
                                                ? formData.skills.join(", ")
                                                : formData.skills || ""
                                        }
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setFormData((prev) => ({
                                                ...prev,
                                                skills: value,
                                            }));
                                        }}
                                        onBlur={(e) => {
                                            // Convert to array format when user finishes editing
                                            const value = e.target.value;
                                            setFormData((prev) => ({
                                                ...prev,
                                                skills: value
                                                    .split(",")
                                                    .map((s) => s.trim())
                                                    .filter(Boolean),
                                            }));
                                        }}
                                        disabled={!editMode}
                                        className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                                            !editMode
                                                ? "bg-gray-100 cursor-not-allowed"
                                                : "bg-white"
                                        }`}
                                        placeholder="JavaScript, React, Node.js, Python, etc. (comma separated)"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Separate skills with commas
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Education Section */}
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
                                Education
                            </h3>
                            <div className="space-y-4">
                                {(formData.education || []).map((edu, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-white p-4 rounded-lg border border-gray-200"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Degree
                                                </label>
                                                <select
                                                    value={edu.degree || ""}
                                                    onChange={(e) =>
                                                        handleArrayChange(
                                                            "education",
                                                            idx,
                                                            "degree",
                                                            e.target.value
                                                        )
                                                    }
                                                    disabled={!editMode}
                                                    className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                                        !editMode
                                                            ? "bg-gray-100 cursor-not-allowed"
                                                            : "bg-white"
                                                    }`}
                                                >
                                                    <option value="">
                                                        Select Degree
                                                    </option>
                                                    <option value="High School">
                                                        High School
                                                    </option>
                                                    <option value="Associate">
                                                        Associate Degree
                                                    </option>
                                                    <option value="Bachelor">
                                                        Bachelor's Degree
                                                    </option>
                                                    <option value="Master">
                                                        Master's Degree
                                                    </option>
                                                    <option value="PhD">
                                                        PhD
                                                    </option>
                                                    <option value="Diploma">
                                                        Diploma
                                                    </option>
                                                    <option value="Certificate">
                                                        Certificate
                                                    </option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Institution
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="University/College Name"
                                                    value={
                                                        edu.institution || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleArrayChange(
                                                            "education",
                                                            idx,
                                                            "institution",
                                                            e.target.value
                                                        )
                                                    }
                                                    disabled={!editMode}
                                                    className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                                        !editMode
                                                            ? "bg-gray-100 cursor-not-allowed"
                                                            : "bg-white"
                                                    }`}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Graduation Year
                                                </label>
                                                <select
                                                    value={
                                                        edu.graduationYear || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleArrayChange(
                                                            "education",
                                                            idx,
                                                            "graduationYear",
                                                            e.target.value
                                                        )
                                                    }
                                                    disabled={!editMode}
                                                    className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                                        !editMode
                                                            ? "bg-gray-100 cursor-not-allowed"
                                                            : "bg-white"
                                                    }`}
                                                >
                                                    <option value="">
                                                        Select Year
                                                    </option>
                                                    {Array.from(
                                                        { length: 50 },
                                                        (_, i) => {
                                                            const year =
                                                                new Date().getFullYear() +
                                                                5 -
                                                                i;
                                                            return (
                                                                <option
                                                                    key={year}
                                                                    value={year}
                                                                >
                                                                    {year}
                                                                </option>
                                                            );
                                                        }
                                                    )}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Grade/GPA
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Scale of 0-10 (only numbers)"
                                                    value={edu.grade || ""}
                                                    onChange={(e) =>
                                                        handleArrayChange(
                                                            "education",
                                                            idx,
                                                            "grade",
                                                            e.target.value
                                                        )
                                                    }
                                                    disabled={!editMode}
                                                    className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                                        !editMode
                                                            ? "bg-gray-100 cursor-not-allowed"
                                                            : "bg-white"
                                                    }`}
                                                />
                                            </div>
                                        </div>
                                        {editMode && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveArrayItem(
                                                        "education",
                                                        idx
                                                    )
                                                }
                                                className="mt-3 text-red-600 hover:text-red-800 text-sm font-medium cursor-pointer"
                                            >
                                                Remove Education
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {editMode && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleAddArrayItem("education", {
                                                degree: "",
                                                institution: "",
                                                graduationYear: "",
                                                grade: "",
                                            })
                                        }
                                        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors cursor-pointer"
                                    >
                                        + Add Education
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Links & Portfolio Section */}
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
                                Links & Portfolio
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Portfolio URL
                                    </label>
                                    <input
                                        type="url"
                                        name="portfolioUrl"
                                        value={formData.portfolioUrl || ""}
                                        onChange={handleInputChange}
                                        disabled={!editMode}
                                        className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                            !editMode
                                                ? "bg-gray-100 cursor-not-allowed"
                                                : "bg-white"
                                        }`}
                                        placeholder="https://yourportfolio.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        LinkedIn Profile
                                    </label>
                                    <input
                                        type="url"
                                        name="linkedinUrl"
                                        value={formData.linkedinUrl || ""}
                                        onChange={handleInputChange}
                                        disabled={!editMode}
                                        className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                            !editMode
                                                ? "bg-gray-100 cursor-not-allowed"
                                                : "bg-white"
                                        }`}
                                        placeholder="https://linkedin.com/in/yourprofile"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Job Preferences Section */}
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
                                Job Preferences
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Preferred Job Type
                                    </label>
                                    <select
                                        name="preferredJobType"
                                        value={
                                            formData.preferredJobType ||
                                            "full-time"
                                        }
                                        onChange={handleInputChange}
                                        disabled={!editMode}
                                        className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                            !editMode
                                                ? "bg-gray-100 cursor-not-allowed"
                                                : "bg-white"
                                        }`}
                                    >
                                        <option value="full-time">
                                            Full-time
                                        </option>
                                        <option value="part-time">
                                            Part-time
                                        </option>
                                        <option value="contract">
                                            Contract
                                        </option>
                                        <option value="internship">
                                            Internship
                                        </option>
                                        <option value="remote">Remote</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Currency
                                    </label>
                                    <select
                                        value={
                                            formData.expectedSalary?.currency ||
                                            "USD"
                                        }
                                        onChange={(e) =>
                                            handleNestedChange(
                                                "expectedSalary",
                                                "currency",
                                                e.target.value
                                            )
                                        }
                                        disabled={!editMode}
                                        className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                            !editMode
                                                ? "bg-gray-100 cursor-not-allowed"
                                                : "bg-white"
                                        }`}
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                        <option value="CAD">CAD (C$)</option>
                                        <option value="AUD">AUD (A$)</option>
                                        <option value="INR">INR (₹)</option>
                                        <option value="JPY">JPY (¥)</option>
                                        <option value="SGD">SGD (S$)</option>
                                    </select>
                                </div>
                                <div className="lg:col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Preferred Locations
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={
                                            Array.isArray(
                                                formData.preferredLocations
                                            )
                                                ? formData.preferredLocations.join(
                                                      ", "
                                                  )
                                                : ""
                                        }
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                preferredLocations:
                                                    e.target.value
                                                        .split(",")
                                                        .map((s) => s.trim())
                                                        .filter(Boolean),
                                            }))
                                        }
                                        disabled={!editMode}
                                        className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                                            !editMode
                                                ? "bg-gray-100 cursor-not-allowed"
                                                : "bg-white"
                                        }`}
                                        placeholder="New York, San Francisco, Remote, etc. (comma separated)"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Separate locations with commas
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-4">
                                    Expected Salary Range (Annually)
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">
                                            Minimum
                                        </label>
                                        <input
                                            type="number"
                                            value={
                                                formData.expectedSalary?.min ||
                                                ""
                                            }
                                            onChange={(e) =>
                                                handleNestedChange(
                                                    "expectedSalary",
                                                    "min",
                                                    e.target.value
                                                )
                                            }
                                            disabled={!editMode}
                                            className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                                !editMode
                                                    ? "bg-gray-100 cursor-not-allowed"
                                                    : "bg-white"
                                            }`}
                                            placeholder="50000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">
                                            Maximum
                                        </label>
                                        <input
                                            type="number"
                                            value={
                                                formData.expectedSalary?.max ||
                                                ""
                                            }
                                            onChange={(e) =>
                                                handleNestedChange(
                                                    "expectedSalary",
                                                    "max",
                                                    e.target.value
                                                )
                                            }
                                            disabled={!editMode}
                                            className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                                !editMode
                                                    ? "bg-gray-100 cursor-not-allowed"
                                                    : "bg-white"
                                            }`}
                                            placeholder="80000"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {editMode && (
                            <div className="bg-white border-t border-gray-200 px-6 py-4 rounded-b-lg">
                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors cursor-pointer"
                                        onClick={() => setEditMode(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            )}
        </div>
    );
};

export default UploadResume;
