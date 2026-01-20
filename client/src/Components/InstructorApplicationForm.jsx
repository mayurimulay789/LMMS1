// "use client"

// import { useState } from "react"

// const InstructorApplicationForm = ({ onSubmitSuccess, onClose }) => {
//   const [formData, setFormData] = useState({
//     applicantName: '',
//     email: '',
//     phone: '',
//     experience: '',
//     qualifications: '',
//     motivation: '',
//     password: '',
//     confirmPassword: ''
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [message, setMessage] = useState('');
//   const [errors, setErrors] = useState({});
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const validateField = (name, value) => {
//     let error = '';

//     switch (name) {
//       case 'applicantName':
//         if (!value.trim()) {
//           error = 'Full name is required';
//         } else if (value.trim().length < 2) {
//           error = 'Name must be at least 2 characters';
//         } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
//           error = 'Name can only contain letters and spaces';
//         }
//         break;

//       case 'email':
//         if (!value.trim()) {
//           error = 'Email is required';
//         } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
//           error = 'Please enter a valid email address';
//         }
//         break;

//       case 'phone':
//         if (!value.trim()) {
//           error = 'Phone number is required';
//         } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(value.replace(/\s/g, ''))) {
//           error = 'Please enter a valid phone number (at least 10 digits)';
//         }
//         break;

//       case 'experience':
//         if (!value.trim()) {
//           error = 'Experience description is required';
//         } else if (value.trim().length < 10) {
//           error = 'Please provide at least 10 characters describing your experience';
//         }
//         break;

//       case 'qualifications':
//         if (!value.trim()) {
//           error = 'Qualifications are required';
//         } else if (value.trim().length < 10) {
//           error = 'Please provide at least 10 characters describing your qualifications';
//         }
//         break;

//       case 'motivation':
//         if (!value.trim()) {
//           error = 'Motivation statement is required';
//         } else if (value.trim().length < 20) {
//           error = 'Please provide at least 20 characters explaining your motivation';
//         }
//         break;

//       case 'password':
//         if (!value) {
//           error = 'Password is required';
//         } else if (value.length < 6) {
//           error = 'Password must be at least 6 characters';
//         }
//         break;

//       case 'confirmPassword':
//         if (!value) {
//           error = 'Please confirm your password';
//         } else if (value !== formData.password) {
//           error = 'Passwords do not match';
//         }
//         break;

//       default:
//         break;
//     }

//     return error;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value
//     });

//     // Validate field on change
//     const error = validateField(name, value);
//     setErrors(prev => ({
//       ...prev,
//       [name]: error
//     }));
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     Object.keys(formData).forEach(field => {
//       const error = validateField(field, formData[field]);
//       if (error) newErrors[field] = error;
//     });
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) {
//       setMessage('Please fix the errors below before submitting.');
//       return;
//     }

//     setIsSubmitting(true);
//     setMessage('');

//     try {
//       const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? "http://localhost:2000/api" : "https://online.rymaacademy.cloud/api")
//       const response = await fetch(`${API_BASE_URL}/instructor/apply`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(formData),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to submit application');
//       }

//       const data = await response.json();
//       setFormData({
//         applicantName: '',
//         email: '',
//         phone: '',
//         experience: '',
//         qualifications: '',
//         motivation: '',
//         password: '',
//         confirmPassword: ''
//       });
//       setMessage('Application submitted successfully!');
//       if (onSubmitSuccess) onSubmitSuccess();
//       if (onClose) onClose();
//     } catch (error) {
//       console.error(error);
//       setMessage('Error submitting application. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4 max-w-md mx-auto">
      
//       {message && (
//         <div className={`p-3 rounded ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
//           {message}
//         </div>
//       )}

//       <div>
//         <input
//           type="text"
//           name="applicantName"
//           value={formData.applicantName}
//           onChange={handleChange}
//           placeholder="Full Name"
//           required
//           className={`w-full border rounded p-2 focus:outline-none focus:ring-2 ${
//             errors.applicantName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-rose-500'
//           }`}
//         />
//         {errors.applicantName && (
//           <p className="text-red-500 text-sm mt-1">{errors.applicantName}</p>
//         )}
//       </div>

//       <div>
//         <input
//           type="email"
//           name="email"
//           value={formData.email}
//           onChange={handleChange}
//           placeholder="Email Address"
//           required
//           className={`w-full border rounded p-2 focus:outline-none focus:ring-2 ${
//             errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-rose-500'
//           }`}
//         />
//         {errors.email && (
//           <p className="text-red-500 text-sm mt-1">{errors.email}</p>
//         )}
//       </div>

//       <div>
//         <input
//           type="tel"
//           name="phone"
//           value={formData.phone}
//           onChange={handleChange}
//           placeholder="Phone Number"
//           required
//           className={`w-full border rounded p-2 focus:outline-none focus:ring-2 ${
//             errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-rose-500'
//           }`}
//         />
//         {errors.phone && (
//           <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
//         )}
//       </div>

//       <div>
//         <textarea
//           name="experience"
//           value={formData.experience}
//           onChange={handleChange}
//           rows="3"
//           placeholder="Teaching/Professional Experience"
//           required
//           className={`w-full border rounded p-2 focus:outline-none focus:ring-2 ${
//             errors.experience ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-rose-500'
//           }`}
//         />
//         {errors.experience && (
//           <p className="text-red-500 text-sm mt-1">{errors.experience}</p>
//         )}
//       </div>

//       <div>
//         <textarea
//           name="qualifications"
//           value={formData.qualifications}
//           onChange={handleChange}
//           rows="3"
//           placeholder="Qualifications and Certifications"
//           required
//           className={`w-full border rounded p-2 focus:outline-none focus:ring-2 ${
//             errors.qualifications ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-rose-500'
//           }`}
//         />
//         {errors.qualifications && (
//           <p className="text-red-500 text-sm mt-1">{errors.qualifications}</p>
//         )}
//       </div>

//       <div>
//         <textarea
//           name="motivation"
//           value={formData.motivation}
//           onChange={handleChange}
//           rows="4"
//           placeholder="Why do you want to become an instructor?"
//           required
//           className={`w-full border rounded p-2 focus:outline-none focus:ring-2 ${
//             errors.motivation ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-rose-500'
//           }`}
//         />
//         {errors.motivation && (
//           <p className="text-red-500 text-sm mt-1">{errors.motivation}</p>
//         )}
//       </div>

//       <div>
//         <div className="relative">
//           <input
//             type={showPassword ? "text" : "password"}
//             name="password"
//             value={formData.password}
//             onChange={handleChange}
//             placeholder="Create a Password"
//             required
//             className={`w-full border rounded p-2 pr-10 focus:outline-none focus:ring-2 ${
//               errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-rose-500'
//             }`}
//           />
//           <button
//             type="button"
//             onClick={() => setShowPassword(!showPassword)}
//             className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
//           >
//             {showPassword ? '🙈' : '👁️'}
//           </button>
//         </div>
//         {errors.password && (
//           <p className="text-red-500 text-sm mt-1">{errors.password}</p>
//         )}
//       </div>

//       <div>
//         <div className="relative">
//           <input
//             type={showConfirmPassword ? "text" : "password"}
//             name="confirmPassword"
//             value={formData.confirmPassword}
//             onChange={handleChange}
//             placeholder="Confirm Password"
//             required
//             className={`w-full border rounded p-2 pr-10 focus:outline-none focus:ring-2 ${
//               errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-rose-500'
//             }`}
//           />
//           <button
//             type="button"
//             onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//             className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
//           >
//             {showConfirmPassword ? '🙈' : '👁️'}
//           </button>
//         </div>
//         {errors.confirmPassword && (
//           <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
//         )}
//       </div>

//       <button
//         type="submit"
//         disabled={isSubmitting}
//         className="w-full bg-primary-800 text-white py-2 rounded hover:bg-primary-800 disabled:opacity-50"
//       >
//         {isSubmitting ? 'Submitting...' : 'Submit Application'}
//       </button>
//     </form>
//   );
// };

// export default InstructorApplicationForm;


"use client"

import { useState } from "react"

const InstructorApplicationForm = ({ onSubmitSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    applicantName: '',
    email: '',
    phone: '',
    experience: '',
    qualifications: '',
    motivation: '',
    password: '',
    confirmPassword: '',
    profileImage: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

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

      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters';
        }
        break;

      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password';
        } else if (value !== formData.password) {
          error = 'Passwords do not match';
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (name === 'profileImage' && files && files[0]) {
      const file = files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          profileImage: 'Please upload an image file'
        }));
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      
      setFormData({
        ...formData,
        profileImage: file
      });
      
      setErrors(prev => ({
        ...prev,
        profileImage: ''
      }));
    } else {
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
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      if (field !== 'profileImage') {
        const error = validateField(field, formData[field]);
        if (error) newErrors[field] = error;
      }
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
      const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? "http://localhost:2000/api" : "https://online.rymaacademy.cloud/api");
      
      // Create FormData to handle file upload
      const formDataToSend = new FormData();
      
      // Append all form data
      Object.keys(formData).forEach(key => {
        if (key === 'profileImage' && formData[key] instanceof File) {
          formDataToSend.append('profileImage', formData[key]);
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/instructor/apply`, {
        method: 'POST',
        body: formDataToSend,
        // Don't set Content-Type header for FormData - browser will set it automatically
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
        motivation: '',
        password: '',
        confirmPassword: '',
        profileImage: null
      });
      setPreviewImage('');
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
      
      {message && (
        <div className={`p-3 rounded ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      {/* Profile Image Upload Field - ADDED HERE */}
      <div>
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Profile Picture
          </label>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 border">
              {previewImage ? (
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                name="profileImage"
                onChange={handleChange}
                accept="image/*"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">JPG, PNG, or GIF (max 5MB)</p>
              {errors.profileImage && (
                <p className="text-red-500 text-sm mt-1">{errors.profileImage}</p>
              )}
            </div>
          </div>
        </div>
      </div>

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

      <div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a Password"
            required
            className={`w-full border rounded p-2 pr-10 focus:outline-none focus:ring-2 ${
              errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-rose-500'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
        )}
      </div>

      <div>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            required
            className={`w-full border rounded p-2 pr-10 focus:outline-none focus:ring-2 ${
              errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-rose-500'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showConfirmPassword ? '🙈' : '👁️'}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary-800 text-white py-2 rounded hover:bg-primary-800 disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  );
};

export default InstructorApplicationForm;