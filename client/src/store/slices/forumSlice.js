import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

export const fetchForumPosts = createAsyncThunk("forum/fetchPosts", async (courseId, { getState, rejectWithValue }) => {
  try {
    const { auth } = getState()
    const response = await fetch(`/api/forum/${courseId}`, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch forum posts")
    }

    const data = await response.json()
    return data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const addComment = createAsyncThunk(
  "forum/addComment",
  async ({ courseId, content, parentId = null }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const response = await fetch(`/api/forum/${courseId}/addComment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ content, parentId }),
      })

      if (!response.ok) {
        throw new Error("Failed to add comment")
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const likePost = createAsyncThunk("forum/likePost", async (postId, { getState, rejectWithValue }) => {
  try {
    const { auth } = getState()
    const response = await fetch(`/api/forum/posts/${postId}/like`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to like post")
    }

    const data = await response.json()
    return { postId, ...data }
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

const initialState = {
  posts: [],
  isLoading: false,
  isPosting: false,
  error: null,
}

const forumSlice = createSlice({
  name: "forum",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchForumPosts.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchForumPosts.fulfilled, (state, action) => {
        state.isLoading = false
        state.posts = action.payload
      })
      .addCase(fetchForumPosts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(addComment.pending, (state) => {
        state.isPosting = true
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.isPosting = false
        state.posts.push(action.payload)
      })
      .addCase(addComment.rejected, (state, action) => {
        state.isPosting = false
        state.error = action.payload
      })
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, likes, isLiked } = action.payload
        const post = state.posts.find((p) => p.id === postId)
        if (post) {
          post.likes = likes
          post.isLiked = isLiked
        }
      })
  },
})

export const { clearError } = forumSlice.actions
export default forumSlice.reducer
