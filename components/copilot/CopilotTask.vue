<template>
  <div
    class="self-stretch bg-white px-4 py-2 rounded cursor-pointer shadow hover:shadow-md transition-300"
    @click="task._id && switchTask.execute(task._id)"
  >
    <div class="overflow-hidden text-nowrap text-ellipsis font-semibold">
      {{ task.title || $t('webpilot.msg.default_title') }}
    </div>
    <div class="flex">
      <div class="flex-1" />
      <div class="text-sm text-gray">{{ simpleFormatDate(task.updatedAt || 0) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  task: Partial<IAgentTaskContext>
}>()
const { switchTask } = useCopilot()
</script>
