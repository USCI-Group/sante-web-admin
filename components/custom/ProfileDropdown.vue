<script setup lang="ts">
import { NuxtLink } from '#components';
import { onClickOutside } from '@vueuse/core';

interface Props {
  imageUrl: string;
  name: string;
  email: string;
}

const props = defineProps<Props>();
const isOpen = ref(false);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

// Close dropdown when clicking outside
const dropdownRef = ref(null);
onClickOutside(dropdownRef, () => {
  isOpen.value = false;
});

const handleLogout = async () => {
  console.log('Logging out...');
  try {
    const { signOut } = useAuth();
    // First perform the logout with options
    await signOut({
      redirect: false
    });
    
    await navigateTo('/login', { external: true }) // Use Nuxt's way to handle external redirects
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <!-- Profile Button -->
    <button
      @click="toggleDropdown"
      class="flex items-center gap-3 p-1 rounded-full hover:bg-gray-100 transition-all duration-200 border border-gray-200"
    >
      <div class="relative">
        <div class="w-8 h-8 rounded-full border-2 border-gray-100 flex items-center justify-center">
          <img
            :src="imageUrl"
            :alt="name"
            class="w-8 h-8 rounded-full object-cover"
          />
        </div>
        <!-- Online status indicator -->
        <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      </div>
      <Icon
        name="heroicons:chevron-down"
        class="w-4 h-4 text-gray-500"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
    >
      <!-- Profile Info -->
      <div class="px-4 py-2">
        <div class="flex items-center gap-3">
          <img
            :src="imageUrl"
            :alt="name"
            class="w-10 h-10 rounded-full object-cover"
          />
          <div class="flex flex-col">
            <span class="text-sm font-semibold text-gray-900">{{ name }}</span>
            <span class="text-xs text-gray-500">{{ email }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
