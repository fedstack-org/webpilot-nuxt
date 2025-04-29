<template>
  <NMenu :options />
</template>

<script setup lang="ts">
import { NMenu } from 'naive-ui'

const { options } = useAppMenu()
</script>
