// API base URL - update this to match your backend server
const API_BASE_URL = "http://localhost:5000/api";

// Helper function to make API requests
const makeRequest = async (url, options = {}) => {
    const config = {
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        ...options,
    };

    // Add authorization header if token exists
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Something went wrong");
        }

        return data;
    } catch (error) {
        console.error("API Request Error:", error);
        throw error;
    }
};

// Candidate API calls
export const candidateAPI = {
    // Register candidate
    register: async (userData) => {
        return makeRequest("/auth/candidate/register", {
            method: "POST",
            body: JSON.stringify(userData),
        });
    },

    // Login candidate
    login: async (credentials) => {
        return makeRequest("/auth/candidate/login", {
            method: "POST",
            body: JSON.stringify(credentials),
        });
    },

    // Get current candidate profile
    getProfile: async () => {
        return makeRequest("/auth/candidate/me");
    },

    // Update candidate profile
    updateProfile: async (userData) => {
        return makeRequest("/auth/candidate/profile", {
            method: "PUT",
            body: JSON.stringify(userData),
        });
    },

    // Change password
    changePassword: async (passwordData) => {
        return makeRequest("/auth/candidate/password", {
            method: "PUT",
            body: JSON.stringify(passwordData),
        });
    },

    // Reset password (forgot password)
    resetPassword: async (resetData) => {
        return makeRequest("/auth/candidate/reset-password", {
            method: "POST",
            body: JSON.stringify(resetData),
        });
    },

    // Get dashboard stats
    getDashboard: async () => {
        return makeRequest("/auth/candidate/dashboard");
    },

    // Get candidate applications
    getApplications: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return makeRequest(
            `/jobs/applications${queryParams ? `?${queryParams}` : ""}`
        );
    },

    // Upload resume (PDF)
    uploadResume: async (file) => {
        const formData = new FormData();
        formData.append("resume", file);
        const token = localStorage.getItem("token");
        const response = await fetch(
            `${API_BASE_URL}/candidate/upload-resume`,
            {
                method: "POST",
                headers: {
                    Authorization: token ? `Bearer ${token}` : undefined,
                },
                body: formData,
            }
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Upload failed");
        return data;
    },

    // Get candidate profile (all fields)
    getFullProfile: async () => {
        return makeRequest("/candidate/profile");
    },

    // Update candidate profile (all fields except password)
    updateFullProfile: async (userData) => {
        return makeRequest("/candidate/profile", {
            method: "PUT",
            body: JSON.stringify(userData),
        });
    },
};

// Recruiter API calls
export const recruiterAPI = {
    // Register recruiter
    register: async (userData) => {
        return makeRequest("/auth/recruiter/register", {
            method: "POST",
            body: JSON.stringify(userData),
        });
    },

    // Login recruiter
    login: async (credentials) => {
        return makeRequest("/auth/recruiter/login", {
            method: "POST",
            body: JSON.stringify(credentials),
        });
    },

    // Get current recruiter profile
    getProfile: async () => {
        return makeRequest("/auth/recruiter/me");
    },

    // Update recruiter profile
    updateProfile: async (userData) => {
        return makeRequest("/auth/recruiter/profile", {
            method: "PUT",
            body: JSON.stringify(userData),
        });
    },

    // Change password
    changePassword: async (passwordData) => {
        return makeRequest("/auth/recruiter/password", {
            method: "PUT",
            body: JSON.stringify(passwordData),
        });
    },

    // Reset password (forgot password)
    resetPassword: async (resetData) => {
        return makeRequest("/auth/recruiter/reset-password", {
            method: "POST",
            body: JSON.stringify(resetData),
        });
    },

    // Update subscription
    updateSubscription: async (planData) => {
        return makeRequest("/auth/recruiter/subscription", {
            method: "PUT",
            body: JSON.stringify(planData),
        });
    },

    // Get dashboard stats
    getDashboard: async () => {
        return makeRequest("/auth/recruiter/dashboard");
    },

    // Get verification status
    getVerificationStatus: async () => {
        return makeRequest("/auth/recruiter/verification");
    },

    // Create a new job posting
    createJob: async (jobData) => {
        return makeRequest("/jobs", {
            method: "POST",
            body: JSON.stringify(jobData),
        });
    },

    // Get all applicants for recruiter's jobs
    getApplicants: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return makeRequest(
            `/jobs/recruiter/applicants${queryParams ? `?${queryParams}` : ""}`
        );
    },

    // Update application status
    updateApplicationStatus: async (jobId, candidateId, status) => {
        return makeRequest(`/jobs/${jobId}/status`, {
            method: "PUT",
            body: JSON.stringify({ candidateId, status }),
        });
    },

    // Get recruiter's posted jobs
    getMyJobs: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return makeRequest(
            `/jobs/recruiter/myjobs${queryParams ? `?${queryParams}` : ""}`
        );
    },

    // View candidate resume
    viewResume: async (candidateId) => {
        console.log("API: Starting viewResume for candidate:", candidateId);
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const url = `${API_BASE_URL}/candidate/view/${candidateId}`;
        console.log("API: Making request to:", url);

        try {
            // Add timeout to prevent infinite loading
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
            }, 30000); // 30 second timeout

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            console.log("API: Response status:", response.status);
            console.log(
                "API: Response headers:",
                Object.fromEntries(response.headers.entries())
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API: Error response:", errorData);
                throw new Error(errorData.message || "Failed to fetch resume");
            }

            return response; // Return the response object to handle blob data
        } catch (error) {
            if (error.name === "AbortError") {
                throw new Error(
                    "Request timeout - the resume file might be too large or there's a server issue"
                );
            }
            console.error("API: Network error:", error);
            throw error;
        }
    },
};

// General utility functions
export const authUtils = {
    // Get stored token
    getToken: () => localStorage.getItem("token"),

    // Get stored user data
    getUser: () => {
        const userData = localStorage.getItem("user");
        return userData ? JSON.parse(userData) : null;
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");
        return !!(token && user);
    },

    // Clear auth data
    clearAuth: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    },

    // Store auth data
    setAuth: (userData, token) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
    },
};

// Jobs API calls
export const jobsAPI = {
    // Get all jobs
    getJobs: async (filters = {}) => {
        const queryParams = new URLSearchParams();

        if (filters.search) queryParams.append("search", filters.search);
        if (filters.location) queryParams.append("location", filters.location);
        if (filters.type && filters.type !== "all")
            queryParams.append("type", filters.type);
        if (filters.salary) queryParams.append("salary", filters.salary);
        if (filters.page) queryParams.append("page", filters.page);
        if (filters.limit) queryParams.append("limit", filters.limit);

        const queryString = queryParams.toString()
            ? `?${queryParams.toString()}`
            : "";
        const response = await makeRequest(`/jobs${queryString}`);
        // Handle both the paginated response and the array response formats
        return response.jobs || response || [];
    },

    // Get a specific job by ID
    getJob: async (jobId) => {
        return makeRequest(`/jobs/${jobId}`);
    },

    // Apply to a job
    applyJob: async (jobId, applicationData) => {
        return makeRequest(`/jobs/${jobId}/apply`, {
            method: "POST",
            body: JSON.stringify(applicationData),
        });
    },

    // Save a job (for candidates)
    saveJob: async (jobId) => {
        return makeRequest(`/jobs/${jobId}/save`, {
            method: "POST",
        });
    },

    // Unsave a job (for candidates)
    unsaveJob: async (jobId) => {
        return makeRequest(`/jobs/${jobId}/unsave`, {
            method: "DELETE",
        });
    },

    // Get saved jobs (for candidates)
    getSavedJobs: async () => {
        return makeRequest("/jobs/saved");
    },

    // Get candidate's job applications
    getApplications: async () => {
        return makeRequest("/jobs/applications");
    },
};

// Interview API calls
export const interviewAPI = {
    // Schedule interview (Recruiter only)
    scheduleInterview: async (interviewData) => {
        return makeRequest("/interviews", {
            method: "POST",
            body: JSON.stringify(interviewData),
        });
    },

    // Get recruiter interviews
    getRecruiterInterviews: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return makeRequest(
            `/interviews/recruiter${queryParams ? `?${queryParams}` : ""}`
        );
    },

    // Get candidate interviews
    getCandidateInterviews: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return makeRequest(
            `/interviews/candidate${queryParams ? `?${queryParams}` : ""}`
        );
    },

    // Update interview
    updateInterview: async (interviewId, updateData) => {
        return makeRequest(`/interviews/${interviewId}`, {
            method: "PUT",
            body: JSON.stringify(updateData),
        });
    },

    // Cancel interview
    cancelInterview: async (interviewId) => {
        return makeRequest(`/interviews/${interviewId}`, {
            method: "DELETE",
        });
    },

    // Add interview feedback (Recruiter only)
    addFeedback: async (interviewId, feedbackData) => {
        return makeRequest(`/interviews/${interviewId}/feedback`, {
            method: "POST",
            body: JSON.stringify(feedbackData),
        });
    },
};
