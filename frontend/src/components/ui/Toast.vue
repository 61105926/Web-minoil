<template>
  <div
    :class="cn(
      'max-w-md w-full shadow-lg rounded-lg p-4 flex items-start gap-3',
      variants[variant],
      className
    )"
  >
    <div class="flex-shrink-0">
      <svg
        v-if="variant === 'success'"
        class="h-6 w-6 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <svg
        v-else-if="variant === 'error'"
        class="h-6 w-6 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
      <svg
        v-else-if="variant === 'warning'"
        class="h-6 w-6 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <svg
        v-else
        class="h-6 w-6 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-semibold text-white">{{ title }}</p>
      <p v-if="message" class="text-sm text-white/90 mt-1">{{ message }}</p>
    </div>
    <button
      @click="$emit('close')"
      class="flex-shrink-0 text-white/80 hover:text-white transition-colors"
    >
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  variant?: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  className?: string
}

withDefaults(defineProps<Props>(), {
  variant: 'info',
  className: ''
})

defineEmits<{
  (e: 'close'): void
}>()

const variants = {
  success: 'bg-gradient-to-r from-green-500 to-green-600 border-l-4 border-green-700',
  error: 'bg-gradient-to-r from-red-500 to-red-600 border-l-4 border-red-700',
  warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600 border-l-4 border-yellow-700',
  info: 'bg-gradient-to-r from-blue-500 to-blue-600 border-l-4 border-blue-700',
}
</script>

