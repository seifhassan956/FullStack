import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

const AdminRoutes = () => {
  const { userInfo } = useSelector((state) => state.auth);
  
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Outlet />
  )
}

export default AdminRoutes