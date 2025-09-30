<template>
  <div>
    <h2>成绩录入</h2>

    <div style="margin-bottom: 16px">
      <el-select 
        v-model="selectedCourse" 
        placeholder="选择课程" 
        style="width:300px"
        :loading="loading.courses"
        @change="onCourseChange"
      >
        <el-option 
          v-for="course in courses" 
          :key="course.courseId" 
          :label="`${course.courseName} (${course.teacher})`" 
          :value="course.courseId"
        />
      </el-select>
      <el-button 
        type="text" 
        size="small" 
        @click="refreshCourses" 
        :loading="loading.courses"
        style="margin-left: 8px"
      >
        刷新课程
      </el-button>
    </div>

    <el-table 
      v-if="selectedCourse && students.length > 0" 
      :data="students" 
      border 
      style="margin-bottom: 16px"
      :loading="loading.students"
    >
      <el-table-column type="index" label="序号" width="60"/>
      <el-table-column prop="studentName" label="学生姓名" width="120"/>
      <el-table-column prop="semester" label="学期" width="120"/>
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-tag 
            :type="getStatusType(scope.row.status)"
            size="small"
          >
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="成绩" width="120">
        <template #default="scope">
          <el-input 
            v-model.number="scope.row.score" 
            size="small" 
            style="width:80px"
            type="number"
            :min="0"
            :max="100"
            :readonly="role === 'student' || scope.row.status !== 0"
            placeholder="0-100"
          />
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="150">
        <template #default="scope">
          <el-input 
            v-model="scope.row.remark" 
            size="small"
            :readonly="role === 'student' || scope.row.status !== 0"
            placeholder="备注信息"
          />
        </template>
      </el-table-column>
    </el-table>

    <div v-if="selectedCourse && students.length === 0 && !loading.students">
      <el-empty description="该课程暂无学生选课" />
    </div>

    <div v-if="selectedCourse && students.length > 0" style="margin-top: 16px">
      <el-button 
        type="primary" 
        @click="submitScores" 
        :loading="loading.submit"
        :disabled="role === 'student'"
      >
        提交成绩
      </el-button>
      <el-button 
        type="default" 
        @click="refreshStudents" 
        :loading="loading.students"
      >
        刷新学生列表
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useUserStoreHook } from "@/store/modules/user";
import { message } from "@/utils/message";
import { 
  fetchTeacherCourses, 
  fetchCourseStudents, 
  updateStudentScores, 
  unwrap, 
  type CourseInfoDto, 
  type StudentCourseDto 
} from "@/api/score";

const userStore = useUserStoreHook();
const role = userStore.roles[0]; // "teacher"|"student"|"admin"
const currentUsername = userStore.username;

// 响应式数据
const courses = ref<CourseInfoDto[]>([]);
const selectedCourse = ref<number | null>(null);
const students = ref<StudentCourseDto[]>([]);

// 加载状态
const loading = ref({
  courses: false,
  students: false,
  submit: false
});

// 状态相关的辅助函数
function getStatusText(status: number): string {
  switch (status) {
    case 0: return "已选";
    case 1: return "退选";
    case 2: return "已修完";
    default: return "未知";
  }
}

function getStatusType(status: number): "success" | "warning" | "info" | "primary" | "danger" {
  switch (status) {
    case 0: return "success";
    case 1: return "warning";
    case 2: return "info";
    default: return "primary";
  }
}

// 加载教师课程列表
async function loadTeacherCourses() {
  if (role !== 'teacher' && role !== 'admin') {
    message("只有教师和管理员可以录入成绩", { type: "warning" });
    return;
  }
  
  loading.value.courses = true;
  try {
    courses.value = await unwrap(fetchTeacherCourses(currentUsername));
  } catch (error) {
    console.error("加载课程列表失败:", error);
  } finally {
    loading.value.courses = false;
  }
}

// 加载某课程的学生列表
async function loadCourseStudents(courseId: number) {
  loading.value.students = true;
  try {
    students.value = await unwrap(fetchCourseStudents(courseId));
  } catch (error) {
    console.error("加载学生列表失败:", error);
    students.value = [];
  } finally {
    loading.value.students = false;
  }
}

// 课程选择变化处理
async function onCourseChange(courseId: number | null) {
  if (courseId) {
    await loadCourseStudents(courseId);
  } else {
    students.value = [];
  }
}

// 刷新课程列表
async function refreshCourses() {
  selectedCourse.value = null;
  students.value = [];
  await loadTeacherCourses();
}

// 刷新学生列表
async function refreshStudents() {
  if (selectedCourse.value) {
    await loadCourseStudents(selectedCourse.value);
  }
}

// 提交成绩
async function submitScores() {
  if (!selectedCourse.value || students.value.length === 0) {
    message("请选择课程并确保有学生数据", { type: "warning" });
    return;
  }

  // 验证成绩输入
  const invalidScores = students.value.filter(student => 
    student.score !== undefined && 
    student.score !== null && 
    (student.score < 0 || student.score > 100)
  );
  
  if (invalidScores.length > 0) {
    message("成绩必须在0-100之间", { type: "warning" });
    return;
  }

  loading.value.submit = true;
  try {
    // 只提交已选状态(status=0)的学生成绩
    const validStudents = students.value.filter(student => student.status === 0);
    const updatedStudents = await unwrap(updateStudentScores(validStudents));
    
    // 更新本地数据
    students.value = updatedStudents;
    message("成绩提交成功", { type: "success" });
  } catch (error) {
    console.error("提交成绩失败:", error);
  } finally {
    loading.value.submit = false;
  }
}

// 页面加载时获取课程列表
onMounted(async () => {
  await loadTeacherCourses();
});
</script>