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
      const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? "http://localhost:2000/api" : "https://online.rymaacademy.cloud/api")
      const response = await fetch(`${API_BASE_URL}/admin/reports/${type}`, {
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
      console.error("Error fetching chart data:", error)
      // Show empty state instead of mock data
      setChartData([])
    } finally {
      setIsLoading(false)
    }
  }

  // Add fallback colors for data without color property
  // Color Reference Guide:
  // Programming: #8884d8 (Blue), Design: #82ca9d (Green), Marketing: #ffc658 (Yellow)
  // Business: #ff7300 (Orange), Creative: #00ff00 (Light Green), Technology: #ff0000 (Red)
  // Health: #0000ff (Dark Blue), Language: #ff00ff (Magenta), Other: #ffa500 (Orange)
  const addFallbackColors = (data) => {
    const colorMap = {
      "Programming": "#8884d8",
      "Design": "#82ca9d",
      "Marketing": "#ffc658",
      "Business": "#ff7300",
      "Creative": "#00ff00",
      "Technology": "#ff0000",
      "Health": "#0000ff",
      "Language": "#ff00ff",
      "Other": "#ffa500"
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
    // Show empty state if no data
    if (!chartData || chartData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-500 text-center max-w-sm">
            {type === "revenue" && "Revenue data will appear here once payments are processed."}
            {type === "enrollments" && "Enrollment data will appear here once students enroll in courses."}
            {type === "detailed" && "Detailed analytics will appear here once there's activity on the platform."}
          </p>
        </div>
      )
    }

    switch (type) {
      case "revenue": {
        // Map month names to values for easy lookup
        const monthNames = {
          "January": 1, "February": 2, "March": 3, "April": 4,
          "May": 5, "June": 6, "July": 7, "August": 8,
          "September": 9, "October": 10, "November": 11, "December": 12
        }

        // Sort data by year and month
        const sortedData = [...chartData].sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year
          return monthNames[a.month] - monthNames[b.month]
        })
        
        const totalRevenue = sortedData.reduce((sum, item) => sum + item.revenue, 0)
        const avgRevenue = totalRevenue / sortedData.length
        const maxRevenue = Math.max(...sortedData.map(item => item.revenue))
        const minRevenue = Math.min(...sortedData.map(item => item.revenue))
        const maxMonth = sortedData.find(item => item.revenue === maxRevenue)?.month

        return (
          <div className="space-y-6">
            {/* Modern Card Design */}
            <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Total Revenue Card */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
                <div className="flex-col items-center justify-between ">
                <div>
                    <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
                    <p className="sm:text-xl text-sm font-bold">₹{totalRevenue.toLocaleString()}</p>
                    </div>
                </div>
              </div>

              {/* Average Revenue Card */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Average Revenue</p>
                    <p className="sm:text-xl text-sm font-bold">₹{avgRevenue.toLocaleString()}</p>
                  </div>
                 
                </div>
              </div>

              {/* Growth Rate Card */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Growth Rate</p>
                    <p className="sm:text-xl text-sm font-bold">
                      {chartData.length > 1 ?
                        ((chartData[chartData.length - 1].revenue - chartData[0].revenue) / chartData[0].revenue * 100).toFixed(1) + '%'
                        : '0%'
                      }
                    </p>
                  </div>
                  
                </div>
              </div>
            </div>

            {/* Monthly Performance Cards */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4  pt-2">
              {chartData.map((item, index) => {
                const prevItem = chartData[index - 1]
                const change = prevItem ? item.revenue - prevItem.revenue : 0
                const changePercent = prevItem ? ((change / prevItem.revenue) * 100).toFixed(1) : '0.0'
                const isIncrease = change > 0
                const isHighest = item.revenue === maxRevenue
                const isLowest = item.revenue === minRevenue

                return (
                  <div key={index} className={`relative rounded-xl px-6 py-4 shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
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
                        <p className="text-sm text-gray-600">Revenue</p>
                        <p className="text-xl font-bold text-gray-900">₹{item.revenue.toLocaleString()}</p>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Performance</span>
                          <span className="font-sm">{Math.round((item.revenue / maxRevenue) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2  rounded-full transition-all duration-500 ${
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

            {/* Summary Statistics */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Performance Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center flex sm:flex-col gap-8 sm:gap-0">
                  <div className="bg-green-100 rounded-lg p-2 inline-block">
                    <svg className="w-10 h-10 text-green-600 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div className="sm:ps-10 pt-1">
                  <p className="text-sm text-gray-600">Best Month</p>
                  <p className="text-lg font-bold text-gray-800">{maxMonth} ₹{maxRevenue.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-center flex sm:flex-col gap-8 sm:gap-0">
                  <div className="bg-blue-100 rounded-lg p-2 inline-block">
                    <svg className="w-10 h-10 text-blue-600 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div className="sm:ps-10 pt-1">
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-lg font-bold text-gray-800">₹{totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-center flex sm:flex-col gap-8 sm:gap-0">
                  <div className="bg-orange-100 rounded-lg p-2 inline-block">
                    <svg className="w-10 h-10 text-orange-600 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div className="sm:ps-10 pt-1">
                  <p className="text-sm text-gray-600">Average/Month</p>
                  <p className="text-lg font-bold text-gray-900">₹{avgRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }

      case "enrollments": {
        return (
          <div className="space-y-4 ">
          <div className="border border-gray-300">
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
            </div>

            {/* Color Reference Guide */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Category Color Reference</h4>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                <div className="flex items-center  space-x-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: "#8884d8" }}></div>
                  <span className="text-sm text-gray-800">Programming</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: "#82ca9d" }}></div>
                  <span className=" text-sm text-gray-800">Design</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: "#ffc658" }}></div>
                  <span className="text-sm text-gray-800">Marketing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: "#ff7300" }}></div>
                  <span className="text-sm text-gray-800">Business</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: "#00ff00" }}></div>
                  <span className="text-sm text-gray-800">Creative</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: "#ff0000" }}></div>
                  <span className="text-sm text-gray-800">Technology</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: "#0000ff" }}></div>
                  <span className="text-sm text-gray-800">Health</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: "#ff00ff" }}></div>
                  <span className="text-sm text-gray-800">Language</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: "#ffa500" }}></div>
                  <span className="text-sm text-gray-800">Other</span>
                </div>
              </div>
            </div>

            {/* Legend with detailed information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ">
              <h4 className="text-md font-semibold text-gray-900  mb-2 col-span-full">Enrollment Summary</h4>
              {chartData.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-gray-700 text-sm">{entry.name}</span>
                  <span className="text-gray-900 font-semibold text-sm">{entry.value} enrollments</span>
                  <span className="text-gray-500 text-sm">({((entry.value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(0)}%)</span>
                </div>
              ))}
            </div>
          </div>
        )
      }

      case "detailed": {
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
      }

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
