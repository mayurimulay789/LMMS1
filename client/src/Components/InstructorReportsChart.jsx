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
        // Add fallback colors for enrollment data if missing
        const processedData = type === "enrollments" ? addFallbackColors(data) : data
        setChartData(processedData)
      }
    } catch (error) {
      console.error("Error fetching instructor chart data:", error)
      // Mock data for demonstration - instructor specific
      setMockData()
    } finally {
      setIsLoading(false)
    }
  }

  const setMockData = () => {
    if (type === "revenue") {
      setChartData([
        { month: "Jan", revenue: 2000, enrollments: 120 },
        { month: "Feb", revenue: 1500, enrollments: 99 },
        { month: "Mar", revenue: 2500, enrollments: 150 },
        { month: "Apr", revenue: 2250, enrollments: 139 },
        { month: "May", revenue: 3000, enrollments: 194 },
        { month: "Jun", revenue: 2750, enrollments: 174 },
      ])
    } else if (type === "enrollments") {
      setChartData([
        { name: "My Course 1", value: 200, color: "#8884d8" },
        { name: "My Course 2", value: 150, color: "#82ca9d" },
        { name: "My Course 3", value: 100, color: "#ffc658" },
        { name: "My Course 4", value: 75, color: "#ff7300" },
        { name: "Other Courses", value: 50, color: "#00ff00" },
      ])
    } else if (type === "detailed") {
      setChartData([
        { date: "2024-01-01", enrollments: 60, revenue: 1200 },
        { date: "2024-01-02", enrollments: 66, revenue: 1300 },
        { date: "2024-01-03", enrollments: 72, revenue: 1400 },
        { date: "2024-01-04", enrollments: 79, revenue: 1500 },
        { date: "2024-01-05", enrollments: 83, revenue: 1600 },
        { date: "2024-01-06", enrollments: 89, revenue: 1700 },
        { date: "2024-01-07", enrollments: 94, revenue: 1800 },
      ])
    }
  }

  // Add fallback colors for data without color property
  const addFallbackColors = (data) => {
    const colorMap = {
      "My Course 1": "#8884d8",
      "My Course 2": "#82ca9d",
      "My Course 3": "#ffc658",
      "My Course 4": "#ff7300",
      "Other Courses": "#00ff00"
    }

    return data.map((item, index) => ({
      ...item,
      color: item.color || colorMap[item.name] || colorMap[item._id] || `hsl(${index * 45}, 70%, 50%)`
    }))
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
        const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0)
        const avgRevenue = totalRevenue / chartData.length
        const maxRevenue = Math.max(...chartData.map(item => item.revenue))
        const minRevenue = Math.min(...chartData.map(item => item.revenue))
        const maxMonth = chartData.find(item => item.revenue === maxRevenue)?.month
        const minMonth = chartData.find(item => item.revenue === minRevenue)?.month

        return (
          <div className="space-y-6">
            {/* Modern Card Design - Instructor Specific */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Total Revenue Card */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">My Total Revenue</p>
                    <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-400 bg-opacity-30 rounded-lg p-3">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Average Revenue Card */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Average Revenue</p>
                    <p className="text-2xl font-bold">₹{avgRevenue.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-400 bg-opacity-30 rounded-lg p-3">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Growth Rate Card */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">My Growth Rate</p>
                    <p className="text-2xl font-bold">
                      {chartData.length > 1 ?
                        ((chartData[chartData.length - 1].revenue - chartData[0].revenue) / chartData[0].revenue * 100).toFixed(1) + '%'
                        : '0%'
                      }
                    </p>
                  </div>
                  <div className="bg-purple-400 bg-opacity-30 rounded-lg p-3">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 00-1.414 0L8 10.414l-4.293 4.293a1 1 0 011.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293a1 1 0 011.414-1.414z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Performance Cards - Adapted for Instructor */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chartData.map((item, index) => {
                const prevItem = chartData[index - 1]
                const change = prevItem ? item.revenue - prevItem.revenue : 0
                const changePercent = prevItem ? ((change / prevItem.revenue) * 100).toFixed(1) : '0.0'
                const isIncrease = change > 0
                const isHighest = item.revenue === maxRevenue
                const isLowest = item.revenue === minRevenue

                return (
                  <div key={index} className={`relative rounded-xl p-6 shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
                    isHighest
                      ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
                      : isLowest
                      ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'
                      : 'bg-white border-gray-200'
                  }`}>
                    {/* Performance Indicator */}
                    {isHighest && (
                      <div className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full p-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      </div>
                    )}
                    {isLowest && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                        </svg>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Month Header */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">{item.month}</h3>
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          isIncrease
                            ? 'bg-green-100 text-green-800'
                            : change < 0
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {prevItem ? `${isIncrease ? '+' : ''}${changePercent}%` : 'N/A'}
                        </div>
                      </div>

                      {/* Revenue Amount */}
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">My Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">₹{item.revenue.toLocaleString()}</p>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Performance</span>
                          <span className="font-medium">{Math.round((item.revenue / maxRevenue) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              isHighest ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                              isLowest ? 'bg-gradient-to-r from-red-400 to-pink-500' :
                              'bg-gradient-to-r from-blue-400 to-blue-600'
                            }`}
                            style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Trend Indicator */}
                      {prevItem && (
                        <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                          <div className={`flex items-center space-x-1 ${
                            isIncrease ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {isIncrease ? (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L9 3.414 2.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 16.586l6.293-6.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                              </svg>
                            )}
                            <span className="text-sm font-medium">
                              {isIncrease ? 'Growing' : 'Declining'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary Statistics - Instructor Specific */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4">My Performance Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-green-100 rounded-lg p-4 inline-block">
                    <svg className="w-8 h-8 text-green-600 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">Best Month</p>
                  <p className="text-lg font-bold text-gray-900">{maxMonth}: ₹{maxRevenue.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 rounded-lg p-4 inline-block">
                    <svg className="w-8 h-8 text-blue-600 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-lg font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <div className="bg-orange-100 rounded-lg p-4 inline-block">
                    <svg className="w-8 h-8 text-orange-600 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">Average/Month</p>
                  <p className="text-lg font-bold text-gray-900">₹{avgRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )

      case "enrollments":
        return (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent, value }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} enrollments`, name]} />
              </PieChart>
            </ResponsiveContainer>

            {/* Color Reference Guide - Instructor Specific */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">My Courses Color Reference</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: "#8884d8" }}></div>
                  <span className="text-gray-700">My Course 1</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: "#82ca9d" }}></div>
                  <span className="text-gray-700">My Course 2</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: "#ffc658" }}></div>
                  <span className="text-gray-700">My Course 3</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: "#ff7300" }}></div>
                  <span className="text-gray-700">My Course 4</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: "#00ff00" }}></div>
                  <span className="text-gray-700">Other Courses</span>
                </div>
              </div>
            </div>

            {/* Legend with detailed information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <h4 className="text-sm font-semibold text-gray-900 mb-2 col-span-full">My Enrollment Summary</h4>
              {chartData.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-gray-700">{entry.name}</span>
                  <span className="text-gray-900 font-semibold">{entry.value} enrollments</span>
                  <span className="text-gray-500">({((entry.value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(0)}%)</span>
                </div>
              ))}
            </div>
          </div>
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
              <Bar dataKey="enrollments" fill="#8884d8" />
              <Bar dataKey="revenue" fill="#82ca9d" />
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
        return "My Revenue Trends"
      case "enrollments":
        return "My Course Enrollments"
      case "detailed":
        return "My Detailed Analytics"
      default:
        return "My Analytics"
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
