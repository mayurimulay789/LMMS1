"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Users, BookOpen, TrendingUp, Download } from "lucide-react"
import { IndianRupee } from "lucide-react"
import InstructorCourseForm from "../Components/InstructorCourseForm"
import InstructorReportsChart from "../Components/InstructorReportsChart"
import { apiRequest } from "../config/api"

// Custom Indian Rupee Icon component
const IndianRupeeIcon = (props) => (
  <IndianRupee {...props} />
)

const InstructorDashboardPage = () => {
  const { user } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    activeEnrollments: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [courses, setCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [students, setStudents] = useState([])
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [reports, setReports] = useState([])
  const [reportsLoading, setReportsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' }); 

  const [formData, setFormData] = useState({
  name: '',
  email: '',
  phone: '',
  profileImage: '',
  profileImageFile: null,
  nameError: '',
  phoneError: ''
});

const [isSaving, setIsSaving] = useState(false);

// Initialize form data when user data loads
useEffect(() => {
  if (user) {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      profileImage: user.profileImage || '',
      profileImageFile: null,
      nameError: '',
      phoneError: ''
    });
  }
}, [user]);

  useEffect(() => {
    fetchInstructorStats()
    fetchCourses()
  }, [])

  useEffect(() => {
    if (activeTab === "courses") {
      fetchCourses()
    } else if (activeTab === "students") {
      fetchStudents()
    } else if (activeTab === "reports") {
      fetchReports()
    }
  }, [activeTab])

const handleEditProfile = async () => {
  // Validate form
  const nameError = !formData.name?.trim() ? 'Name is required' : 
                    formData.name.trim().length < 2 ? 'Name must be at least 2 characters' : '';
  
  const phoneError = !formData.phone?.trim() ? 'Phone number is required' : 
                     !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone.replace(/\s/g, '')) ? 
                     'Please enter a valid phone number (at least 10 digits)' : '';

  // Update errors in state
  setFormData(prev => ({
    ...prev,
    nameError,
    phoneError
  }));

  // If there are validation errors, don't proceed
  if (nameError || phoneError) {
    // Scroll to first error
    if (nameError) {
      document.querySelector('input[name="name"]')?.scrollIntoView({ behavior: 'smooth' });
    } else if (phoneError) {
      document.querySelector('input[name="phone"]')?.scrollIntoView({ behavior: 'smooth' });
    }
    return;
  }

  // Set saving state
  setIsSaving(true);

  try {
    // Use your VITE_API_URL
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:2000/api";
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication token not found. Please login again.');
    }

    // Create FormData for file upload
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name.trim());
    formDataToSend.append('phone', formData.phone.trim());
    
    // Append profile image file if selected
    if (formData.profileImageFile) {
      formDataToSend.append('profileImage', formData.profileImageFile);
    }

    console.log('📤 Sending profile update request...');
    
    // Use the correct endpoint - adjust based on your route structure
    // If your route is at /api/instructor/instructor-profile
    const response = await fetch(`${API_BASE_URL}/auth/instructor-profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData - browser sets it automatically
      },
      credentials: 'include', // Include cookies if using session-based auth
      body: formDataToSend,
    });

    console.log('Response status:', response.status);

    // Parse response
    const responseData = await response.json();

    if (!response.ok) {
      console.error('Server error response:', responseData);
      throw new Error(responseData.message || `Failed to update profile (Status: ${response.status})`);
    }

    console.log('✅ Profile update successful:', responseData);
    
    // REMOVE or COMMENT OUT the onProfileUpdate part since it doesn't exist
    // if (onProfileUpdate && responseData.user) {
    //   onProfileUpdate(responseData.user);
    // }
    
    // Instead, update the formData with new user data
    if (responseData.user) {
      setFormData(prev => ({
        ...prev,
        name: responseData.user.name || prev.name,
        phone: responseData.user.phone || prev.phone,
        profileImage: responseData.user.profileImage || prev.profileImage,
        profileImageFile: null, // Reset file after successful upload
        nameError: '',
        phoneError: ''
      }));
      
      // Also update the Redux user state if you're using Redux
      // You can dispatch an action here if you have Redux set up
      // Example:
      // dispatch(updateUserProfile(responseData.user));
      
      // Or update local storage if you store user data there
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...storedUser,
        name: responseData.user.name,
        phone: responseData.user.phone,
        profileImage: responseData.user.profileImage
      }));
      
      // You could also trigger a page refresh to get updated data
      // window.location.reload(); // Optional: uncomment if you want to refresh
    }
    
    // Show success message
    setMessage({ 
      type: 'success', 
      text: responseData.message || 'Profile updated successfully!' 
    });
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 3000);
    
  } catch (error) {
    console.error('❌ Profile update error:', error);
    
    // Set error message
    setMessage({ 
      type: 'error', 
      text: error.message || 'Failed to update profile. Please try again.' 
    });
    
    // Clear error message after 5 seconds
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 5000);
    
  } finally {
    setIsSaving(false);
  }
};

  const fetchCourses = async () => {
    setCoursesLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await apiRequest("instructor/courses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setCoursesLoading(false)
    }
  }

  const fetchStudents = async () => {
    setStudentsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await apiRequest("instructor/students", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      setStudentsLoading(false)
    }
  }

  const fetchReports = async () => {
    setReportsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await apiRequest("instructor/reports/revenue", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setReports(data)
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setReportsLoading(false)
    }
  }



  const fetchInstructorStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await apiRequest("instructor/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching instructor stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Courses",
      value: stats.totalCourses,
      icon: BookOpen,
      color: "bg-blue-500",
      change: "+5%",
    },
    {
      title: "Total Enrollments",
      value: stats.totalEnrollments,
      icon: Users,
      color: "bg-green-500",
      change: "+12%",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: IndianRupeeIcon,
      color: "bg-purple-500",
      change: "+23%",
    },
    {
      title: "Active Enrollments",
      value: stats.activeEnrollments,
      icon: TrendingUp,
      color: "bg-orange-500",
      change: "+15%",
    },
  ]

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "courses", label: "My Courses" },
    { id: "students", label: "Students" },
    { id: "reports", label: "Reports" },
    { id: "profile", label: "Profile" },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center py-4 sm:py-6 gap-2 xs:gap-0">
              <div className="py-6 text-center flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
                <p className="text-gray-600 mb-2">Manage your courses and students</p>
                <button className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-1 text-xs sm:text-sm mx-auto">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <nav className="flex overflow-x-auto no-scrollbar space-x-4 sm:space-x-8 -mx-2 px-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-3 px-2 sm:py-4 sm:px-1 border-b-2 font-medium text-xs sm:text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === "overview" && (
          <div className="space-y-6 sm:space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {statCards.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-lg sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs sm:text-sm text-green-600 mt-1">{stat.change} from last month</p>
                      {/* Progress bar removed as per user request */}
                    </div>
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${stat.color} flex items-center justify-center ml-2 sm:ml-4`}>
                      <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
              <InstructorReportsChart type="revenue" />
              <InstructorReportsChart type="enrollments" />
            </div>
          </div>
        )}

        {activeTab === "courses" && (
          <InstructorCourseForm />
        )}

        {activeTab === "students" && (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">My Students</h3>

            {studentsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : students.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No students enrolled yet.</p>
            ) : (
              <div className="space-y-4">
                {students.map((enrollment) => (
                  <div key={enrollment._id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                      <div className="flex-1">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-900">{enrollment.user.name}</h4>
                        <p className="text-gray-600 mt-1 text-xs sm:text-sm">{enrollment.user.email}</p>
                        <p className="text-gray-600 mt-1 text-xs sm:text-sm">Course: {enrollment.course.title}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs sm:text-sm text-gray-500">
                          <span>Enrolled: {new Date(enrollment.createdAt).toLocaleDateString()}</span>
                          <span>Status: {enrollment.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "reports" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports</h3>

            {reportsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : reports.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No reports data available.</p>
            ) : (
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-gray-900 mb-2">Revenue Reports</h4>
                {reports.map((report, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-900 font-medium">
                          {new Date(report._id.year, report._id.month - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                        </p>
                        <p className="text-gray-600">Revenue: ₹{report.revenue}</p>
                        <p className="text-gray-600">Transactions: {report.count}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* {activeTab === "profile" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Management</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-2">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={user?.name || ""}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={user?.email || ""}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )} */}


        {message.text && (
  <div className={`mb-4 p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
    {message.text}
  </div>
)}


          {activeTab === "profile" && (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Management</h3>
    <div className="space-y-6">
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-2">Personal Information</h4>
        
        {/* Profile Image Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300">
              {formData.profileImage ? (
                <img 
                  src={formData.profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : user?.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setFormData(prev => ({
                        ...prev,
                        profileImage: reader.result,
                        profileImageFile: file
                      }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">JPG, PNG, or GIF (max 5MB)</p>
            </div>
          </div>
        </div>

        {/* Personal Info Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name *</label>
            <input
              type="text"
              value={formData.name || user?.name || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
            {formData.nameError && (
              <p className="text-red-500 text-sm mt-1">{formData.nameError}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email *</label>
            <input
              type="email"
              value={formData.email || user?.email || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
            <input
              type="tel"
              value={formData.phone || user?.phone || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="+91 9876543210"
              required
            />
            {formData.phoneError && (
              <p className="text-red-500 text-sm mt-1">{formData.phoneError}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Save Button */}
      <div className="flex justify-end">
        <button 
          onClick={handleEditProfile}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSaving}
        >
          {isSaving ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </span>
          ) : 'Save Changes'}
        </button>
      </div>
    </div>
  </div>
)}


      </div>
    </div>
  )
}

export default InstructorDashboardPage
