import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Edit2, Save, X, Globe, Camera, Upload } from "lucide-react"
import { updateProfile, clearProfileError, clearProfileSuccess } from "../store/slices/profileSlice"
import { uploadAvatar } from "../store/slices/authSlice"

const ProfileForm = ({ user, onCancel, onSave, startEditing = false }) => {

  console.log("ProfileForm rendered with user:", user);
  const dispatch = useDispatch()
  const { isLoading, error, success } = useSelector((state) => state.profile)

  const [formData, setFormData] = useState({
    bio: user?.profile?.bio || "",
    website: user?.profile?.website || "",
  })

  const [isEditing, setIsEditing] = useState(Boolean(startEditing))
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(user?.profile?.avatar || null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Upload avatar if a new one is selected
      let avatarUrl = user?.profile?.avatar
      if (avatarFile) {
        avatarUrl = await handleAvatarUpload()
        console.log("Avatar upload result URL:", avatarUrl);
        if (!avatarUrl) return // Upload failed, don't proceed
        console.log("Avatar uploaded, URL1:", avatarUrl);
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

        // Append cache-buster to force browser to fetch the updated image.
        if (avatarUrl) {
          const sep = avatarUrl.includes('?') ? '&' : '?'
          setAvatarPreview(`${avatarUrl}${sep}t=${Date.now()}`)
        } else {
          setAvatarPreview(avatarUrl)
        }
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
      bio: user ?.profile?.bio || "",
      website: user?.profile?.website || "",
    })
    setAvatarFile(null)
    setAvatarPreview(user?.profile?.avatar || null)
    setIsEditing(false)
    onCancel()
    dispatch(clearProfileError())
  }

  // Avoid dispatching actions during render — useEffect runs after render
  useEffect(() => {
    if (success) {
      dispatch(clearProfileSuccess())
    }
  }, [success, dispatch])

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-800"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center space-x-1 text-sm text-green-600 hover:text-green-800 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? "Saving..." : "Save"}</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 mb-4 border border-red-200 rounded-md bg-red-50">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar Upload Field */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Profile Picture
          </label>
          <div className="flex items-center space-x-4">
            {/* Avatar Display/Preview */}
            <div className="relative">
              <div className="flex items-center justify-center w-20 h-20 overflow-hidden bg-gray-100 border-2 border-gray-300 rounded-full">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <Camera className="w-8 h-8 text-gray-400" />
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
                    className="absolute bottom-0 right-0 flex items-center justify-center p-1 text-white transition-colors bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700"
                  >
                    <Upload className="w-3 h-3" />
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
          <label className="block mb-1 text-sm font-medium text-gray-700">
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
          <label className="block mb-1 text-sm font-medium text-gray-700">
            <Globe className="inline w-4 h-4 mr-1" />
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
            <p className="p-3 text-gray-600 rounded-md bg-gray-50">
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

        {/* Social Links removed per request */}
      </form>
    </div>
  )
}

export default ProfileForm
