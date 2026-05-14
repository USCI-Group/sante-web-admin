<script setup lang="ts">
const props = defineProps<{
    breadcrumbs: {
        label: string;
        to: string;
    }[];
}>();
</script>
<template>
    <div class="bg-white shadow border-t py-4 px-10 mt-2 z-10 relative">
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem v-for="(breadcrumb, index) in breadcrumbs" :key="breadcrumb.label">
                    <BreadcrumbLink v-if="index !== breadcrumbs.length - 1" :href="breadcrumb.to" as-child>
                        <NuxtLink :to="breadcrumb.to">
                           <p class="text-md text-gray-500">{{ breadcrumb.label }}</p> 
                        </NuxtLink>                        
                    </BreadcrumbLink>
                    <BreadcrumbPage v-else>
                        <p class="text-md text-primary font-semibold">{{ breadcrumb.label }}</p>
                    </BreadcrumbPage>
                    <BreadcrumbSeparator v-if="index !== breadcrumbs.length - 1" />
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    </div>
</template>