<template>
  <div class="max-w-4xl w-full mx-auto m-4 flex flex-col items-stretch">
    <div class="flex-1">
      <div class="h-0 min-h-full overflow-hidden">
        <CopilotView class="flex-1" :class="{ 'xl:pt-10vh': !taskContext.messages.length }" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { taskContext } = useCopilot()
</script>
