import { Link } from "react-router-dom"
import {
  UserGroupIcon,
  AcademicCapIcon,
  HeartIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline"

const About = () => {
  const features = [
    {
      icon: UserGroupIcon,
      title: "Alumni Directory",
      description: "Connect with thousands of alumni from your institution and discover new networking opportunities.",
    },
    {
      icon: AcademicCapIcon,
      title: "Career Support",
      description: "Access job postings, career advice, and mentorship opportunities from fellow alumni.",
    },
    {
      icon: HeartIcon,
      title: "Give Back",
      description: "Support your alma mater through donations and volunteer opportunities.",
    },
    {
      icon: GlobeAltIcon,
      title: "Global Network",
      description: "Connect with alumni worldwide and expand your professional and personal network.",
    },
  ]

  const team = [
    {
      name: "Arvind Gautam",
      role: "Platform Director",
      image: "/images/team/arvind.jpg",
      bio: "Class of 2026, Computer Science(AI). Former tech executive with 15+ years of experience.",
    },
    {
      name: "Siddhi Jaiswal",
      role: "Community Manager",
      image: "/images/team/siddhi.png",
      bio: "Class of 2026, Information Technology. Passionate about building meaningful connections.",
    },
    {
      name: "Archana Gautam",
      role: "Technical Lead",
      image: "/images/team/archan.jpg",
      bio: "Class of 2020, Tester department. Leading the development of innovative platform features.",
    },
  ]

  const stats = [
    { number: "50,000+", label: "Alumni Members" },
    { number: "150+", label: "Countries" },
    { number: "5,000+", label: "Job Opportunities" },
    { number: "$2M+", label: "Donations Raised" },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Connecting Alumni
          <span className="block text-primary-600 dark:text-primary-400">Worldwide</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
          Our alumni platform brings together graduates from around the world, fostering lifelong connections, career
          growth, and meaningful contributions to our shared community.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup" className="btn-primary">
            Join Our Network
          </Link>
          <Link to="/directory" className="btn-secondary">
            Browse Alumni
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              {stat.number}
            </div>
            <div className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Mission Section */}
      <div className="card p-8 md:p-12 mb-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Our Mission</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
          We believe that the bonds formed during our educational journey should last a lifetime. Our platform is
          designed to strengthen these connections, facilitate professional growth, and create opportunities for alumni
          to give back to their alma mater and support future generations.
        </p>
      </div>

      {/* Features Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center mb-12">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center mb-12">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <div key={index} className="card p-6 text-center">
              <img
                src={member.image || "/placeholder.svg"}
                alt={member.name}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{member.name}</h3>
              <p className="text-primary-600 dark:text-primary-400 font-medium mb-3">{member.role}</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Information */}
      <div className="card p-8 md:p-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Contact Us</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Have questions or need support? Reach out to us and we'll get back to you as soon as possible.
          </p>
          
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-3">
              <EnvelopeIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <a href="mailto:arvindgautam7048@gmail.com" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                arvindgautam7048@gmail.com
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <PhoneIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <span className="text-gray-700 dark:text-gray-300">+917048937789</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPinIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <span className="text-gray-700 dark:text-gray-300">Lucknow Uttar Pradesh</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center py-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Ready to Connect?</h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Join thousands of alumni who are already networking and making a difference.
        </p>
        <Link to="/otp-signup" className="btn-primary text-lg px-8 py-3">
          Get Started Today
        </Link>
      </div>
    </div>
  )
}

export default About
