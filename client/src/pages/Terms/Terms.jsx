import React from 'react';
import { FileText, Shield, Users, AlertTriangle, Scale, Clock } from 'lucide-react';

const Terms = () => {
  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: FileText,
      content: [
        {
          subtitle: "Agreement to Terms",
          text: "By accessing and using AgriConnect, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
        },
        {
          subtitle: "Modifications",
          text: "We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through our platform. Your continued use of the service after such modifications constitutes acceptance of the updated terms."
        }
      ]
    },
    {
      id: "user-accounts",
      title: "User Accounts and Registration",
      icon: Users,
      content: [
        {
          subtitle: "Account Creation",
          text: "To access certain features of AgriConnect, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete."
        },
        {
          subtitle: "Account Security",
          text: "You are responsible for safeguarding the password and for maintaining the confidentiality of your account. You agree not to disclose your password to any third party and to take sole responsibility for activities that occur under your account."
        },
        {
          subtitle: "Account Termination",
          text: "We reserve the right to terminate or suspend your account at any time, with or without cause, and with or without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties."
        }
      ]
    },
    {
      id: "acceptable-use",
      title: "Acceptable Use Policy",
      icon: Shield,
      content: [
        {
          subtitle: "Permitted Uses",
          text: "You may use AgriConnect for lawful purposes only. You agree to use the service in a manner consistent with any and all applicable laws and regulations and in accordance with these Terms of Service."
        },
        {
          subtitle: "Prohibited Activities",
          text: "You agree not to: (a) use the service for any unlawful purpose; (b) post false, inaccurate, misleading, or defamatory content; (c) harass, abuse, or harm other users; (d) distribute spam or unsolicited communications; (e) attempt to gain unauthorized access to our systems."
        },
        {
          subtitle: "Agricultural Content Standards",
          text: "When sharing agricultural advice or information, you agree to provide accurate information to the best of your knowledge. Misleading agricultural advice that could harm crops or farming operations is strictly prohibited."
        }
      ]
    },
    {
      id: "content-ownership",
      title: "Content and Intellectual Property",
      icon: Scale,
      content: [
        {
          subtitle: "User Content",
          text: "You retain ownership of any content you post on AgriConnect. However, by posting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content in connection with our services."
        },
        {
          subtitle: "Platform Content",
          text: "All content on AgriConnect, including but not limited to text, graphics, logos, images, and software, is the property of AgriConnect or its content suppliers and is protected by copyright and other intellectual property laws."
        },
        {
          subtitle: "Respect for IP Rights",
          text: "You agree not to infringe upon the intellectual property rights of others. If you believe your intellectual property rights have been violated, please contact us with details of the alleged infringement."
        }
      ]
    },
    {
      id: "expert-services",
      title: "Expert Consultation Services",
      icon: Users,
      content: [
        {
          subtitle: "Service Nature",
          text: "Expert consultation services are provided by independent agricultural professionals. AgriConnect serves as a platform to facilitate these connections but does not directly provide agricultural advice."
        },
        {
          subtitle: "Expert Qualifications",
          text: "While we strive to verify expert credentials, users are responsible for evaluating the qualifications and advice of experts. We recommend verifying credentials and seeking multiple opinions for important agricultural decisions."
        },
        {
          subtitle: "Payment and Refunds",
          text: "Payment for expert services is processed through our platform. Refund policies are determined by individual experts, though we may mediate disputes. All payments are subject to our payment processing terms."
        }
      ]
    },
    {
      id: "disclaimers",
      title: "Disclaimers and Limitations",
      icon: AlertTriangle,
      content: [
        {
          subtitle: "Service Availability",
          text: "We strive to maintain continuous service availability but cannot guarantee uninterrupted access. The service is provided 'as is' without warranties of any kind, either express or implied."
        },
        {
          subtitle: "Agricultural Advice Disclaimer",
          text: "Information shared on AgriConnect is for educational purposes only and should not be considered as professional agricultural advice. Always consult with local agricultural experts and authorities before making significant farming decisions."
        },
        {
          subtitle: "Limitation of Liability",
          text: "In no event shall AgriConnect be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses."
        }
      ]
    },
    {
      id: "termination",
      title: "Termination and Suspension",
      icon: Clock,
      content: [
        {
          subtitle: "User Termination",
          text: "You may terminate your account at any time by contacting us or using the account deletion feature in your profile settings. Upon termination, your right to use the service will cease immediately."
        },
        {
          subtitle: "Our Right to Terminate",
          text: "We may terminate or suspend your access to the service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms of Service."
        },
        {
          subtitle: "Effect of Termination",
          text: "Upon termination, all provisions of these Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, and limitations of liability."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <FileText className="w-16 h-16 text-blue-200 mx-auto mb-6" />
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">Terms of Service</h1>
            <p className="text-xl sm:text-2xl max-w-3xl mx-auto leading-relaxed text-blue-100">
              Please read these terms carefully before using AgriConnect. By using our service, you agree to these terms.
            </p>
            <p className="text-sm text-blue-200 mt-6">
              Last updated: February 8, 2025
            </p>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Welcome to AgriConnect, a platform designed to connect farmers, agricultural experts, and enthusiasts worldwide. 
            These Terms of Service ("Terms") govern your use of our website, mobile application, and related services 
            (collectively, the "Service") operated by AgriConnect ("us", "we", or "our").
          </p>
          <p className="text-gray-600 leading-relaxed">
            Our Service facilitates knowledge sharing, expert consultations, and community building within the agricultural sector. 
            By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, 
            then you may not access the Service.
          </p>
        </div>

        {/* Terms Sections */}
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <div key={section.id} className="bg-white rounded-lg shadow-sm p-8 mb-8">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <Icon className="w-6 h-6 text-blue-600" />
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

        {/* Contact Information */}
        <div className="bg-blue-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About These Terms?</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <div className="space-y-2 text-gray-600">
            <p>• Email: legal@agriconnect.com</p>
            <p>• Address: 123 Agriculture Way, Farm City, FC 12345</p>
            <p>• Phone: +1 (555) 123-4567</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;