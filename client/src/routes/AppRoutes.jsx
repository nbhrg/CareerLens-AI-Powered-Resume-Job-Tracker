import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CandidateLayout from "../layouts/CandidateLayout";
import RecruiterLayout from "../layouts/RecruiterLayout";

// Common Pages
import Home from "../pages/common/Home";
import About from "../pages/common/About";
import NotFound from "../pages/common/NotFound";
import JobDetails from "../pages/common/JobDetails";
import ForgotPassword from "../pages/common/ForgotPassword";

// Candidate Pages
import CandidateLogin from "../pages/candidate/CandidateLogin";
import CandidateSignup from "../pages/candidate/CandidateSignup";
import CandidateDashboard from "../pages/candidate/CandidateDashboard";
import JobBoard from "../pages/candidate/JobBoard";
import UploadResume from "../pages/candidate/UploadResume";
import ApplicationTracker from "../pages/candidate/ApplicationTracker";
import InterviewManagement from "../pages/candidate/InterviewManagement";

// Recruiter Pages
import RecruiterLogin from "../pages/recruiter/RecruiterLogin";
import RecruiterSignup from "../pages/recruiter/RecruiterSignup";
import RecruiterDashboard from "../pages/recruiter/RecruiterDashboard";
import PostJob from "../pages/recruiter/PostJob";
import ManageApplicants from "../pages/recruiter/ManageApplicants";
import RecruiterInterviewManagement from "../pages/recruiter/RecruiterInterviewManagement";

const AppRoutes = () => {
    return (
        <AuthProvider>
            <div className="min-h-screen flex flex-col">
                <Routes>
                    {/* Public routes with navbar */}
                    <Route
                        path="/"
                        element={
                            <>
                                <Navbar />
                                <div className="flex-grow">
                                    <Home />
                                </div>
                                <Footer />
                            </>
                        }
                    />
                    <Route
                        path="/about"
                        element={
                            <>
                                <Navbar />
                                <div className="flex-grow">
                                    <About />
                                </div>
                                <Footer />
                            </>
                        }
                    />

                    {/* Job Details Page - Public but with auth context */}
                    <Route
                        path="/jobs/:id"
                        element={
                            <>
                                <Navbar />
                                <div className="flex-grow">
                                    <JobDetails />
                                </div>
                                <Footer />
                            </>
                        }
                    />

                    {/* Authentication routes */}
                    <Route
                        path="/candidate/login"
                        element={<CandidateLogin />}
                    />
                    <Route
                        path="/candidate/signup"
                        element={<CandidateSignup />}
                    />
                    <Route
                        path="/recruiter/login"
                        element={<RecruiterLogin />}
                    />
                    <Route
                        path="/recruiter/signup"
                        element={<RecruiterSignup />}
                    />
                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />

                    {/* Protected Candidate routes */}
                    <Route
                        path="/candidate/*"
                        element={
                            <ProtectedRoute requiredRole="candidate">
                                <>
                                    <Navbar />
                                    <CandidateLayout />
                                </>
                            </ProtectedRoute>
                        }
                    >
                        <Route
                            path="dashboard"
                            element={<CandidateDashboard />}
                        />
                        <Route path="jobs" element={<JobBoard />} />
                        <Route
                            path="upload-resume"
                            element={<UploadResume />}
                        />
                        <Route
                            path="applications"
                            element={<ApplicationTracker />}
                        />
                        <Route
                            path="interviews"
                            element={<InterviewManagement />}
                        />
                    </Route>

                    {/* Protected Recruiter routes */}
                    <Route
                        path="/recruiter/*"
                        element={
                            <ProtectedRoute requiredRole="recruiter">
                                <>
                                    <Navbar />
                                    <RecruiterLayout />
                                </>
                            </ProtectedRoute>
                        }
                    >
                        <Route
                            path="dashboard"
                            element={<RecruiterDashboard />}
                        />
                        <Route path="post-job" element={<PostJob />} />
                        <Route
                            path="applicants"
                            element={<ManageApplicants />}
                        />
                        <Route
                            path="interviews"
                            element={<RecruiterInterviewManagement />}
                        />
                    </Route>

                    {/* 404 route */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
        </AuthProvider>
    );
};

export default AppRoutes;
