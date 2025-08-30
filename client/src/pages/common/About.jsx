import React from "react";
import { Target, Users, Award, Zap } from "lucide-react";

const About = () => {
    const values = [
        {
            icon: Target,
            title: "Innovation",
            description:
                "We leverage cutting-edge AI technology to revolutionize the job search experience.",
        },
        {
            icon: Users,
            title: "Community",
            description:
                "Building bridges between talented professionals and forward-thinking companies.",
        },
        {
            icon: Award,
            title: "Excellence",
            description:
                "Committed to delivering the highest quality platform and user experience.",
        },
        {
            icon: Zap,
            title: "Efficiency",
            description:
                "Streamlining the hiring process to save time for both job seekers and recruiters.",
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            About JobOrbit
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
                            Revolutionizing the way people find jobs and
                            companies find talent through intelligent technology
                            and seamless user experience.
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                Our Mission
                            </h2>
                            <p className="text-lg text-gray-600 mb-6">
                                At JobOrbit, we believe that finding the right
                                job or the perfect candidate shouldn't be a
                                daunting task. Our mission is to simplify and
                                enhance the recruitment process through
                                innovative technology.
                            </p>
                            <p className="text-lg text-gray-600 mb-6">
                                We've built a platform that not only connects
                                job seekers with opportunities but also provides
                                intelligent tools for resume parsing,
                                application tracking, and data-driven insights.
                            </p>
                            <p className="text-lg text-gray-600">
                                Whether you're a job seeker looking for your
                                next opportunity or a recruiter searching for
                                top talent, JobOrbit is designed to make your
                                journey more efficient and successful.
                            </p>
                        </div>
                        <div className="bg-blue-50 p-8 rounded-lg">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                Key Features
                            </h3>
                            <ul className="space-y-3 text-gray-600">
                                <li className="flex items-start">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    Smart resume parsing with AI technology
                                </li>
                                <li className="flex items-start">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    Real-time application tracking system
                                </li>
                                <li className="flex items-start">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    Comprehensive dashboard with analytics
                                </li>
                                <li className="flex items-start">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    Advanced job matching algorithms
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Our Values
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            The principles that guide everything we do at
                            JobOrbit
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => {
                            const Icon = value.icon;
                            return (
                                <div
                                    key={index}
                                    className="bg-white p-8 rounded-lg shadow-lg text-center"
                                >
                                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Icon className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                        {value.title}
                                    </h3>
                                    <p className="text-gray-600">
                                        {value.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Our Story
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            JobOrbit was founded with a simple vision: to create
                            a more efficient and intelligent job market. Our
                            team of experienced developers, designers, and
                            industry experts came together to build a platform
                            that addresses the real challenges faced by both job
                            seekers and recruiters in today's competitive
                            market.
                        </p>
                    </div>

                    <div className="bg-blue-600 text-white rounded-lg p-8 text-center">
                        <h3 className="text-2xl font-bold mb-4">
                            Ready to Join Our Community?
                        </h3>
                        <p className="text-blue-100 mb-6">
                            Experience the future of job searching and
                            recruiting with JobOrbit's intelligent platform.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/candidate/signup"
                                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                            >
                                Start as Job Seeker
                            </a>
                            <a
                                href="/recruiter/signup"
                                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                            >
                                Join as Recruiter
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
