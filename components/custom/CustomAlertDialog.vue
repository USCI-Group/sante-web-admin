<script setup lang="ts">
    const props = defineProps<{
        title: string,
        description: string,
    }>()

    const emit = defineEmits<{
        (e: 'confirm'): void
    }>()

    const handleConfirm = () => {
        emit('confirm')
    }
</script>
<template>
    <AlertDialog>
        <AlertDialogTrigger as-child>
            <slot name="trigger" />
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{{ title }}</AlertDialogTitle>
                <AlertDialogDescription>{{ description }}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction class="btn-primary" @click="handleConfirm">Confirm</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>    
</template>