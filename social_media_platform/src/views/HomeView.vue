<script>
import PostItem from '../components/PostItem.vue';
import CreatePost from '../components/CreatePost.vue';
import { PostService } from "../services/post.service";
import { UserService } from "../services/user.service";
import { SessionManager } from '@/utils/session.manager';

export default {
  name: 'HomeView',
  components: {
    CreatePost,
    PostItem
  },
  data() {
    return {
      searchQuery: '',
      followedUsers: [],
      users: [],
      posts: [],
      batchSize: 5,
      currentBatchIndex: 0
    };
  },
  methods: {
    async fetchPosts() {
      try {
        const response = await PostService.getAllPosts();
        this.posts = response.data.reverse();

      } catch (error) {
        console.error('Error fetching posts:', error.message);
      }
    },
    async fetchUsers() {
      try {
        if (!SessionManager.hasAuth()) {
          return;
        }
        const user = await UserService.getUserProfile();
        const userId = user.data.id;
        const followedUsersResponse = await UserService.getFollowedUsers(userId);
        this.followedUsers = followedUsersResponse.data;
      } catch (error) {
        console.error('Error fetching users:', error.message);
      }
    },
    loadMorePosts() {
      this.currentBatchIndex++;
      this.fetchPosts();
    },
    async search() {
      if (!SessionManager.hasAuth()) {
        return;
      }
      try {
        const allUsersResponse = await UserService.getAllUsers();
        const allUsers = allUsersResponse.data;

        this.users = allUsers.filter(user => user.username.toLowerCase().startsWith(this.searchQuery.toLowerCase()));
      } catch (error) {
        console.error('Error fetching users:', error.message);
      }
    },
  },
  created() {
    this.fetchPosts();
    this.fetchUsers();
  },
};
</script>

<template>
  <div class="home-view">
    <div class="people-you-follow">
      <h2>People You Follow</h2>
      <a v-for="user in followedUsers" :key="user.id" :href="`/profile/${user.id}`" class="user">
        <img :src="`https://localhost:3000/api/users/profile-image/${user.username}`" :alt="user.username" class="avatar">
        <span>{{ user.username }}</span>
      </a>
    </div>

    <CreatePost />

    <div class="search">
      <input class="inputSearch" type="text" v-model="searchQuery" placeholder="Search..." @input="search">

      <div v-if="searchQuery.length > 0" class="filtered-users">
        <div v-if="users.length === 0" class="no-results">No results found.</div>
        <a v-else class="user" v-for="user in users" :key="user.id" :href="`/profile/${user.id}`">
          <img :src="`https://localhost:3000/api/users/profile-image/${user.username}`" :alt="user.username" class="avatar">
          <span>{{ user.username }}</span>
        </a>
      </div>
    </div>

    <div class="posts">
      <h2>Posts</h2>
      <PostItem v-for="post in posts" :key="post.id" :post="post" />
    </div>
  </div>
</template>


<style scoped>
.home-view {
  display: grid;
  grid-template-columns: 25% 50% 25%;
  grid-template-rows: auto;
  gap: 20px;
  position: relative;
  /* Set the position to relative */
}

.people-you-follow {
  grid-column: 1;
  position: sticky;
  /* Set the position to sticky */
  top: 10px;
  /* Stick to the top with some padding */
  overflow-y: auto;
  /* Add vertical scrollbar if needed */
  max-height: calc(100vh - 20px);
  /* Adjust max height to fit viewport */
}

.create-post {
  grid-column: 2;
}

.search {
  grid-column: 3;
  position: sticky;
  /* Set the position to sticky */
  top: 10px;
  /* Stick to the top with some padding */
  background-color: #fff;
  /* Set a background color for visibility */
  z-index: 1;
  /* Ensure the search bar is above other content */

}
.inputSearch {
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border: 2px solid #ccc;
  margin-bottom: 10px;
  
}

.posts {
  grid-column: 2;
  width: 70%;
  margin: 0 auto;
}

.user {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  text-decoration: none;
  /* Remove underline */
  color: #000;
  /* Set text color to black */
  padding-top: 10px;
}

.user:hover {
  text-decoration: underline;
  /* Add underline on hover */
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}

.image-upload {
  margin-bottom: 10px;
}

.upload-label {
  cursor: pointer;
  display: inline-block;
  padding: 8px 15px;
  background-color: #007bff;
  color: #fff;
  border-radius: 5px;
}

.image-preview img {
  max-width: 100%;
  margin-top: 10px;
}

.image-preview button {
  margin-top: 5px;
  background-color: #dc3545;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
}

.create-post-btn {
  background-color: #28a745;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
}

.create-post-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
