<template>
  <div>
    <h2>学生选课管理</h2>

    <el-alert
      title="当前角色仅浏览，不能提交或修改选课"
      type="info"
      :closable="false"
      style="margin-bottom:12px" />

    <el-table :data="courses" border style="margin-bottom:16px" :loading="loading.courses">
      <el-table-column type="index" label="序号" width="60"/>
      <!-- 依据新的 DTO 字段：coursename, teacher (username 代表学生，不在课程列表里展示) -->
      <el-table-column prop="coursename" label="课程名" />
      <el-table-column prop="teacher" label="教师" width="140" />
      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-button
            size="small"
            type="success"
            :disabled="isSelected(scope.row)"
            @click="selectCourse(scope.row)"
          >选择</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div style="margin-bottom:12px">
      <p>已选课程数量：<b>{{ selected.length }}</b> 门（需 ≥ 3）</p>
      <el-space>
        <el-button type="warning" @click="clear" :loading="loading.clear">清空选择</el-button>
        <el-button type="primary" :loading="loading.submit" :disabled="!validCount" @click="submit">
          提交选课
        </el-button>
        <el-button text size="small" @click="refreshAll" :loading="loading.refresh">刷新</el-button>
      </el-space>
    </div>

    <el-card shadow="never" v-if="selected.length">
      <template #header>已选择课程</template>
      <el-tag
        v-for="c in selected"
        :key="c.coursename"
        style="margin:4px"
        type="success"
        closable
        :disable-transitions="true"
        @close="removeCourse(c.coursename)"
      >{{ c.coursename }}</el-tag>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useUserStoreHook } from "@/store/modules/user";
import { message } from "@/utils/message";
import { fetchCourses, fetchSelectedCourses, submitCourseSelection, clearCourseSelection, unwrap, type CourseDto } from "@/api/student";

// 当前角色与用户（假设 store 中有 username/nickname，可按实际结构调整）
const userStore = useUserStoreHook();
// 当前登录学生名称（与后端字段 studentName 对应）
const currentUsername: string = userStore.username;

const courses = ref<CourseDto[]>([]);
const selected = ref<CourseDto[]>([]);

const loading = ref({
  courses: false,
  submit: false,
  clear: false,
  refresh: false
});

const validCount = computed(() => selected.value.length >= 3);

async function loadCourses() {
  loading.value.courses = true;
  try {
    courses.value = await unwrap(fetchCourses());
  } finally {
    loading.value.courses = false;
  }
}

async function loadSelected() {
  try {
  selected.value = await unwrap(fetchSelectedCourses(currentUsername));
  } catch {
    // 忽略即可
  }
}

function isSelected(course: CourseDto) {
  return selected.value.some(c => c.coursename === course.coursename);
}

function selectCourse(course: CourseDto) {
  if (isSelected(course)) return;
  selected.value.push(course);
}

function removeCourse(courseName: string) {
  selected.value = selected.value.filter(c => c.coursename !== courseName);
}

async function submit() {
  if (!validCount.value) {
    message("必须选择至少 3 门课程！", { type: "warning" });
    return;
  }
  loading.value.submit = true;
  try {
  const list = await unwrap(submitCourseSelection(currentUsername, selected.value.map(c => c.coursename)));
    selected.value = list; // 后端返回校验后的列表
    message(`选课成功，已选择 ${selected.value.length} 门课程`, { type: "success" });
  } finally {
    loading.value.submit = false;
  }
}

async function clear() {
  loading.value.clear = true;
  try {
  await unwrap(clearCourseSelection(currentUsername));
    selected.value = [];
    message("已清空选择", { type: "success" });
  } finally {
    loading.value.clear = false;
  }
}

async function refreshAll() {
  loading.value.refresh = true;
  try {
    await Promise.all([loadCourses(), loadSelected()]);
    message("已刷新", { type: "success" });
  } finally {
    loading.value.refresh = false;
  }
}

onMounted(async () => {
  await refreshAll();
});
</script>