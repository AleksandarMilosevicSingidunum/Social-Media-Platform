<script setup lang="ts">
import { RouterLink } from 'vue-router';

export interface NavbarRouteProps {
    name: string
    to: string
}

const { name, to } = defineProps<NavbarRouteProps>()
</script>

<template>
    <li class="nav-item">
        <RouterLink :to="to" class="nav-link">{{ name }}</RouterLink>
    </li>
</template>