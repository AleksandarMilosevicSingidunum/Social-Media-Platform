
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { UserService } from '@/services/user.service';
import { PostService } from '@/services/post.service';

const postText = ref('');
const image = ref(null);
const imagePreview = ref(null);
const router = useRouter();

async function createPost() {
  try {
    const user = await UserService.getUserProfile();
    const userId = user.data.id;
    const formData = new FormData();
    formData.append('userId', String(userId));
    formData.append('content', postText.value);
    formData.append('image', image.value);
    const response = await PostService.createPost(formData);
    if (response.status === 200 || response.status === 201) {
      postText.value = '';
      image.value = null;
      imagePreview.value = null;
      // Reload parent page
      location.reload();
    } else {
      alert('Post creation failed. Please try again.');
    }
  } catch (error) {
    console.error('Post creation failed:', error);
    alert('Post creation failed. Please try again.');
  }
}


function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      image.value = file;
      imagePreview.value = reader.result;
    };
    reader.readAsDataURL(file);
  }
}

function removeImage() {
  image.value = null;
  imagePreview.value = null;
}
</script>

<template>
  <div class="create-post card">
    <div class="card-body">
      <textarea v-model="postText" class="form-control" placeholder="What's happening?" rows="3"></textarea>
      <div class="mt-3">
        <label for="imageUpload" class="btn btn-primary">
          <i class="fas fa-image mr-2"></i> Add Photo
          <input type="file" id="imageUpload" @change="handleImageUpload" style="display: none;">
        </label>
        <button @click="removeImage" class="btn btn-danger ml-2" v-if="image">
          <i class="fas fa-trash-alt mr-2"></i> Remove
        </button>
      </div>
      <div v-if="imagePreview" class="mt-3">
        <img :src="imagePreview" alt="Image Preview" class="img-fluid fixed-size-image">
      </div>

      <div class="mt-3">
        <button @click="createPost" :disabled="!postText.trim()" class="btn btn-primary">Post</button>
      </div>
    </div>
  </div>
</template>


<style scoped>
.create-post {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.form-control {
  width: 100%;
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
}

.btn-primary:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}

.btn-danger:hover {
  background-color: #c82333;
  border-color: #bd2130;
}

.img-fluid {
  max-width: 100%;
  height: auto;
}
.fixed-size-image {
  height: 300px; /* Adjust height as needed */
  object-fit: cover; /* Maintain aspect ratio */
}

.mt-3 {
  margin-top: 15px;
}

.ml-2 {
  margin-left: 10px;
}

.fa-trash-alt,
.fa-image {
  margin-right: 5px;
}
</style>
