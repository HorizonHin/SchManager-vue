<template>
  <div>
    <h2>课程学生成绩查询</h2>
    <el-card shadow="never" style="margin-bottom: 16px">
      <template #header>选择课程</template>
      <el-select 
        v-model="selectedCourseId" 
        placeholder="请选择要查询的课程"
        style="width: 400px"
        :loading="loading.courses"
        @change="onCourseChange"
      >
        <el-option 
          v-for="course in courses" 
          :key="course.courseId" 
          :label="`${course.courseName} - ${course.semester}`" 
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
    </el-card>

    <!-- 学生成绩列表 -->
    <div v-if="selectedCourseId">
      <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-weight: bold;">课程：</span>
          <span>{{ currentCourseName }}</span>
          <span style="margin-left: 20px; font-weight: bold;">学期：</span>
          <span>{{ currentSemester }}</span>
          <span style="margin-left: 20px; font-weight: bold;">选课学生数：</span>
          <span>{{ studentScores.length }}</span>
        </div>
        <el-button 
          type="success" 
          @click="handleExport" 
          :loading="loading.export"
          :disabled="studentScores.length === 0"
        >
          导出Excel
        </el-button>
      </div>

      <el-table 
        :data="studentScores" 
        border 
        :loading="loading.students"
        style="margin-bottom: 16px"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="username" label="学生姓名" width="120" />
        <el-table-column prop="semester" label="学期" width="120" />
        <el-table-column label="选课状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="成绩" width="100">
          <template #default="scope">
            <span v-if="scope.row.score !== null && scope.row.score !== undefined">
              {{ scope.row.score }}
            </span>
            <span v-else style="color: #999;">未录入</span>
          </template>
        </el-table-column>
        <el-table-column label="等级" width="80">
          <template #default="scope">
            <el-tag 
              v-if="scope.row.score !== null && scope.row.score !== undefined"
              :type="getGradeType(scope.row.score)" 
              size="small"
            >
              {{ getGradeText(scope.row.score) }}
            </el-tag>
            <span v-else style="color: #999;">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="selectTime" label="选课时间" width="160">
          <template #default="scope">
            {{ formatTime(scope.row.selectTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" />
      </el-table>

      <!-- 成绩统计 -->
      <el-card shadow="never">
        <template #header>成绩统计</template>
        <el-row :gutter="20">
          <el-col :span="4">
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #409eff;">{{ statistics.total }}</div>
              <div style="color: #666;">总人数</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #67c23a;">{{ statistics.scored }}</div>
              <div style="color: #666;">已录入成绩</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #e6a23c;">{{ statistics.average.toFixed(1) }}</div>
              <div style="color: #666;">平均分</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #f56c6c;">{{ statistics.passRate }}%</div>
              <div style="color: #666;">及格率</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #909399;">{{ statistics.excellentRate }}%</div>
              <div style="color: #666;">优秀率</div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <div v-else-if="!loading.courses">
      <el-empty description="请选择要查询的课程" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useUserStoreHook } from "@/store/modules/user";
import { message } from "@/utils/message";
import { 
  getTeacherCourses, 
  queryTeacherCourseStudents, 
  exportTeacherCourseScores,
  unwrap, 
  type CourseScoreDto, 
  type TeacherCourseStudentDto 
} from "@/api/report";
import { utils, writeFile } from "xlsx";

const userStore = useUserStoreHook();
const role = userStore.roles[0];
const currentUsername = userStore.username;

// 响应式数据
const courses = ref<CourseScoreDto[]>([]);
const selectedCourseId = ref<number | null>(null);
const studentScores = ref<TeacherCourseStudentDto[]>([]);

// 加载状态
const loading = reactive({
  courses: false,
  students: false,
  export: false
});

// 当前选中课程信息
const currentCourseName = computed(() => {
  const course = courses.value.find(c => c.courseId === selectedCourseId.value);
  return course?.courseName || "";
});

const currentSemester = computed(() => {
  const course = courses.value.find(c => c.courseId === selectedCourseId.value);
  return course?.semester || "";
});

// 成绩统计
const statistics = computed(() => {
  const total = studentScores.value.length;
  const scoredStudents = studentScores.value.filter(s => s.score !== null && s.score !== undefined);
  const scored = scoredStudents.length;
  
  if (scored === 0) {
    return { total, scored, average: 0, passRate: 0, excellentRate: 0 };
  }
  
  const totalScore = scoredStudents.reduce((sum, s) => sum + (s.score || 0), 0);
  const average = totalScore / scored;
  const passCount = scoredStudents.filter(s => (s.score || 0) >= 60).length;
  const excellentCount = scoredStudents.filter(s => (s.score || 0) >= 90).length;
  
  return {
    total,
    scored,
    average,
    passRate: Math.round((passCount / scored) * 100),
    excellentRate: Math.round((excellentCount / scored) * 100)
  };
});

// 状态相关函数
function getStatusText(status: number): string {
  switch (status) {
    case 0: return "已选";
    case 1: return "退选";
    case 2: return "已修完";
    default: return "未知";
  }
}

function getStatusType(status: number): "success" | "warning" | "info" | "danger" {
  switch (status) {
    case 0: return "success";
    case 1: return "warning";
    case 2: return "info";
    default: return "danger";
  }
}

function getGradeText(score: number): string {
  if (score >= 90) return "优秀";
  if (score >= 80) return "良好";
  if (score >= 70) return "中等";
  if (score >= 60) return "及格";
  return "不及格";
}

function getGradeType(score: number): "success" | "warning" | "info" | "danger" {
  if (score >= 90) return "success";
  if (score >= 80) return "info";
  if (score >= 70) return "warning";
  if (score >= 60) return "warning";
  return "danger";
}

function formatTime(timeStr?: string): string {
  if (!timeStr) return "-";
  try {
    return new Date(timeStr).toLocaleString("zh-CN");
  } catch {
    return timeStr;
  }
}

// 加载教师课程
async function loadTeacherCourses() {
  if (role !== 'teacher' && role !== 'admin') {
    message("只有教师和管理员可以查询课程成绩", { type: "warning" });
    return;
  }

  loading.courses = true;
  try {
    courses.value = await unwrap(getTeacherCourses(currentUsername));
  } catch (error) {
    console.error("加载课程失败:", error);
  } finally {
    loading.courses = false;
  }
}

// 加载课程学生成绩
async function loadCourseStudents(courseId: number) {
  loading.students = true;
  try {
    studentScores.value = await unwrap(queryTeacherCourseStudents(currentUsername, courseId));
  } catch (error) {
    console.error("加载学生成绩失败:", error);
    studentScores.value = [];
  } finally {
    loading.students = false;
  }
}

// 课程选择变化
async function onCourseChange(courseId: number | null) {
  if (courseId) {
    await loadCourseStudents(courseId);
  } else {
    studentScores.value = [];
  }
}

// 刷新课程列表
async function refreshCourses() {
  selectedCourseId.value = null;
  studentScores.value = [];
  await loadTeacherCourses();
}

// 导出Excel
async function handleExport() {
  if (!selectedCourseId.value) {
    message("请先选择课程", { type: "warning" });
    return;
  }

  loading.export = true;
  try {
    // 使用前端xlsx库导出
    if (studentScores.value.length === 0) {
      message("没有数据可导出", { type: "warning" });
      return;
    }

    // 准备导出数据
    const exportData = studentScores.value.map(student => ({
      '学号': student.username,
      '学生姓名': student.realName,
      '课程名称': student.courseName,
      '学期': student.semester,
      '选课状态': getStatusText(student.status),
      '成绩': student.score !== null && student.score !== undefined ? student.score : '未录入',
      '等级': student.score !== null && student.score !== undefined ? getGradeText(student.score) : '-',
      '选课时间': formatTime(student.selectTime),
      '备注': student.remark || ''
    }));

    // 创建工作表
    const worksheet = utils.json_to_sheet(exportData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "学生成绩");
    
    // 导出文件
    const fileName = `${currentCourseName.value}_学生成绩_${new Date().toISOString().slice(0, 10)}.xlsx`;
    writeFile(workbook, fileName);
    
    message("导出成功", { type: "success" });
  } catch (error) {
    console.error("导出失败:", error);
    message("导出失败", { type: "error" });
  } finally {
    loading.export = false;
  }
}

// 页面加载
onMounted(() => {
  if (role === 'teacher' || role === 'admin') {
    loadTeacherCourses();
  } else {
    message("只有教师和管理员可以访问此页面", { type: "warning" });
  }
});
</script>