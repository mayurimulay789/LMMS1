"use client"

import { useState } from "react"

const InstructorApplicationForm = ({ onSubmitSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    applicantName: '',
    email: '',
    phone: '',
    experience: '',
    qualifications: '',
    motivation: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'applicantName':
        if (!value.trim()) {
          error = 'Full name is required';
        } else if (value.trim().length < 2) {
          error = 'Name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          error = 'Name can only contain letters and spaces';
        }
        break;

      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;

      case 'phone':
        if (!value.trim()) {
          error = 'Phone number is required';
        } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(value.replace(/\s/g, ''))) {
          error = 'Please enter a valid phone number (at least 10 digits)';
        }
        break;

      case 'experience':
        if (!value.trim()) {
          error = 'Experience description is required';
        } else if (value.trim().length < 10) {
          error = 'Please provide at least 10 characters describing your experience';
        }
        break;

      case 'qualifications':
        if (!value.trim()) {
          error = 'Qualifications are required';
        } else if (value.trim().length < 10) {
          error = 'Please provide at least 10 characters describing your qualifications';
        }
        break;

      case 'motivation':
        if (!value.trim()) {
          error = 'Motivation statement is required';
        } else if (value.trim().length < 20) {
          error = 'Please provide at least 20 characters explaining your motivation';
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Validate field on change
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setMessage('Please fix the errors below before submitting.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:2000/api/instructor/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      const data = await response.json();
      setFormData({
        applicantName: '',
        email: '',
        phone: '',
        experience: '',
        qualifications: '',
        motivation: ''
      });
      setMessage('Application submitted successfully!');
      if (onSubmitSuccess) onSubmitSuccess();
      if (onClose) onClose();
    } catch (error) {
      console.error(error);
      setMessage('Error submitting application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4 max-w-md mx-auto">
      <h3 className="text-lg font-bold text-gray-800">Instructor Application Form</h3>
      
      {message && (
        <div className={`p-3 rounded ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <div>
        <input
          type="text"
          name="applicantName"
          value={formData.applicantName}
          onChange={handleChange}
          placeholder="Full Name"
          required
          className={`w-full border rounded p-2 focus:outline-none focus:ring-2 ${
            errors.applicantName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-rose-500'
          }`}
        />
        {errors.applicantName && (
          <p className="text-red-500 text-sm mt-1">{errors.applicantName}</p>
        )}
      </div>

      <div>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email Address"
          required
          className={`w-full border rounded p-2 focus:outline-none focus:ring-2 ${
            errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-rose-500'
          }`}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone Number"
          required
          className={`w-full border rounded p-2 focus:outline-none focus:ring-2 ${
            errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-rose-500'
          }`}
        />
        {errors.phone && (
          <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
        )}
      </div>

      <div>
        <textarea
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          rows="3"
          placeholder="Teaching/Professional Experience"
          required
          className={`w-full border rounded p-2 focus:outline-none focus:ring-2 ${
            errors.experience ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-rose-500'
          }`}
        />
        {errors.experience && (
          <p className="text-red-500 text-sm mt-1">{errors.experience}</p>
        )}
      </div>

      <div>
        <textarea
          name="qualifications"
          value={formData.qualifications}
          onChange={handleChange}
          rows="3"
          placeholder="Qualifications and Certifications"
          required
          className={`w-full border rounded p-2 focus:outline-none focus:ring-2 ${
            errors.qualifications ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-rose-500'
          }`}
        />
        {errors.qualifications && (
          <p className="text-red-500 text-sm mt-1">{errors.qualifications}</p>
        )}
      </div>

      <div>
        <textarea
          name="motivation"
          value={formData.motivation}
          onChange={handleChange}
          rows="4"
          placeholder="Why do you want to become an instructor?"
          required
          className={`w-full border rounded p-2 focus:outline-none focus:ring-2 ${
            errors.motivation ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-rose-500'
          }`}
        />
        {errors.motivation && (
          <p className="text-red-500 text-sm mt-1">{errors.motivation}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-rose-600 text-white py-2 rounded hover:bg-rose-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  );
};

export default InstructorApplicationForm;
