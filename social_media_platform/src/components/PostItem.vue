<script>
import { PostService } from '@/services/post.service';
import { UserService } from '@/services/user.service';

export default {
  props: {
    post: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showComments: false,
      imageError: false,
      likeCount: 0,
      dislikeCount: 0,
      liked: false,
      disliked: false,
      newComment: '', // Added for comment input
      currentUser: null // Added to store current user data
    };
  },
  methods: {
    async fetchCurrentUser() {
      try {
        const response = await UserService.getUserProfile();
        this.currentUser = response.data;
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    },
    isAuthorizedToDelete(id) {
      return this.currentUser && this.currentUser.id === id;
    },
    toggleComments() {
      this.showComments = !this.showComments;
    },
    handleImageError() {
      this.imageError = true;
    },
    async likePost() {
      try {
        const user = await UserService.getUserProfile();
        const userId = user.data.id;

        const response = await PostService.likePost(this.post.id, userId);

        if (response && response.status === 200) {
          if (response.data.message === 'User has already liked this post') {
            console.warn('User has already liked this post.');
          } else {
            this.likeCount++;
            this.liked = true;
            if (this.disliked) {
              this.dislikeCount--;
              this.disliked = false;
              localStorage.removeItem(`post_${this.post.id}_disliked`);
            }
            localStorage.setItem(`post_${this.post.id}_liked`, true);
          }
        } else {
          console.error('Failed to like post:', response);
        }
      } catch (error) {
        console.error('Error liking post:', error);
      }
    },
    async dislikePost() {
      try {
        const user = await UserService.getUserProfile();
        const userId = user.data.id;

        const response = await PostService.dislikePost(this.post.id, userId);

        if (response && response.status === 200) {
          if (response.data.message === 'User has already disliked this post') {
            console.warn('User has already disliked this post.');
          } else {
            this.dislikeCount++;
            this.disliked = true;
            if (this.liked) {
              this.likeCount--;
              this.liked = false;
              localStorage.removeItem(`post_${this.post.id}_liked`);
            }
            localStorage.setItem(`post_${this.post.id}_disliked`, true);
          }
        } else {
          console.error('Failed to dislike post:', response);
        }
      } catch (error) {
        console.error('Error disliking post:', error);
      }
    },
    async confirmDeletePost() {
      const confirmation = confirm('Are you sure you want to delete this post?');
      if (confirmation) {
        await this.deletePost();
        location.reload(); // Reload the page after deleting the post
      }
    },
    async deletePost() {
      try {
        const user = await UserService.getUserProfile();
        const userId = user.data.id;
        const response = await PostService.deletePost(this.post.id, userId);
        if (response && response.status === 200) {
          this.$emit('post-deleted', this.post.id);
        } else {
          console.error('Failed to delete post:', response);
        }
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    },
    async fetchLikeDislikeCounts() {
      try {
        const responseLike = await PostService.countLikes(this.post.id);
        const responseDislike = await PostService.countDislikes(this.post.id);

        if (responseLike) {
          this.likeCount = responseLike.data.likes;
        } else {
          console.error('Failed to fetch like counts:', responseLike);
        }

        if (responseDislike) {
          this.dislikeCount = responseDislike.data.dislikes;
        } else {
          console.error('Failed to fetch dislike counts:', responseDislike);
        }
      } catch (error) {
        console.error('Error fetching like and dislike counts:', error);
      }
    },
    async fetchComments() {
      const response = await PostService.getComments(this.post.id);
      if (response && response.status === 200) {
        this.post.comments = response.data;
      } else {
        console.error('Failed to fetch comments:', response);
      }
    },
    async commentOnPost() {
      try {
        const user = await UserService.getUserProfile();
        const userId = user.data.id;
        const content = this.newComment;

        console.log("data", this.post.id, userId, content)
        const response = await PostService.commentPost(this.post.id, userId, content);

        if (response && response.status === 200) {
          this.newComment = '';
          this.fetchComments();
        } else {
          console.error('Failed to comment on post:', response);
        }
      }
      catch (error) {
        console.error('Error commenting on post:', error);
      }
    },
    async deleteComment(commentId) {
      try {
        const user = await UserService.getUserProfile();
        const userId = user.data.id;
        const response = await PostService.deleteComment(commentId, userId);
        if (response && response.status === 200) {
          this.fetchComments();
        } else {
          console.error('Failed to delete comment:', response);
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  },
  async mounted() {
    await this.fetchCurrentUser(); // Fetch current user on component mount
    this.fetchLikeDislikeCounts();
    this.fetchComments();
    const likedInStorage = localStorage.getItem(`post_${this.post.id}_liked`);
    const dislikedInStorage = localStorage.getItem(`post_${this.post.id}_disliked`);
    if (likedInStorage) {
      this.liked = true;
      this.likeCount++;
    }
    if (dislikedInStorage) {
      this.disliked = true;
      this.dislikeCount++;
    }
  }
};
</script>

<template>
  <div class="post-container" v-if="post.user">
    <!-- Post Content -->
    <div class="post-content">
      <!-- User Info -->
      <div class="user-info">
        <!-- Profile Icon and Username -->
        <div class="profile-info">
          <a :href="`/profile/${post.user.id}`" class="user-link">
            <img :src="`https://localhost:3000/api/users/profile-image/${post.user.username}`" class="user-avatar"
              alt="Profile Image">
            <span class="username">{{ post.user.username }}</span>
          </a>
        </div>
        <!-- Delete Button -->
        <button v-if="isAuthorizedToDelete(post.user.id)" class="delete-button"
          @click="confirmDeletePost">Delete</button>

      </div>
      <!-- Post Text and Image -->
      <p class="post-text">{{ post.content }}</p>
      <div class="post-image-container">
        <img v-if="!imageError && post.image" :src="`https://localhost:3000/api/posts/post_image/${post.image}`"
          class="post-image" alt="Post Image" @error="handleImageError">
      </div>
    </div>
    <!-- Post Actions and Comments -->
    <div class="post-actions">
      <!-- Like and Dislike Buttons -->
      <div class="feedback-buttons">
        <button @click="likePost" class="feedback-button" :class="{ active: liked }" :disabled="liked">Like <span
            class="count">{{ likeCount }}</span></button>
        <button @click="dislikePost" class="feedback-button" :class="{ active: disliked }" :disabled="disliked">Dislike
          <span class="count">{{ dislikeCount }}</span></button>
      </div>
      <!-- Comments -->
      <div class="comments-section">
        <!-- Comment Input -->
        <div class="comment-input">
          <input v-model="newComment" type="text" class="form-control" placeholder="Write a comment">
          <button @click="commentOnPost" class="btn btn-primary">Comment</button>
        </div>
        <!-- Comments List -->
        <div class="comments-list" v-show="showComments">
          <div v-for="comment in post.comments" :key="comment.id" class="comment">
            <p>
              <strong>
                <a :href="`/profile/${comment.user.id}`" class="user-link">{{ comment.user.username }}</a>
              </strong>
              : {{ comment.content }}
            </p>
            <button v-if="isAuthorizedToDelete(comment.user.id)" @click="deleteComment(comment.id)"
              class="delete-btn">Delete</button>
          </div>
        </div>
        <!-- Show/Hide Comments Button -->
        <button @click="toggleComments" v-if="post.comments && post.comments.length > 0" class="btn btn-primary">{{
    showComments ? 'Hide Comments' : 'Show Comments' }}</button>
      </div>
    </div>
  </div>
  <div v-else>
    <p>User information not available</p>
  </div>
</template>


<style scoped>
.post-container {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.user-link {
  text-decoration: none;
  color: black;

}

.user-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  text-decoration: none;
  /* Added to remove underline */
}

.profile-info {
  display: flex;
  align-items: center;
}

.delete-button {
  background-color: #dc3545;
  color: #fff;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}

.username {
  font-weight: bold;
}

.post-text {
  margin-bottom: 15px;
}

.post-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 300px;
  /* Fixed width */
  height: 300px;
  /* Fixed height */
  margin: 0 auto;
  /* Center horizontally */
}

.post-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
  /* Maintain aspect ratio */
}

.feedback-buttons {
  margin-bottom: 15px;
  padding-top: 10px;
}

.feedback-button {
  padding: 8px 16px;
  margin-right: 10px;
  background-color: #007bff;
  border: none;
  color: #fff;
  border-radius: 5px;
  cursor: pointer;
}

.feedback-button.active {
  background-color: #dc3545;
}

.count {
  margin-left: 5px;
}

.comment-input {
  display: flex;
  margin-bottom: 10px;
}

.delete-btn {
  background-color: #dc3545;
  color: #fff;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}

.comments-list {
  max-height: 200px;
  overflow-y: auto;
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
}

.btn-primary:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}
</style>
