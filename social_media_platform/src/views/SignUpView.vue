<script setup lang="ts">
import { UserService } from '@/services/user.service';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const profileImage = ref(null);
const bio = ref('');
const router = useRouter();

async function signUp() {
  try {
    if (password.value !== confirmPassword.value) {
      alert('Passwords do not match. Please try again.');
      return;
    }

    const data = new FormData();
    data.append('username', username.value);
    data.append('email', email.value);
    data.append('password', password.value);
    data.append('profileImage', profileImage.value); 
    data.append('bio', bio.value);

    console.log('Sign up data:', data);

    //printing all data
    for (var pair of (data as any).entries()) {
      console.log(pair[0] + ', ' + pair[1]);
    }
    const response = await UserService.signup(data);
    if (response.status === 200 || response.status === 201) {
      console.log('Sign up successful:', response);
      UserService.login(String(email.value), String(password.value));
      router.push({ path: '/' });
    } else {
      console.error('Sign up failed:', response);
      alert('Sign up failed. Please try again.');
    }
  } catch (error) {
    console.error('Sign up failed:', error);
    alert('Sign up failed. Please try again.');
  }
}

function onFileChange(event: any) {
  const file = event.target.files[0];
  if (file) {
    profileImage.value = file;
  }
}

</script>

<style>
.form-responsive {
  width: 50%;
}

@media (max-width: 900px) {
  .form-responsive {
    width: 100%;
  }
}
</style>

<template>
  <div class="signup">
    <h1 class="h3 text-center">Create an Account</h1>
    <form class="form-responsive mx-auto" @submit.prevent="signUp">
      <div class="mb-3">
        <label for="exampleInputUsername" class="form-label">Username</label>
        <input type="text" class="form-control" id="exampleInputUsername" v-model="username">
      </div>
      <div class="mb-3">
        <label for="exampleInputEmail" class="form-label">Email address</label>
        <input type="email" class="form-control" id="exampleInputEmail" aria-describedby="emailHelp" v-model="email">
        <div id="emailHelp" class="form-text">We'll never share your email with anyone else.</div>
      </div>
      <div class="mb-3">
        <label for="exampleInputPassword" class="form-label">Password</label>
        <input type="password" class="form-control" id="exampleInputPassword" v-model="password">
      </div>
      <div class="mb-3">
        <label for="exampleInputConfirmPassword" class="form-label">Confirm Password</label>
        <input type="password" class="form-control" id="exampleInputConfirmPassword" v-model="confirmPassword">
      </div>
      <div class="mb-3">
        <label for="exampleInputBio" class="form-label">Bio</label>
        <textarea class="form-control" id="exampleInputBio" rows="3" v-model="bio"></textarea>
      </div>
      <div class="mb-3">
        <label for="exampleInputProfileImage" class="form-label">Profile Image</label>
        <input type="file" id="exampleInputProfileImage" @change="onFileChange($event)">
      </div>
      <button type="submit" class="btn btn-primary">Sign Up</button>
    </form>
  </div>
</template>

