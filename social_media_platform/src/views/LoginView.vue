<script setup lang="ts">
import { useRouter } from 'vue-router';
import { UserService } from '@/services/user.service';
import { SessionManager } from '@/utils/session.manager';
import { ref } from 'vue';

const email = ref<string>("");
const password = ref<string>("");
const router = useRouter();

function login() {
    UserService.login(email.value, password.value)
        .then(rsp => {
            if (rsp && rsp.data) {
                SessionManager.saveAuth(rsp.data);
                router.push({ path: '/' });
                window.location.href = '/'; // Navigate to home route and reload
            } else {
                throw new Error('Invalid response received');
            }
        })
        .catch(e => {
            console.error('Login failed:', e);
            alert('Login failed. Please try again.');
        });
}

function goToSignup() {
    router.push({ path: '/signup' });
}
</script>

<template>
    <div class="login">
        <h1 class="h3 text-center">
            Welcome back, please login!
        </h1>
        <form class="form-responsive mx-auto" v-on:submit.prevent="login">
            <div class="mb-3">
                <label for="exampleInputEmail1" class="form-label">Email address</label>
                <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp"
                    v-model="email">
                <div id="emailHelp" class="form-text">We'll never share your email with anyone else.</div>
            </div>
            <div class="mb-3">
                <label for="exampleInputPassword1" class="form-label">Password</label>
                <input type="password" class="form-control" id="exampleInputPassword1" v-model="password">
            </div>
            <button type="submit" class="btn btn-primary me-2">Submit</button>
            <button type="button" class="btn btn-secondary" @click="goToSignup">Create New Account</button>
        </form>
    </div>
</template>

<style>
.form-responsive {
    width: 50%;
}

@media (max-width: 900px) {
    .form-responsive {
        width: 100%;
    }
}

@media (max-width: 576px) {
    .login .btn-secondary {
        display: block;
        margin-top: 10px;
        width: 100%;
    }
}
</style>
