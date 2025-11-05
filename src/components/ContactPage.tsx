// src/components/ContactPage.tsx
// Modified: Replaced hardcoded hero section with reusable Hero component
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, MessageCircle, Building, Shield, Car, HeadphonesIcon, Briefcase, Scale } from 'lucide-react';
import { ContactForm } from './ui/contact-form';
import { Hero } from './ui/Hero';

const ContactPage: React.FC = () => {
  const contactInfo = [
    {
      icon: Phone,
      label: 'Phone',
      value: '+62 21 5466 666',
      href: 'tel:+62215466666',
      description: 'Available daily 10 AM - 10 PM'
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'contact.us@supermalkarawaci.com',
      href: 'mailto:contact.us@supermalkarawaci.com',
      description: 'We respond within 24 hours'
    },
    {
      icon: MapPin,
      label: 'Address',
      value: 'Jl. Boulevard Diponegoro No. 105, Klp. Dua, Kec. Karawaci, Kota Tangerang, Banten 15115',
      href: 'https://maps.google.com/?q=Supermal+Karawaci',
      description: 'Easy access via toll road'
    },
    {
      icon: Clock,
      label: 'Operating Hours',
      value: 'Daily: 10:00 AM - 10:00 PM',
      description: 'Including public holidays'
    }
  ];

  const enquiryTypes = [
    {
      icon: MessageCircle,
      title: 'General Enquiry',
      description: 'Questions about mall services, facilities, or general information',
      type: 'General'
    },
    {
      icon: Building,
      title: 'Leasing',
      description: 'Interested in opening a store or renting space in our mall',
      type: 'Leasing'
    },
    {
      icon: Briefcase,
      title: 'Marketing',
      description: 'Partnership opportunities, events, or promotional activities',
      type: 'Marketing'
    },
    {
      icon: Scale,
      title: 'Legal',
      description: 'Legal matters, contracts, or official documentation',
      type: 'Legal'
    },
    {
      icon: HeadphonesIcon,
      title: 'Lost & Found',
      description: 'Report lost items or inquire about found belongings',
      type: 'Lost & Found'
    },
    {
      icon: Car,
      title: 'Parking & Security',
      description: 'Issues related to parking, security, or safety concerns',
      type: 'Parking & Security'
    }
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero Section - Now using reusable Hero component */}
      <Hero
        title={<>Get in <span className="text-accent">Touch</span></>}
        subtitle="We're here to help! Whether you have questions about our stores, want to plan your visit, or need assistance with anything else, our team is ready to assist you."
        stats={[
          { value: "300+", label: "Stores" },
          { value: "3000+", label: "Parking Spaces" },
          { value: "24/7", label: "Security" }
        ]}
        variant="lead"
        bgPattern="soft-circles"
      />

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                  Contact Information
                </h2>
                <p className="text-text-secondary leading-relaxed">
                  Choose the best way to reach us. We're committed to providing you with 
                  excellent service and quick responses.
                </p>
              </div>

              {/* Contact Methods */}
              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + (index * 0.1) }}
                    className={`p-6 bg-surface-secondary border border-border-primary rounded-2xl hover:border-accent/20 hover:shadow-lg transition-all duration-300 group ${
                      item.href ? 'cursor-pointer' : ''
                    }`}
                    onClick={() => item.href && window.open(item.href, '_blank')}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-accent/10 rounded-xl group-hover:bg-accent group-hover:text-text-inverse transition-colors duration-300">
                        <item.icon className="w-6 h-6 text-accent group-hover:text-text-inverse" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-text-primary mb-1">{item.label}</h3>
                        <p className="text-text-primary font-medium mb-1 break-words">{item.value}</p>
                        {item.description && (
                          <p className="text-sm text-text-muted">{item.description}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Enquiry Types Guide */}
              <div className="mt-12">
                <h3 className="text-2xl font-bold text-text-primary mb-6">How Can We Help?</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {enquiryTypes.map((type, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 + (index * 0.05) }}
                      className="p-4 bg-surface-secondary border border-border-primary rounded-xl hover:border-accent/20 hover:shadow-md transition-all duration-300 group"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors duration-300">
                          <type.icon className="w-4 h-4 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-text-primary text-sm mb-1">{type.title}</h4>
                          <p className="text-xs text-text-muted leading-relaxed">{type.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:sticky lg:top-8"
            >
              <div className="bg-surface-secondary border border-border-primary rounded-2xl p-8 shadow-lg">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-text-primary mb-2">
                    Send Us a Message
                  </h2>
                  <p className="text-text-secondary">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </div>
                
                <ContactForm />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-surface-tertiary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Visit Us Today
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Located in the heart of Tangerang, Supermal Karawaci is easily accessible 
              and offers ample parking for your convenience.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video bg-surface-secondary border border-border-primary"
          > 
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1981.0575886518147!2d106.60707397307472!3d-6.226926480180976!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sus!4v1760853964651!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Supermal Karawaci Location"
              className="grayscale hover:grayscale-0 transition-all duration-500"
            />
            
            {/* Map Overlay */}
            <div className="absolute inset-0 bg-accent/5 hover:bg-transparent transition-all duration-500 pointer-events-none" />
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;