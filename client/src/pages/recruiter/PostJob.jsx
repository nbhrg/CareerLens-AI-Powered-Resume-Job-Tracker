/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { recruiterAPI } from "../../utils/api";

const PostJob = () => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "full-time",
        salary: {
            min: "",
            max: "",
            currency: "USD",
        },
        location: {
            city: "",
            state: "",
            country: "",
            remote: false,
        },
        skills: [],
        company: {
            name: "",
            logo: "",
            website: "",
            industry: "",
            size: "",
        },
        perks: [],
        benefits: [],
        applicationDeadline: "",
        numberOfOpenings: 1,
    });

    // For handling skills, perks, and benefits
    const [skill, setSkill] = useState("");
    const [perk, setPerk] = useState("");
    const [benefit, setBenefit] = useState("");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Handle nested objects
        if (name.includes(".")) {
            const [parent, child] = name.split(".");
            setFormData((prev) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === "checkbox" ? checked : value,
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            }));
        }
    };

    // Form submit handler
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await recruiterAPI.createJob(formData);

            // console.log("Job posted successfully:", response);
            toast.success("Job posted successfully!");

            // Redirect to the recruiter dashboard
            navigate("/recruiter/dashboard");
        } catch (error) {
            console.error("Error posting job:", error);
            toast.error(
                error.message || "Failed to post job. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link
                    to="/recruiter/dashboard"
                    className="text-gray-500 hover:text-gray-700"
                >
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Post New Job
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Create a new job listing
                    </p>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Job basics section */}
                    <div className="border-b pb-6">
                        <h2 className="text-lg font-semibold mb-4">
                            Job Basics
                        </h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Job Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.title}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Job Type
                                </label>
                                <select
                                    name="type"
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.type}
                                    onChange={handleChange}
                                >
                                    <option value="full-time">Full-time</option>
                                    <option value="part-time">Part-time</option>
                                    <option value="contract">Contract</option>
                                    <option value="internship">
                                        Internship
                                    </option>
                                    <option value="remote">Remote</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700">
                                Job Description
                            </label>
                            <textarea
                                name="description"
                                rows="6"
                                required
                                maxLength={3000}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Detailed job description (max 3000 characters)"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                {formData.description.length}/3000 characters
                            </p>
                        </div>
                    </div>

                    {/* Company details section */}
                    <div className="border-b pb-6">
                        <h2 className="text-lg font-semibold mb-4">
                            Company Details
                        </h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    name="company.name"
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.company.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Company Website
                                </label>
                                <input
                                    type="url"
                                    name="company.website"
                                    placeholder="https://example.com"
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.company.website}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Company Logo URL
                                </label>
                                <input
                                    type="url"
                                    name="company.logo"
                                    placeholder="https://example.com/logo.png"
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.company.logo}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Industry
                                </label>
                                <input
                                    type="text"
                                    name="company.industry"
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.company.industry}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Company Size
                                </label>
                                <input
                                    type="text"
                                    name="company.size"
                                    placeholder="e.g., 50-100 employees"
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.company.size}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location section */}
                    <div className="border-b pb-6">
                        <h2 className="text-lg font-semibold mb-4">Location</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    City
                                </label>
                                <input
                                    type="text"
                                    name="location.city"
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.location.city}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    State/Province
                                </label>
                                <input
                                    type="text"
                                    name="location.state"
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.location.state}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Country
                                </label>
                                <input
                                    type="text"
                                    name="location.country"
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.location.country}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="remoteOption"
                                    name="location.remote"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    checked={formData.location.remote}
                                    onChange={handleChange}
                                />
                                <label
                                    htmlFor="remoteOption"
                                    className="ml-2 block text-sm text-gray-700"
                                >
                                    Remote position
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Salary section */}
                    <div className="border-b pb-6">
                        <h2 className="text-lg font-semibold mb-4">
                            Salary Range
                        </h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Minimum Salary
                                </label>
                                <input
                                    type="number"
                                    name="salary.min"
                                    placeholder="e.g., 50000"
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.salary.min}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Maximum Salary
                                </label>
                                <input
                                    type="number"
                                    name="salary.max"
                                    placeholder="e.g., 80000"
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.salary.max}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Currency
                                </label>
                                <select
                                    name="salary.currency"
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.salary.currency}
                                    onChange={handleChange}
                                >
                                    <option value="USD">USD - US Dollar</option>
                                    <option value="EUR">EUR - Euro</option>
                                    <option value="GBP">
                                        GBP - British Pound
                                    </option>
                                    <option value="CAD">
                                        CAD - Canadian Dollar
                                    </option>
                                    <option value="AUD">
                                        AUD - Australian Dollar
                                    </option>
                                    <option value="INR">
                                        INR - Indian Rupee
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Skills section */}
                    <div className="border-b pb-6">
                        <h2 className="text-lg font-semibold mb-4">
                            Required Skills
                        </h2>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {formData.skills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md flex items-center"
                                >
                                    {skill}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                skills: prev.skills.filter(
                                                    (_, i) => i !== index
                                                ),
                                            }));
                                        }}
                                        className="ml-1 text-blue-500 hover:text-blue-700 cursor-pointer"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex">
                            <input
                                type="text"
                                placeholder="Add a skill"
                                className="flex-grow border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={skill}
                                onChange={(e) => setSkill(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        if (skill.trim()) {
                                            setFormData((prev) => ({
                                                ...prev,
                                                skills: [
                                                    ...prev.skills,
                                                    skill.trim(),
                                                ],
                                            }));
                                            setSkill("");
                                        }
                                    }
                                }}
                            />
                            <button
                                type="button"
                                className="bg-blue-600 text-white px-3 py-2 rounded-r-md hover:bg-blue-700 cursor-pointer"
                                onClick={() => {
                                    if (skill.trim()) {
                                        setFormData((prev) => ({
                                            ...prev,
                                            skills: [
                                                ...prev.skills,
                                                skill.trim(),
                                            ],
                                        }));
                                        setSkill("");
                                    }
                                }}
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Perks and Benefits section */}
                    <div className="border-b pb-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <h2 className="text-lg font-semibold mb-4">
                                Perks
                            </h2>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {formData.perks.map((item, index) => (
                                    <span
                                        key={index}
                                        className="bg-green-100 text-green-800 px-2 py-1 rounded-md flex items-center"
                                    >
                                        {item}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    perks: prev.perks.filter(
                                                        (_, i) => i !== index
                                                    ),
                                                }));
                                            }}
                                            className="ml-1 text-green-500 hover:text-green-700 cursor-pointer"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex">
                                <input
                                    type="text"
                                    placeholder="Add a perk"
                                    className="flex-grow border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    value={perk}
                                    onChange={(e) => setPerk(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            if (perk.trim()) {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    perks: [
                                                        ...prev.perks,
                                                        perk.trim(),
                                                    ],
                                                }));
                                                setPerk("");
                                            }
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    className="bg-green-600 text-white px-3 py-2 rounded-r-md hover:bg-green-700 cursor-pointer"
                                    onClick={() => {
                                        if (perk.trim()) {
                                            setFormData((prev) => ({
                                                ...prev,
                                                perks: [
                                                    ...prev.perks,
                                                    perk.trim(),
                                                ],
                                            }));
                                            setPerk("");
                                        }
                                    }}
                                >
                                    <Plus className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold mb-4">
                                Benefits
                            </h2>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {formData.benefits.map((item, index) => (
                                    <span
                                        key={index}
                                        className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md flex items-center"
                                    >
                                        {item}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    benefits:
                                                        prev.benefits.filter(
                                                            (_, i) =>
                                                                i !== index
                                                        ),
                                                }));
                                            }}
                                            className="ml-1 text-purple-500 hover:text-purple-700 cursor-pointer"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex">
                                <input
                                    type="text"
                                    placeholder="Add a benefit"
                                    className="flex-grow border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                    value={benefit}
                                    onChange={(e) => setBenefit(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            if (benefit.trim()) {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    benefits: [
                                                        ...prev.benefits,
                                                        benefit.trim(),
                                                    ],
                                                }));
                                                setBenefit("");
                                            }
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    className="bg-purple-600 text-white px-3 py-2 rounded-r-md hover:bg-purple-700 cursor-pointer"
                                    onClick={() => {
                                        if (benefit.trim()) {
                                            setFormData((prev) => ({
                                                ...prev,
                                                benefits: [
                                                    ...prev.benefits,
                                                    benefit.trim(),
                                                ],
                                            }));
                                            setBenefit("");
                                        }
                                    }}
                                >
                                    <Plus className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Additional job details section */}
                    <div className="border-b pb-6">
                        <h2 className="text-lg font-semibold mb-4">
                            Additional Details
                        </h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Application Deadline
                                </label>
                                <input
                                    type="date"
                                    name="applicationDeadline"
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.applicationDeadline}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Number of Openings
                                </label>
                                <input
                                    type="number"
                                    name="numberOfOpenings"
                                    min="1"
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.numberOfOpenings}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <Link
                            to="/recruiter/dashboard"
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 cursor-pointer"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Posting..." : "Post Job"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostJob;
