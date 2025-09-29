<template>
  <div style="padding:20px;">
    <h1>欢迎使用学生管理系统</h1>
    <p>请选择身份：</p>
    <div style="margin-top:10px;">
      <el-button type="primary" @click="chooseRole('student')">学生</el-button>
      <el-button type="success" @click="chooseRole('teacher')">老师</el-button>
      <el-button type="warning" @click="chooseRole('admin')">管理员</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStoreHook } from "@/store/modules/user";
import { useRouter } from "vue-router";
import { initRouter } from "@/router/utils";

const router = useRouter();
const userStore = useUserStoreHook();

// 页面加载时恢复本地保存的角色
const savedRole = localStorage.getItem("role");
if (savedRole) {
  userStore.SET_ROLES([savedRole]);
}

// 切换角色
async function chooseRole(role: string) {
  userStore.SET_ROLES([role]);
  localStorage.setItem("role", role);

  // 重新初始化路由，刷新菜单
  await initRouter();

  // 跳转到该角色对应的功能页
  if (role === "student") router.push("/school/course");
  else if (role === "teacher") router.push("/school/score");
  else router.push("/school/report");
}
</script>