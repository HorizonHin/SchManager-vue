<template>
  <div>
    <h2>学生选课管理</h2>

    <el-table :data="courses" border style="margin-bottom:16px">
      <el-table-column type="index" label="序号" width="60"/>
      <el-table-column prop="id" label="课程号"/>
      <el-table-column prop="name" label="课程名"/>
      <el-table-column prop="teacher" label="教师"/>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button 
            size="small" type="success"
            :disabled="isSelected(scope.row) || role!=='student'" 
            @click="selectCourse(scope.row)"
          >
            选择
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div>
      <p>已选课程数量：<b>{{ selected.length }}</b> 门</p>
      <el-button type="warning" @click="clear" :disabled="role!=='student'">清空选择</el-button>
      <el-button type="primary" :disabled="!validCount || role!=='student'" @click="submit">
        提交选课
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useUserStoreHook } from "@/store/modules/user";

// 当前角色（从 store 获取）
const userStore = useUserStoreHook();
const role = userStore.roles[0]; // "student" | "teacher" | "admin"
const currentUser = { id: "2023001", name: "小明" };

const courses = ref([
  { id: "C001", name: "高等数学上", teacher: "张老师" },
  { id: "C002", name: "大学英语1", teacher: "李老师" },
  { id: "C003", name: "操作系统", teacher: "王老师" },
  { id: "C004", name: "编译原理", teacher: "刘老师" },
  { id: "C005", name: "高等数学下", teacher: "赵老师" }
]);

const selected = ref<any[]>([]);

onMounted(() => {
  const stored = localStorage.getItem("selectedCourses_" + currentUser.id);
  if (stored) selected.value = JSON.parse(stored);
});

function selectCourse(course: any) {
  if (!selected.value.find(c => c.id === course.id)) {
    selected.value.push(course);
  }
}
function isSelected(course: any) {
  return !!selected.value.find(c => c.id === course.id);
}
function clear() {
  selected.value = [];
  localStorage.removeItem("selectedCourses_" + currentUser.id);
}

// 规则：至少 3 门
const validCount = computed(() => selected.value.length >= 3);

function submit() {
  if (!validCount.value) {
    alert("必须选择至少 3 门课程！");
    return;
  }
  localStorage.setItem("selectedCourses_" + currentUser.id, JSON.stringify(selected.value));
  alert("选课成功！已选择 " + selected.value.length + " 门课程");
}
</script>