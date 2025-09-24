import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Edit2, Save, X, Globe, Linkedin, Twitter, Github, Camera, Upload } from "lucide-react"
import { updateProfile, clearProfileError, clearProfileSuccess } from "../store/slices/profileSlice"
import { uploadAvatar } from "../store/slices/authSlice"

const ProfileForm = ({ user, onCancel, onSave }) => {
  const dispatch = useDispatch()
  const { isLoading, error, success } = useSelector((state) => state.profile)

  const [formData, setFormData] = useState({
    bio: user?.profile?.bio || "",
    website: user?.profile?.website || "",
    social: {
      linkedin: user?.profile?.social?.linkedin || "",
      twitter: user?.profile?.social?.twitter || "",
      github: user?.profile?.social?.github || "",
    },
  })

  const [isEditing, setIsEditing] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(user?.profile?.avatar || null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const handleInputChange = (field, value) => {
    if (field.startsWith("social.")) {
      const socialField = field.split(".")[1]
      setFormData(prev => ({
        ...prev,
        social: {
          ...prev.social,
          [socialField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Upload avatar if a new one is selected
      let avatarUrl = user?.profile?.avatar
      if (avatarFile) {
        avatarUrl = await handleAvatarUpload()
        if (!avatarUrl) return // Upload failed, don't proceed
      }

      // Prepare update data
      const updateData = {
        ...formData,
        avatar: avatarUrl
      }

      const result = await dispatch(updateProfile(updateData)).unwrap()
      if (result.user) {
        onSave(result.user)
        setIsEditing(false)
        setAvatarFile(null)
        setAvatarPreview(avatarUrl)
      }
    } catch (error) {
      console.error("Profile update failed:", error)
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setAvatarPreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) return null

    setIsUploadingAvatar(true)
    try {
      const result = await dispatch(uploadAvatar(avatarFile)).unwrap()
      setAvatarFile(null)
      return result.data.url
    } catch (error) {
      console.error("Avatar upload failed:", error)
      alert("Failed to upload avatar: " + error)
      return null
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      bio: user?.profile?.bio || "",
      website: user?.profile?.website || "",
      social: {
        linkedin: user?.profile?.social?.linkedin || "",
        twitter: user?.profile?.social?.twitter || "",
        github: user?.profile?.social?.github || "",
      },
    })
    setAvatarFile(null)
    setAvatarPreview(user?.profile?.avatar || null)
    setIsEditing(false)
    onCancel()
    dispatch(clearProfileError())
  }

  if (success) {
    dispatch(clearProfileSuccess())
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 text-sm"
          >
            <Edit2 className="h-4 w-4" />
            <span>Edit</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="text-green-600 hover:text-green-800 flex items-center space-x-1 text-sm disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isLoading ? "Saving..." : "Save"}</span>
            </button>
            <button
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-800 flex items-center space-x-1 text-sm"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar Upload Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture
          </label>
          <div className="flex items-center space-x-4">
            {/* Avatar Display/Preview */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-2 border-gray-300 overflow-hidden bg-gray-100 flex items-center justify-center">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="h-8 w-8 text-gray-400" />
                )}
              </div>
              {isEditing && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    id="avatar-upload"
                    disabled={isUploadingAvatar}
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Upload className="h-3 w-3" />
                  </label>
                </>
              )}
            </div>

            {/* Upload Status */}
            {isUploadingAvatar && (
              <div className="text-sm text-blue-600">
                Uploading avatar...
              </div>
            )}

            {avatarFile && !isUploadingAvatar && (
              <div className="text-sm text-green-600">
                New avatar selected: {avatarFile.name}
              </div>
            )}
          </div>
        </div>

        {/* Bio Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          {isEditing ? (
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tell us about yourself..."
            />
          ) : (
            <p className="text-gray-600 bg-gray-50 p-3 rounded-md min-h-[80px]">
              {formData.bio || "No bio added yet. Click edit to add your bio."}
            </p>
          )}
        </div>

        {/* Website Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Globe className="h-4 w-4 inline mr-1" />
            Website
          </label>
          {isEditing ? (
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://yourwebsite.com"
            />
          ) : (
            <p className="text-gray-600 bg-gray-50 p-3 rounded-md">
              {formData.website ? (
                <a
                  href={formData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  {formData.website}
                </a>
              ) : (
                "No website added yet."
              )}
            </p>
          )}
        </div>

        {/* Social Links */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Social Links
          </label>
          <div className="space-y-3">
            {/* LinkedIn */}
            <div className="flex items-center space-x-2">
              <Linkedin className="h-4 w-4 text-blue-600" />
              {isEditing ? (
                <input
                  type="url"
                  value={formData.social.linkedin}
                  onChange={(e) => handleInputChange("social.linkedin", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              ) : (
                <span className="text-gray-600">
                  {formData.social.linkedin ? (
                    <a
                      href={formData.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      LinkedIn Profile
                    </a>
                  ) : (
                    "No LinkedIn profile"
                  )}
                </span>
              )}
            </div>

            {/* Twitter */}
            <div className="flex items-center space-x-2">
              <Twitter className="h-4 w-4 text-blue-400" />
              {isEditing ? (
                <input
                  type="url"
                  value={formData.social.twitter}
                  onChange={(e) => handleInputChange("social.twitter", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://twitter.com/yourusername"
                />
              ) : (
                <span className="text-gray-600">
                  {formData.social.twitter ? (
                    <a
                      href={formData.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Twitter Profile
                    </a>
                  ) : (
                    "No Twitter profile"
                  )}
                </span>
              )}
            </div>

            {/* GitHub */}
            <div className="flex items-center space-x-2">
              <Github className="h-4 w-4 text-gray-700" />
              {isEditing ? (
                <input
                  type="url"
                  value={formData.social.github}
                  onChange={(e) => handleInputChange("social.github", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://github.com/yourusername"
                />
              ) : (
                <span className="text-gray-600">
                  {formData.social.github ? (
                    <a
                      href={formData.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      GitHub Profile
                    </a>
                  ) : (
                    "No GitHub profile"
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default ProfileForm
