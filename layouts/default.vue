<script setup lang="ts">
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/sheet'
import { Button } from '~/components/ui/button'
import { Menu } from 'lucide-vue-next'
import Sidebar from '@/layouts/Sidebar.vue'
import { ref, onMounted } from 'vue'
import AppBar from '@/layouts/AppBar.vue'
import { useUsers } from '@/composables/useUsers'
import { useMyProfileStore } from '@/stores/UserStore'
import type { User } from '@/types/user'
const { getMe, me } = useUsers()
const { setMyProfile, myProfile } = useMyProfileStore()
const isSidebarCollapsed = ref(false);
const isLoading = ref(true)

const handleSidebarToggle = (collapsed: boolean) => {
  isSidebarCollapsed.value = collapsed;
};

onMounted(async () => {
  await getMe()
  setMyProfile(me.value as User)
  isLoading.value = false
})
</script>

<template>
  <div v-if="isLoading" class="loading-screen">
    <div class="flex flex-col items-center gap-2">
      <Icon name="svg-spinners:ring-resize" class="w-8 h-8 text-primary animate-spin" />
      <span class="text-gray-600">Loading...</span>
    </div>
  </div>
  <div v-else class="min-h-screen">
    <!-- Mobile Sidebar (Sheet) -->
    <Sheet>
      <SheetTrigger asChild class="lg:hidden absolute left-4 top-4 z-40">
        <Button variant="ghost" size="icon">
          <Menu class="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" :class="[
        'p-0 transition-all duration-300',
        isSidebarCollapsed ? 'w-[70px]' : 'w-[250px]'
      ]">
        <Sidebar @toggle-sidebar="handleSidebarToggle" />
      </SheetContent>
    </Sheet>

    <!-- Desktop Sidebar -->
    <div class="hidden lg:block">
      <Sidebar @toggle-sidebar="handleSidebarToggle" />
    </div>

    <!-- Main Content -->
    <main :class="[
      'transition-all duration-300 lg:pt-0 min-h-screen bg-slate-50',
      isSidebarCollapsed ? 'lg:ml-[100px]' : 'lg:ml-[290px]'
    ]">
      <!-- AppBar -->
      <AppBar />
      
      <!-- Page Content -->
      <div class="">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.loading-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: white;
}
</style>
