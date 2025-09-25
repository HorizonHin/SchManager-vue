<script setup lang="ts">
import { message } from '@/utils/message';
import { perms } from '@/directives/perms/index';

defineOptions({
  name: "Welcome"
});


</script>

<template>
  <div>
      <h1>首页</h1>
  当拥有ikun权限时，可以看到下面的按钮
  <br>
  <el-button type="primary" @click="message('拥有ikun权限')"  v-perms="['ikun']">按钮</el-button>
  </div>

</template>
