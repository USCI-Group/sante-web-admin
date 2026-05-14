<script setup lang="ts">
import ProfileDropdown from '~/components/custom/ProfileDropdown.vue';
const { myProfile } = useMyProfileStore()

const avatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";
</script>

<template>
  <div class="pt-8 px-12">
      <div class="flex items-center justify-end">
        <!-- Profile info moved to settings -->
      </div>
  </div>
</template> 