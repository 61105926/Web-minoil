<template>
  <button
    :class="cn(
      'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      variants[variant],
      sizes[size],
      className
    )"
    :type="type"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  className?: string
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default',
  type: 'button',
  disabled: false,
  className: ''
})

defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const variants = {
  default: 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
  outline: 'border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100',
  ghost: 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
}

const sizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 px-3',
  lg: 'h-11 px-8'
}
</script>
