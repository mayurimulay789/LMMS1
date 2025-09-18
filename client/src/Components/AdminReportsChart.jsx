"use client"

import { useState, useEffect } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const AdminReportsChart = ({ type }) => {
  const [chartData, setChartData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchChartData()
  }, [type])

  const fetchChartData = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5000/api/admin/reports/${type}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setChartData(data)
      }
    } catch (error) {
      console.error("Error fetching chart data:", error)
      // Mock data for demonstration
      setMockData()
    } finally {
      setIsLoading(false)
    }
  }

  const setMockData = () => {
    if (type === "revenue") {
      setChartData([
        { month: "Jan", revenue: 4000, enrollments: 240 },
        { month: "Feb", revenue: 3000, enrollments: 198 },
        { month: "Mar", revenue: 5000, enrollments: 300 },
        { month: "Apr", revenue: 4500, enrollments: 278 },
        { month: "May", revenue: 6000, enrollments: 389 },
        { month: "Jun", revenue: 5500, enrollments: 349 },
      ])
    } else if (type === "enrollments") {
      setChartData([
        { name: "JavaScript", value: 400, color: "#8884d8" },
        { name: "React", value: 300, color: "#82ca9d" },
        { name: "Node.js", value: 200, color: "#ffc658" },
        { name: "Python", value: 150, color: "#ff7300" },
        { name: "Other", value: 100, color: "#00ff00" },
      ])
    } else if (type === "detailed") {
      setChartData([
        { date: "2024-01-01", users: 120, courses: 15, revenue: 2400 },
        { date: "2024-01-02", users: 132, courses: 16, revenue: 2600 },
        { date: "2024-01-03", users: 145, courses: 18, revenue: 2800 },
        { date: "2024-01-04", users: 158, courses: 19, revenue: 3000 },
        { date: "2024-01-05", users: 167, courses: 20, revenue: 3200 },
        { date: "2024-01-06", users: 178, courses: 22, revenue: 3400 },
        { date: "2024-01-07", users: 189, courses: 23, revenue: 3600 },
      ])
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    )
  }

  const renderChart = () => {
    switch (type) {
      case "revenue":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )

      case "enrollments":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )

      case "detailed":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="users" fill="#8884d8" />
              <Bar dataKey="courses" fill="#82ca9d" />
              <Bar dataKey="revenue" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        )

      default:
        return <div>Chart type not supported</div>
    }
  }

  const getTitle = () => {
    switch (type) {
      case "revenue":
        return "Revenue Trends"
      case "enrollments":
        return "Course Enrollments by Category"
      case "detailed":
        return "Detailed Analytics"
      default:
        return "Analytics"
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{getTitle()}</h3>
      {renderChart()}
    </div>
  )
}

export default AdminReportsChart
