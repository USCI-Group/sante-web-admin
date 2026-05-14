<script lang="ts" setup>

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

const props = defineProps<{
    title: string
    description: string
    openDialog: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
}>()

</script>

<template>
    <AlertDialog :open="openDialog" @open-change="onOpenChange">
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{{ props.title || 'Are you sure?' }}</AlertDialogTitle>
                <AlertDialogDescription>{{ props.description ||  'This action cannot be undone. This will permanently delete your account and remove your data from our servers.'}}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel @click="onOpenChange(false)">Cancel</AlertDialogCancel>
                <AlertDialogAction @click="onConfirm" class="btn-primary">Confirm</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>

    </AlertDialog>
</template>