"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { MessageCircle, ThumbsUp, Reply, Send, Search, Clock, Pin, Award } from "lucide-react"
import { fetchForumPosts, addComment, likePost } from "../store/slices/forumSlice"

const ForumPage = () => {
  const { courseId } = useParams()
  const dispatch = useDispatch()
  const { posts, isLoading, isPosting, error } = useSelector((state) => state.forum)
  const { user } = useSelector((state) => state.auth)

  const [newPostContent, setNewPostContent] = useState("")
  const [replyContent, setReplyContent] = useState({})
  const [showReplyForm, setShowReplyForm] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [filterBy, setFilterBy] = useState("all")

  useEffect(() => {
    if (courseId) {
      dispatch(fetchForumPosts(courseId))
    }
  }, [dispatch, courseId])

  const handleSubmitPost = async (e) => {
    e.preventDefault()
    if (!newPostContent.trim()) return

    try {
      await dispatch(
        addComment({
          courseId,
          content: newPostContent,
          parentId: null,
        }),
      ).unwrap()
      setNewPostContent("")
    } catch (error) {
      console.error("Failed to post:", error)
    }
  }

  const handleSubmitReply = async (parentId) => {
    const content = replyContent[parentId]
    if (!content?.trim()) return

    try {
      await dispatch(
        addComment({
          courseId,
          content,
          parentId,
        }),
      ).unwrap()
      setReplyContent((prev) => ({ ...prev, [parentId]: "" }))
      setShowReplyForm((prev) => ({ ...prev, [parentId]: false }))
    } catch (error) {
      console.error("Failed to reply:", error)
    }
  }

  const handleLike = (postId) => {
    dispatch(likePost(postId))
  }

  const toggleReplyForm = (postId) => {
    setShowReplyForm((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }))
  }

  const filteredAndSortedPosts = posts
    .filter((post) => {
      if (searchTerm) {
        return (
          post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.author.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      return true
    })
    .filter((post) => {
      if (filterBy === "instructor") return post.author.role === "instructor"
      if (filterBy === "student") return post.author.role === "student"
      if (filterBy === "pinned") return post.isPinned
      return true
    })
    .sort((a, b) => {
      if (sortBy === "recent") return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt)
      if (sortBy === "popular") return b.likes - a.likes
      if (sortBy === "replies") return b.replies.length - a.replies.length
      return 0
    })

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) return "just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  const PostComponent = ({ post, isReply = false }) => (
    <div className={`bg-white rounded-lg shadow-sm border ${isReply ? "ml-8 mt-4" : "mb-6"}`}>
      {post.isPinned && !isReply && (
        <div className="flex items-center px-6 py-2 border-b border-yellow-200 bg-yellow-50">
          <Pin className="w-4 h-4 mr-2 text-yellow-600" />
          <span className="text-sm font-medium text-yellow-800">Pinned Post</span>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start space-x-4">
          <img
            src={post.author.avatar || "/placeholder.svg?height=40&width=40"}
            alt={post.author.name}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <div className="flex items-center mb-2 space-x-2">
              <h4 className="font-semibold text-gray-900">{post.author.name}</h4>
              {post.author.role === "instructor" && (
                <span className="flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                  <Award className="w-3 h-3 mr-1" />
                  Instructor
                </span>
              )}
              <span className="flex items-center text-sm text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                {formatTimeAgo(post.createdAt)}
              </span>
            </div>

            <div className="mb-4 prose-sm prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
            </div>

            <div className="flex items-center space-x-6">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center space-x-1 text-sm transition-colors ${
                  post.isLiked ? "text-blue-600" : "text-gray-500 hover:text-blue-600"
                }`}
              >
                <ThumbsUp className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`} />
                <span>{post.likes}</span>
              </button>

              {!isReply && (
                <button
                  onClick={() => toggleReplyForm(post.id)}
                  className="flex items-center space-x-1 text-sm text-gray-500 transition-colors hover:text-blue-600"
                >
                  <Reply className="w-4 h-4" />
                  <span>Reply</span>
                </button>
              )}

              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <MessageCircle className="w-4 h-4" />
                <span>{post.replies?.length || 0} replies</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reply Form */}
        {showReplyForm[post.id] && (
          <div className="mt-4 ml-14">
            <div className="flex space-x-3">
              <img
                src={user?.avatar || "/placeholder.svg?height=32&width=32"}
                alt={user?.name}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <textarea
                  value={replyContent[post.id] || ""}
                  onChange={(e) =>
                    setReplyContent((prev) => ({
                      ...prev,
                      [post.id]: e.target.value,
                    }))
                  }
                  placeholder="Write a reply..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
                <div className="flex justify-end mt-2 space-x-2">
                  <button
                    onClick={() => toggleReplyForm(post.id)}
                    className="px-4 py-2 text-sm text-gray-600 transition-colors hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSubmitReply(post.id)}
                    disabled={isPosting || !replyContent[post.id]?.trim()}
                    className="flex items-center px-4 py-2 text-sm text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Replies */}
      {post.replies && post.replies.length > 0 && (
        <div className="border-t border-gray-200">
          {post.replies.map((reply) => (
            <PostComponent key={reply.id} post={reply} isReply={true} />
          ))}
        </div>
      )}
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 bg-gray-50">
        <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
          <div className="space-y-6 animate-pulse">
            <div className="w-1/4 h-8 bg-gray-300 rounded"></div>
            <div className="h-32 bg-gray-300 rounded"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Course Discussion</h1>
          <p className="text-gray-600">Ask questions, share insights, and connect with fellow learners</p>
        </div>

        {/* Search and Filters */}
        <div className="p-6 mb-6 bg-white rounded-lg shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Liked</option>
                <option value="replies">Most Replies</option>
              </select>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Posts</option>
                <option value="instructor">Instructor Posts</option>
                <option value="student">Student Posts</option>
                <option value="pinned">Pinned Posts</option>
              </select>
            </div>
          </div>
        </div>

        {/* New Post Form */}
        <div className="p-6 mb-6 bg-white rounded-lg shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Start a new discussion</h2>
          <form onSubmit={handleSubmitPost}>
            <div className="flex space-x-4">
              <img
                src={user?.avatar || "/placeholder.svg?height=40&width=40"}
                alt={user?.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Ask a question or share your thoughts..."
                  className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
                <div className="flex justify-end mt-3">
                  <button
                    type="submit"
                    disabled={isPosting || !newPostContent.trim()}
                    className="flex items-center px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPosting ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Post
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 mb-6 border border-red-200 rounded-lg bg-red-50">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Posts */}
        <div>
          {filteredAndSortedPosts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-lg shadow-sm">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">No discussions yet</h3>
              <p className="text-gray-600">Be the first to start a conversation!</p>
            </div>
          ) : (
            filteredAndSortedPosts.map((post) => <PostComponent key={post.id} post={post} />)
          )}
        </div>
      </div>
    </div>
  )
}

export default ForumPage
