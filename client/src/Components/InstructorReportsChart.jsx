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
  AreaChart,
  Area,
} from "recharts"

const InstructorReportsChart = ({ type }) => {
  const [chartData, setChartData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchChartData()
  }, [type])

  const fetchChartData = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:2000/api/instructor/reports/${type}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setChartData(data)
      } else {
        // Mock data for demonstration
        setMockData()
      }
    } catch (error) {
      console.error("Error fetching chart data:", error)
      setMockData()
    } finally {
      setIsLoading(false)
    }
  }

  const setMockData = () => {
    if (type === "revenue") {
      setChartData([
        { month: "Jan", revenue: 1200 },
        { month: "Feb", revenue: 1800 },
        { month: "Mar", revenue: 1500 },
        { month: "Apr", revenue: 2300 },
        { month: "May", revenue: 2800 },
        { month: "Jun", revenue: 3200 },
      ])
    } else if (type === "enrollments") {
      setChartData([
        { course: "React Masterclass", enrollments: 145 },
        { course: "JavaScript Basics", enrollments: 210 },
        { course: "Node.js Advanced", enrollments: 98 },
        { course: "Python for Beginners", enrollments: 167 },
      ])
    } else if (type === "detailed") {
      setChartData([
        { date: "2024-01-01", students: 45, revenue: 450, questions: 12 },
        { date: "2024-01-02", students: 52, revenue: 520, questions: 8 },
        { date: "2024-01-03", students: 48, revenue: 480, questions: 15 },
        { date: "2024-01-04", students: 61, revenue: 610, questions: 10 },
        { date: "2024-01-05", students: 55, revenue: 550, questions: 7 },
        { date: "2024-01-06", students: 67, revenue: 670, questions: 14 },
        { date: "2024-01-07", students: 72, revenue: 720, questions: 9 },
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
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        )

      case "enrollments":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="course" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="enrollments" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        )

      case "detailed":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="students" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} />
              <Line type="monotone" dataKey="questions" stroke="#ffc658" strokeWidth={2} />
            </LineChart>
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
        return "Enrollments by Course"
      case "detailed":
        return "Performance Analytics"
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

export default InstructorReportsChart