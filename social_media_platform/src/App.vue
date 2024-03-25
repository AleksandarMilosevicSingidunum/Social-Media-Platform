<script setup lang="ts">
import { RouterView } from 'vue-router';
import Navbar from './components/Navbar.vue';

const year = new Date().getFullYear();
</script>

<template>
    <div class="container">
      <Navbar />
      <RouterView :key="$route.fullPath" />
    </div>
    <footer class="text-center mt-3 mb-3">
      &copy; {{ year }} Singidunum Universty - SDE
    </footer>
</template>
