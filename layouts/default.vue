<script setup>
// Signed-in visitors get their name and a Sign out button on the right of the bar.
const { user, loggedIn, signOut } = useAuth()

async function leave() {
  await signOut()
  await navigateTo('/')
}
</script>

<template>
    <div class="flex flex-col min-h-screen">
      <nav class='sticky h-14 inset-x-0 top-0 z-30 w-full border-b bg-white transition-all'>
        <div class='flex h-14 items-center justify-between border-b relative'>
          <div class='flex flex-row items-center ml-12'>
            <img src="https://i.pinimg.com/736x/3d/22/91/3d229119d65e1929fc63d813da0660ee.jpg" alt="Logo" class="h-12 w-14">
            <router-link to="/" class="text-3xl font-bold font-madimi relative">Vacation Planner</router-link>
            <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-100"></div>
          </div>
          <div v-if="loggedIn" class="flex items-center gap-3 mr-12 text-sm">
            <span class="hidden sm:inline-block max-w-[16ch] truncate align-middle text-gray-600" :title="user.name">{{ user.name }}</span>
            <button type="button" class="rounded border px-3 py-1 hover:bg-gray-100" @click="leave">Sign out</button>
          </div>
        </div>
      </nav>
  
      
        <slot />

  
      <footer class="w-full h-14 border-t backdrop-blur-lg transition-all">
        <div class="flex h-14 items-center justify-center">
          <p class="text-center">© 2024 Vacation Planner. All rights reserved.</p>
        </div>
      </footer>
    </div>
  </template>
  
  <style>
  /* Add any custom styles here */
  </style>
  