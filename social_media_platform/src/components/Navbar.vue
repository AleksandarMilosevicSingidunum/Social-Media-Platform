<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { UserService } from '../services/user.service';
import { SessionManager } from '../utils/session.manager';
import { useLogout } from '../utils/logout.hook';
import NavbarRouteVue from './NavbarRoute.vue';

const username = ref('');
const userId = ref(null); // Initialize userId as null
const router = useRouter();



// Fetch user profile data and set the username and userId
const fetchUserProfile = async () => {
  if (!SessionManager.hasAuth()) {
    return;
  }
  try {
    const response = await UserService.getUserProfile();
    username.value = response.data.username;
    userId.value = response.data.id; // Set the userId from the response
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
};

// Call the function when the component is mounted
onMounted(fetchUserProfile);

function goToLogin() {
  router.push('/login');
}

// Import and use useLogout within the setup function
const logout = useLogout();
</script>

<template>
  <nav class="navbar navbar-expand-lg">
    <!-- Navbar content -->
    <ul class="navbar-nav">
      <li class="nav-item">
        <router-link to="/" class="nav-link">Home</router-link>
      </li>
    </ul>
    <ul class="navbar-nav ms-auto">
      <li class="nav-item" v-if="!SessionManager.hasAuth()">
        <button class="btn btn-primary me-2" @click="goToLogin">Login</button>
      </li>
      <li class="nav-item dropdown" v-if="SessionManager.hasAuth()">
        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown"
          aria-expanded="false">
          <img :src="`https://localhost:3000/api/users/profile-image/${username}`" alt="Profile"
            class="profile-img rounded-circle">
        </a>
        <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
          <!-- Pass the userId to the profile route -->
          <li><router-link :to="`/profile/${userId}`" class="dropdown-item">View Profile</router-link></li>
          <li><router-link :to="`/edit-profile/${userId}`" class="dropdown-item">Edit Profile</router-link></li>
          <li>
            <hr class="dropdown-divider">
          </li>
          <li><a class="dropdown-item" href="#" @click="logout">Logout</a></li>
        </ul>
      </li>
    </ul>
    

  </nav>
</template>

<style>
.profile-img {
  width: 40px;
  height: 40px;
}
</style>
