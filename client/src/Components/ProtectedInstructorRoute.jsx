import { useSelector } from "react-redux"
import { Navigate, useLocation } from "react-router-dom"
import PropTypes from 'prop-types'

const ProtectedInstructorRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth)
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user?.role !== "instructor" && user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
ProtectedInstructorRoute.propTypes = {
  children: PropTypes.node.isRequired
}

export default ProtectedInstructorRoute
