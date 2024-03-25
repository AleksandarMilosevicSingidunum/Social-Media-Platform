
<script>
import { PostService } from "@/services/post.service";
import { UserService } from "../services/user.service";

export default {
  data() {
    return {
      user: null,
      isFollowing: false,
      isCurrentUser: false
    };
  },
  async created() {
    await this.fetchUserData();
  },
  methods: {
    // Fetch user data and initialize component properties
    async fetchUserData() {
      try {
        const userId = this.$route.params.id;
        const currentUser = await UserService.getUserProfile();
        const response = await UserService.getUserById(userId);

        this.user = response.data;
        this.user.posts = (await PostService.getPostByUsername(this.user.username)).data || [];
        this.user.followers = await UserService.getFollowerCount(this.user.id);
        if (currentUser.data.id === this.user.id) {
          this.isCurrentUser = true;
        } else {
          this.isFollowing = await UserService.isFollowing(currentUser.data.id, this.user.id);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    },
    // Toggle follow/unfollow for the user
    async toggleFollow() {
      try {
        const userId = this.user.id;
        const currentUser = await UserService.getUserProfile();
        if (this.isFollowing) {
          await UserService.unfollowUser(currentUser.data.id, userId);
        } else {
          await UserService.followUser(currentUser.data.id, userId);
        }
        this.isFollowing = !this.isFollowing;
      } catch (error) {
        console.error("Error toggling follow:", error);
      }
    },
    // Delete post after confirmation
    async confirmDeletePost(post) {
      const confirmation = confirm('Are you sure you want to delete this post?');
      if (confirmation) {
        await this.deletePost(post);
      }
    },
    // Delete post
    async deletePost(post) {
      try {
        console.log('Deleting post:', post.id);
        console.log('userId' , this.user.id);
        const response =  await PostService.deletePost( post.id,this.user.id);
        if (response.status === 200) {
          console.log('Post deleted successfully');
          window.location.reload();
        }

      } catch (error) {
        console.error("Error deleting post:", error);
      }
    },
    // Toggle display of comments for a post
    async toggleComments(post) {
      try {
        if (!post.comments) {
          // Fetch comments for the post if not already fetched
          const response = await PostService.getComments(post.id);
          if (response.status === 200) {
            post.comments = response.data;
          }
        }
        post.showComments = !post.showComments;
      } catch (error) {
        console.error("Error toggling comments:", error);
      }
    },
    // Format date string into localized date format
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    }
  }
};
</script>

<template>
  <div class="profile-view">
    <h2>Profile</h2>
    <div v-if="user">
      <div class="row">
        <div class="col-md-3">
          <div class="profile-image-container">
            <img :src="`https://localhost:3000/api/users/profile-image/${user.username}`" :alt="user.username"
              class="profile-image img-fluid rounded-circle">
          </div>
        </div>
        <div class="col-md-9">
          <div>
            <p><strong>Username:</strong> {{ user.username }}</p>
            <p><strong>Email:</strong> {{ user.email }}</p>
            <p><strong>Number of Posts:</strong> {{ user.posts ? user.posts.length : 0 }}</p>
            <p><strong>Followers:</strong> {{ user.followers }}</p>
            <p><strong>Join Date:</strong> {{ formatDate(user.joinDate) }}</p>
            <p><strong>Bio:</strong> {{ user.bio }}</p>
            <button v-if="!isCurrentUser" @click="toggleFollow" class="btn btn-primary">{{ isFollowing ? 'Unfollow' : 'Follow' }}</button>
          </div>
        </div>
      </div>
      <div class="user-posts mt-4">
        <h3>Posts by {{ user.username }}</h3>
        <div class="row">
          <div v-for="post in user.posts" :key="post.id" class="col-md-2 mb-4">
            <div class="card">
              <img v-if="post.image" :src="`https://localhost:3000/api/posts/post_image/${post.image}`" :alt="'Image for post ' + post.id" class="card-img-top">
              <div class="card-body">
                <p class="card-text">{{ post.content }}</p>
                <button v-if="isCurrentUser" @click="confirmDeletePost(post)" class="btn btn-danger">Delete</button>
              </div>
              <div class="card-footer">
                <button @click="toggleComments(post)" class="btn btn-primary">{{ post.showComments ? 'Hide Comments' : 'Show Comments' }}</button>
              </div>
              <div v-if="post.showComments" class="card-body">
                <h5>Comments</h5>
                <ul>
                  <li v-for="comment in post.comments" :key="comment.id">{{ comment.content }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <p>No user information available</p>
    </div>
  </div>
</template>



<style scoped>
.profile-view {
  padding: 20px;
}

.profile-image-container {
  width: 90%; 
  height: 60%;
  overflow: hidden;
  border-radius: 50%; 
  background-color: #ccc; 
}

.profile-image {
  width: 100%;
  height: 100%;
}

.user-posts {
  margin-top: 20px;
}

.card {
  height: 100%;
}

.card-img-top {
  max-height: 150px;
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
