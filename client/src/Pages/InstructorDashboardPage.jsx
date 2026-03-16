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
      
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...storedUser,
        name: responseData.user.name,
        phone: responseData.user.phone,
        profileImage: responseData.user.profileImage
      }));

    }

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
        console.log("Instructor stats response:", data)
        setStats({
          totalCourses: data.totalCourses ?? 0,
          totalEnrollments: data.totalEnrollments ?? 0,
          totalRevenue: data.totalRevenue ?? 0,
          activeEnrollments: data.activeEnrollments ?? 0,
        })
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
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6 text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage your courses and students</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex overflow-x-auto no-scrollbar space-x-4 sm:space-x-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm ${
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === "overview" && (
          <div className="space-y-6 sm:space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {statCards.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{stat.value}</p>
                      {/* <p className="text-xs sm:text-sm text-green-600 mt-1">{stat.change} from last month</p> */}
                    </div>
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${stat.color} flex items-center justify-center ml-2 sm:ml-4 flex-shrink-0`}>
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
              <p className="text-sm sm:text-base text-gray-600 text-center py-8">No students enrolled yet.</p>
            ) : (
              <div className="space-y-4">
                {students.map((enrollment) => (
                  <div key={enrollment._id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex-1">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-900">{enrollment.user.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">{enrollment.user.email}</p>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">Course: {enrollment.course.title}</p>
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
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Reports</h3>

            {reportsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : reports.length === 0 ? (
              <p className="text-sm sm:text-base text-gray-600 text-center py-8">No reports data available.</p>
            ) : (
              <div className="space-y-4">
                <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">Revenue Reports</h4>
                {reports.map((report, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm sm:text-base text-gray-900 font-medium">
                          {new Date(report._id.year, report._id.month - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">Revenue: ₹{report.revenue}</p>
                        <p className="text-xs sm:text-sm text-gray-600">Transactions: {report.count}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* {activeTab === "profile" && ( ... )} */}

        {message.text && (
          <div className={`mb-4 p-3 sm:p-4 rounded-md text-sm sm:text-base ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  )
}

export default InstructorDashboardPage