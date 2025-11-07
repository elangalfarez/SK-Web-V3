// src/components/ui/contact-form.tsx
// Fixed: zod enum syntax + removed unused imports/variables

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, AlertCircle, RefreshCw, User, Mail, Phone, MessageSquare, Clock } from 'lucide-react'
import { submitContactForm, type ContactInsert } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { ContactSuccessModal } from './contact-success-modal'
import toast from 'react-hot-toast'

// Zod schema matching the SQL table structure
const contactSchema = z.object({
  full_name: z
    .string()
    .min(1, 'Full name is required')
    .max(255, 'Full name must be less than 255 characters')
    .trim(),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase(),
  phone_number: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[+]?[0-9\s\-()]{10,50}$/.test(val),
      'Please enter a valid phone number'
    ),
  enquiry_type: z.enum(
    ['General', 'Leasing', 'Marketing', 'Legal', 'Lost & Found', 'Parking & Security'],
    {
      message: 'Please select an enquiry type'
    }
  ),
  enquiry_details: z
    .string()
    .min(10, 'Please provide at least 10 characters')
    .max(2000, 'Details must be less than 2000 characters')
    .trim(),
  // Honeypot field - should always be empty
  website: z.string().max(0, 'Invalid submission detected')
})

type ContactFormData = z.infer<typeof contactSchema>

// Cooldown management
const COOLDOWN_KEY = 'contact_form_cooldown'
const COOLDOWN_DURATION = 30 * 1000 // 30 seconds

const getCooldownRemaining = (): number => {
  if (typeof window === 'undefined') return 0
  
  const lastSubmission = localStorage.getItem(COOLDOWN_KEY)
  if (!lastSubmission) return 0
  
  const timePassed = Date.now() - parseInt(lastSubmission)
  const remaining = COOLDOWN_DURATION - timePassed
  
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0
}

const setCooldown = (): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(COOLDOWN_KEY, Date.now().toString())
}

export const ContactForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [submissionCount, setSubmissionCount] = useState(0)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone_number: '',
      enquiry_type: undefined,
      enquiry_details: '',
      website: ''
    },
    mode: 'onChange'
  })

  // Watch form fields for dynamic updates
  const enquiryDetails = watch('enquiry_details') || ''
  const selectedEnquiryType = watch('enquiry_type')
  const detailsLength = enquiryDetails.length
  const detailsMaxLength = 2000

  // Initialize and manage cooldown
  useEffect(() => {
    const remaining = getCooldownRemaining()
    setCooldownSeconds(remaining)

    if (remaining > 0) {
      const interval = setInterval(() => {
        const newRemaining = getCooldownRemaining()
        setCooldownSeconds(newRemaining)
        
        if (newRemaining <= 0) {
          clearInterval(interval)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [submissionCount])

  const onSubmit = async (data: ContactFormData) => {
    // Check cooldown
    if (getCooldownRemaining() > 0) {
      toast.error('Please wait before submitting another message.')
      return
    }

    // Check honeypot
    if (data.website && data.website.length > 0) {
      console.warn('Honeypot triggered - potential bot submission')
      toast.error('Submission error. Please try again.')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Prepare data for submission (exclude honeypot field)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { website, ...submitData } = data
      
      // submitContactForm returns Contact directly or throws error
      await submitContactForm(submitData as ContactInsert)

      // Success - show modal and reset form
      setShowSuccessModal(true)
      setCooldown()
      setSubmissionCount(prev => prev + 1)
      reset()
      
      toast.success('Message sent successfully!', {
        duration: 4000,
        icon: '✅'
      })

    } catch (error: unknown) {
      console.error('Contact form submission error:', error)

      const errorMessage = error instanceof Error ? error.message : 'Failed to send message. Please try again.'
      setSubmitError(errorMessage)
      
      toast.error(errorMessage, {
        duration: 5000,
        icon: '❌'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isDisabled = isSubmitting || cooldownSeconds > 0

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Honeypot field - hidden from users */}
        <input
          {...register('website')}
          type="text"
          name="website"
          autoComplete="off"
          tabIndex={-1}
          aria-hidden="true"
          className="absolute opacity-0 pointer-events-none"
          style={{ position: 'absolute', left: '-9999px' }}
        />

        {/* Full Name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <label htmlFor="full_name" className="block text-sm font-medium text-text-primary mb-2">
            Full Name <span className="text-error">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-text-muted" />
            </div>
            <input
              {...register('full_name')}
              id="full_name"
              type="text"
              autoComplete="name"
              className={`w-full pl-12 pr-4 py-3 bg-surface border-2 rounded-xl text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:border-accent focus:shadow-md ${
                errors.full_name ? 'border-error' : 'border-border-primary hover:border-border-secondary'
              }`}
              placeholder="Enter your full name"
              aria-invalid={errors.full_name ? 'true' : 'false'}
              aria-describedby={errors.full_name ? 'full_name_error' : undefined}
            />
          </div>
          {errors.full_name && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              id="full_name_error"
              role="alert"
              className="mt-2 text-sm text-error flex items-center"
            >
              <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
              {errors.full_name.message}
            </motion.p>
          )}
        </motion.div>

        {/* Email */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
            Email Address <span className="text-error">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-text-muted" />
            </div>
            <input
              {...register('email')}
              id="email"
              type="email"
              autoComplete="email"
              className={`w-full pl-12 pr-4 py-3 bg-surface border-2 rounded-xl text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:border-accent focus:shadow-md ${
                errors.email ? 'border-error' : 'border-border-primary hover:border-border-secondary'
              }`}
              placeholder="Enter your email address"
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email_error' : undefined}
            />
          </div>
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              id="email_error"
              role="alert"
              className="mt-2 text-sm text-error flex items-center"
            >
              <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
              {errors.email.message}
            </motion.p>
          )}
        </motion.div>

        {/* Phone Number */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <label htmlFor="phone_number" className="block text-sm font-medium text-text-primary mb-2">
            Phone Number <span className="text-text-muted">(Optional)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-text-muted" />
            </div>
            <input
              {...register('phone_number')}
              id="phone_number"
              type="tel"
              autoComplete="tel"
              className={`w-full pl-12 pr-4 py-3 bg-surface border-2 rounded-xl text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:border-accent focus:shadow-md ${
                errors.phone_number ? 'border-error' : 'border-border-primary hover:border-border-secondary'
              }`}
              placeholder="Enter your phone number"
              aria-invalid={errors.phone_number ? 'true' : 'false'}
              aria-describedby={errors.phone_number ? 'phone_error' : undefined}
            />
          </div>
          {errors.phone_number && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              id="phone_error"
              role="alert"
              className="mt-2 text-sm text-error flex items-center"
            >
              <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
              {errors.phone_number.message}
            </motion.p>
          )}
        </motion.div>

        {/* Enquiry Type */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <label htmlFor="enquiry_type" className="block text-sm font-medium text-text-primary mb-2">
            Enquiry Type <span className="text-error">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MessageSquare className="h-5 w-5 text-text-muted" />
            </div>
            <select
              {...register('enquiry_type')}
              id="enquiry_type"
              className={`w-full pl-12 pr-4 py-3 bg-surface border-2 rounded-xl text-text-primary transition-all duration-200 focus:outline-none focus:border-accent focus:shadow-md appearance-none cursor-pointer ${
                errors.enquiry_type ? 'border-error' : 'border-border-primary hover:border-border-secondary'
              } ${!selectedEnquiryType ? 'text-text-muted' : ''}`}
              aria-invalid={errors.enquiry_type ? 'true' : 'false'}
              aria-describedby={errors.enquiry_type ? 'enquiry_type_error' : undefined}
            >
              <option value="">Select an enquiry type</option>
              <option value="General">General</option>
              <option value="Leasing">Leasing</option>
              <option value="Marketing">Marketing</option>
              <option value="Legal">Legal</option>
              <option value="Lost & Found">Lost & Found</option>
              <option value="Parking & Security">Parking & Security</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {errors.enquiry_type && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              id="enquiry_type_error"
              role="alert"
              className="mt-2 text-sm text-error flex items-center"
            >
              <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
              {errors.enquiry_type.message}
            </motion.p>
          )}
        </motion.div>

        {/* Enquiry Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="enquiry_details" className="block text-sm font-medium text-text-primary">
              Enquiry Details <span className="text-error">*</span>
            </label>
            <span className={`text-xs ${
              detailsLength > detailsMaxLength ? 'text-error' : 
              detailsLength > detailsMaxLength * 0.9 ? 'text-warning' : 
              'text-text-muted'
            }`}>
              {detailsLength} / {detailsMaxLength}
            </span>
          </div>
          <textarea
            {...register('enquiry_details')}
            id="enquiry_details"
            rows={6}
            className={`w-full px-4 py-3 bg-surface border-2 rounded-xl text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:border-accent focus:shadow-md resize-none ${
              errors.enquiry_details ? 'border-error' : 'border-border-primary hover:border-border-secondary'
            }`}
            placeholder="Please provide detailed information about your enquiry..."
            aria-invalid={errors.enquiry_details ? 'true' : 'false'}
            aria-describedby={errors.enquiry_details ? 'enquiry_details_error' : undefined}
          />
          {errors.enquiry_details && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              id="enquiry_details_error"
              role="alert"
              className="mt-2 text-sm text-error flex items-center"
            >
              <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
              {errors.enquiry_details.message}
            </motion.p>
          )}
        </motion.div>

        {/* Submit Error Display */}
        <AnimatePresence>
          {submitError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl bg-error/10 border-2 border-error p-4"
            >
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-error">Submission Error</h3>
                  <p className="mt-1 text-sm text-error/90">
                    {submitError}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Button
            type="submit"
            disabled={isDisabled}
            className={`w-full py-4 text-lg font-semibold transition-all duration-300 ${
              isDisabled 
                ? 'cursor-not-allowed opacity-50' 
                : 'hover:scale-105 hover:shadow-lg'
            }`}
          >
            <AnimatePresence mode="wait">
              {isSubmitting ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Sending Message...
                </motion.div>
              ) : cooldownSeconds > 0 ? (
                <motion.div
                  key="cooldown"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <Clock className="h-5 w-5 mr-2" />
                  Wait {cooldownSeconds}s
                </motion.div>
              ) : (
                <motion.div
                  key="send"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Send Message
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          {!isDirty && !isSubmitting && (
            <p className="mt-3 text-center text-sm text-text-muted">
              Fill out the form to send us a message
            </p>
          )}
        </motion.div>
      </form>

      {/* Success Modal */}
      <ContactSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </>
  )
}

export default ContactForm