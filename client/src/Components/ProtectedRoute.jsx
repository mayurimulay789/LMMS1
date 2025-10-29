import { useSelector } from "react-redux"
import { Navigate, useLocation, Outlet } from "react-router-dom"
import PropTypes from 'prop-types'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth)
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children || <Outlet />
}
ProtectedRoute.propTypes = {
  children: PropTypes.node
}

export default ProtectedRoute
