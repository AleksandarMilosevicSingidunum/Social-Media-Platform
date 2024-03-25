<script>
import router from "@/router";
import { UserService } from "../services/user.service";

export default {
  data() {
    return {
      user: null,
    };
  },
  async created() {
    await this.fetchUserData();
  },
  methods: {
    // Fetch user data
    async fetchUserData() {
      try {
        const userId = this.$route.params.id;
        const response = await UserService.getUserById(userId);
        this.user = response.data;
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    },
    async updateProfile() {
      try {
        await UserService.updateUser(this.user);
        router.push({ path: `/profile/${this.user.id}` });
      } catch (error) {
        console.error("Error updating profile:", error);
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
  <div class="edit-profile-view">
    <h2>Edit Profile</h2>
    <div v-if="user">
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label for="username">Username:</label>
            <input type="text" class="form-control" id="username" v-model="user.username" disabled>
          </div>
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" class="form-control" id="email" v-model="user.email">
          </div>
          <div class="form-group">
            <label for="joinDate">Join Date:</label>
            <input type="text" class="form-control" id="joinDate" :value="formatDate(user.joinDate)" disabled>
          </div>
          <div class="form-group">
            <label for="bio">Bio:</label>
            <textarea class="form-control" id="bio" rows="4" v-model="user.bio"></textarea>
          </div>
          <button @click="updateProfile" class="btn btn-primary">Update Profile</button>
        </div>
        <div class="col-md-6">
          <img :src="`https://localhost:3000/api/users/profile-image/${user.username}`" alt="Profile Image" class="profile-image">
        </div>
      </div>
    </div>
    <div v-else>
      <p>No user information available</p>
    </div>
  </div>
</template>


<style scoped>
.edit-profile-view {
  padding: 20px;
}

.profile-image {
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 50%;
  margin-top: 20px;
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
  margin-top: 20px;
}

.btn-primary:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}
</style>
