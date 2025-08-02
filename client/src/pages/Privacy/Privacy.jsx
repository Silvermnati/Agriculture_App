import React from 'react';
import { Shield, Eye, Lock, Users, Database, Globe } from 'lucide-react';

const Privacy = () => {
  const sections = [
    {
      id: "information-collection",
      title: "Information We Collect",
      icon: Database,
      content: [
        {
          subtitle: "Personal Information",
          text: "We collect information you provide directly to us, such as when you create an account, update your profile, post content, or contact us. This may include your name, email address, phone number, location, and profile information."
        },
        {
          subtitle: "Usage Information",
          text: "We automatically collect information about your use of our platform, including your IP address, browser type, operating system, pages viewed, time spent on pages, and other usage statistics."
        },
        {
          subtitle: "Agricultural Data",
          text: "When you share farming practices, crop information, or participate in discussions, we collect and store this agricultural data to improve our services and facilitate knowledge sharing."
        }
      ]
    },
    {
      id: "information-use",
      title: "How We Use Your Information",
      icon: Eye,
      content: [
        {
          subtitle: "Service Provision",
          text: "We use your information to provide, maintain, and improve our services, including facilitating connections between farmers and experts, personalizing content, and providing customer support."
        },
        {
          subtitle: "Communication",
          text: "We may use your contact information to send you updates about our services, respond to your inquiries, and provide important notices about your account or changes to our policies."
        },
        {
          subtitle: "Analytics and Improvement",
          text: "We analyze usage patterns to understand how our platform is used, identify areas for improvement, and develop new features that better serve our agricultural community."
        }
      ]
    },
    {
      id: "information-sharing",
      title: "Information Sharing and Disclosure",
      icon: Users,
      content: [
        {
          subtitle: "Public Content",
          text: "Content you post publicly on our platform (such as posts, comments, and profile information) is visible to other users. Please be mindful of what information you choose to share publicly."
        },
        {
          subtitle: "Service Providers",
          text: "We may share your information with third-party service providers who help us operate our platform, such as hosting services, analytics providers, and customer support tools."
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose your information if required by law, regulation, legal process, or governmental request, or to protect the rights, property, or safety of AgriConnect, our users, or others."
        }
      ]
    },
    {
      id: "data-security",
      title: "Data Security",
      icon: Lock,
      content: [
        {
          subtitle: "Security Measures",
          text: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction."
        },
        {
          subtitle: "Data Encryption",
          text: "We use industry-standard encryption to protect sensitive data during transmission and storage. All passwords are hashed and salted before storage."
        },
        {
          subtitle: "Access Controls",
          text: "We limit access to your personal information to employees and contractors who need it to provide our services, and we require them to maintain confidentiality."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Shield className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            AgriConnect ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains 
            how we collect, use, disclose, and safeguard your information when you use our agricultural platform and services.
          </p>
          <p className="text-gray-600 leading-relaxed">
            By using AgriConnect, you agree to the collection and use of information in accordance with this policy. 
            If you do not agree with our policies and practices, please do not use our services.
          </p>
        </div>

        {/* Main Sections */}
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <div key={section.id} className="bg-white rounded-lg shadow-sm p-8 mb-8">
              <div className="flex items-center mb-6">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <Icon className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
              </div>
              
              <div className="space-y-6">
                {section.content.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.subtitle}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Your Rights */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Your Rights and Choices</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Access and Update</h3>
              <p className="text-gray-600 text-sm">You can access and update your personal information through your account settings.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Portability</h3>
              <p className="text-gray-600 text-sm">You can request a copy of your data in a machine-readable format.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Deletion</h3>
              <p className="text-gray-600 text-sm">You can delete your account and associated data at any time through your settings.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Communication Preferences</h3>
              <p className="text-gray-600 text-sm">You can opt out of non-essential communications through your notification settings.</p>
            </div>
          </div>
        </div>

        {/* International Users */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">International Users</h2>
          </div>
          
          <p className="text-gray-600 leading-relaxed mb-4">
            AgriConnect is operated from the United States. If you are accessing our services from outside the United States, 
            please be aware that your information may be transferred to, stored, and processed in the United States.
          </p>
          <p className="text-gray-600 leading-relaxed">
            We comply with applicable data protection laws and implement appropriate safeguards to protect your information 
            during international transfers.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-green-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <div className="space-y-2 text-gray-600">
            <p><strong>Email:</strong> privacy@agriconnect.com</p>
            <p><strong>Address:</strong> 123 Agriculture Way, Farm City, FC 12345</p>
            <p><strong>Phone:</strong> +1 (555) 123-4567</p>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            We will respond to your inquiry within 30 days of receipt.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;