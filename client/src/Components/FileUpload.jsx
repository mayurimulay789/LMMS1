"use client"

import { useState, useRef } from "react"
import { Upload, File, ImageIcon, Video, FileText } from "lucide-react"
import { useSelector } from "react-redux"

const FileUpload = ({
  onUpload,
  acceptedTypes = "image/*,video/*,.pdf,.doc,.docx",
  maxSize = 50, // MB
  multiple = false,
  uploadType = "general",
  className = "",
}) => {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)
  const { token } = useSelector((state) => state.auth)

  const getUploadEndpoint = (type) => {
    const endpoints = {
      thumbnail: "/api/upload/course-thumbnail",
      video: "/api/upload/lesson-video",
      document: "/api/upload/course-material",
      avatar: "/api/upload/avatar",
      chat: "/api/upload/chat-file",
      gallery: "/api/upload/course-gallery",
    }
    return endpoints[type] || "/api/upload/course-material"
  }

  const getFileIcon = (fileType) => {
    if (fileType.startsWith("image/")) return <ImageIcon className="h-8 w-8 text-blue-500" />
    if (fileType.startsWith("video/")) return <Video className="h-8 w-8 text-purple-500" />
    if (fileType.includes("pdf")) return <FileText className="h-8 w-8 text-red-500" />
    return <File className="h-8 w-8 text-gray-500" />
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const validateFile = (file) => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      throw new Error(`File size must be less than ${maxSize}MB`)
    }

    // Check file type
    const acceptedTypesArray = acceptedTypes.split(",").map((type) => type.trim())
    const isValidType = acceptedTypesArray.some((type) => {
      if (type.startsWith(".")) {
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      }
      return file.type.match(type.replace("*", ".*"))
    })

    if (!isValidType) {
      throw new Error("File type not supported")
    }

    return true
  }

  const uploadFile = async (file) => {
    try {
      validateFile(file)

      const formData = new FormData()
      const fieldName = multiple ? "images" : getFieldName(uploadType)
      formData.append(fieldName, file)

      const xhr = new XMLHttpRequest()

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100)
            setUploadProgress(progress)
          }
        })

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText)
            resolve(response)
          } else {
            reject(new Error("Upload failed"))
          }
        })

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"))
        })

        xhr.open(
          "POST",
          `${process.env.REACT_APP_SERVER_URL || "http://localhost:5000"}${getUploadEndpoint(uploadType)}`,
        )
        xhr.setRequestHeader("Authorization", `Bearer ${token}`)
        xhr.send(formData)
      })
    } catch (error) {
      throw error
    }
  }

  const getFieldName = (type) => {
    const fieldNames = {
      thumbnail: "thumbnail",
      video: "video",
      document: "document",
      avatar: "avatar",
      chat: "file",
    }
    return fieldNames[type] || "file"
  }

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    try {
      if (multiple) {
        const uploadPromises = Array.from(files).map((file) => uploadFile(file))
        const results = await Promise.all(uploadPromises)
        onUpload(results.map((result) => result.data))
      } else {
        const result = await uploadFile(files[0])
        onUpload(result.data)
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert(error.message || "Upload failed")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptedTypes}
        onChange={handleChange}
        className="hidden"
      />

      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
          ${uploading ? "pointer-events-none opacity-50" : ""}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        {uploading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-900">
                {dragActive ? "Drop files here" : "Click to upload or drag and drop"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {acceptedTypes.includes("image") && "Images, "}
                {acceptedTypes.includes("video") && "Videos, "}
                {acceptedTypes.includes("pdf") && "PDFs, "}
                Documents up to {maxSize}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* File Preview */}
      <div className="mt-4 space-y-2">{/* This would show uploaded files - implement based on your needs */}</div>
    </div>
  )
}

export default FileUpload
