<template>
  <div>
    <h2>我的成绩查询</h2>
    
    <!-- 学生基本信息 -->
    <el-card shadow="never" style="margin-bottom: 16px">
      <template #header>学生信息</template>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="学生姓名">{{ currentUsername }}</el-descriptions-item>
        <el-descriptions-item label="总选课数">{{ studentScores.length }}</el-descriptions-item>
        <el-descriptions-item label="已录入成绩">{{ scoredCount }}</el-descriptions-item>
        <el-descriptions-item label="平均分">{{ averageScore.toFixed(1) }}</el-descriptions-item>
        <el-descriptions-item label="及格率">{{ passRate }}%</el-descriptions-item>
        <el-descriptions-item label="GPA">{{ gpa.toFixed(2) }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 操作按钮 -->
    <div style="margin-bottom: 16px; text-align: right;">
      <el-button @click="refreshScores" :loading="loading.query" type="primary">
        刷新成绩
      </el-button>
      <el-button 
        type="success" 
        @click="handleExport" 
        :loading="loading.export"
        :disabled="studentScores.length === 0"
      >
        导出成绩单
      </el-button>
    </div>

    <!-- 成绩列表 -->
    <el-table 
      :data="studentScores" 
      border 
      :loading="loading.query"
      style="margin-bottom: 16px"
    >
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="courseName" label="课程名称" width="200" />
      <el-table-column prop="teacher" label="任课教师" width="120" />
      <el-table-column prop="semester" label="学期" width="120" />
      <el-table-column label="选课状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)" size="small">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="成绩" width="80">
        <template #default="scope">
          <span 
            v-if="scope.row.score !== null && scope.row.score !== undefined"
            :style="{ color: getScoreColor(scope.row.score), fontWeight: 'bold' }"
          >
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
      <el-table-column label="绩点" width="80">
        <template #default="scope">
          <span v-if="scope.row.score !== null && scope.row.score !== undefined">
            {{ calculateGPA(scope.row.score).toFixed(1) }}
          </span>
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

    <!-- 空状态 -->
    <div v-if="studentScores.length === 0 && !loading.query">
      <el-empty description="暂无选课记录" />
    </div>

    <!-- 成绩分析 -->
    <el-card shadow="never" v-if="studentScores.length > 0">
      <template #header>成绩分析</template>
      <el-row :gutter="20">
        <el-col :span="12">
          <h4>成绩分布</h4>
          <el-row :gutter="10">
            <el-col :span="6">
              <div style="text-align: center; padding: 10px; border: 1px solid #eee; border-radius: 4px;">
                <div style="font-size: 20px; font-weight: bold; color: #67c23a;">{{ gradeDistribution.excellent }}</div>
                <div style="color: #666;">优秀(≥90)</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div style="text-align: center; padding: 10px; border: 1px solid #eee; border-radius: 4px;">
                <div style="font-size: 20px; font-weight: bold; color: #409eff;">{{ gradeDistribution.good }}</div>
                <div style="color: #666;">良好(80-89)</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div style="text-align: center; padding: 10px; border: 1px solid #eee; border-radius: 4px;">
                <div style="font-size: 20px; font-weight: bold; color: #e6a23c;">{{ gradeDistribution.medium }}</div>
                <div style="color: #666;">中等(70-79)</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div style="text-align: center; padding: 10px; border: 1px solid #eee; border-radius: 4px;">
                <div style="font-size: 20px; font-weight: bold; color: #f56c6c;">{{ gradeDistribution.poor }}</div>
                <div style="color: #666;">不及格(&lt;60)</div>
              </div>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="12">
          <h4>学期成绩趋势</h4>
          <div v-for="semester in semesterStats" :key="semester.semester" style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold;">{{ semester.semester }}</span>
              <span>平均分: {{ semester.average.toFixed(1) }} | 课程数: {{ semester.count }}</span>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useUserStoreHook } from "@/store/modules/user";
import { message } from "@/utils/message";
import { 
  queryStudentScores, 
  exportStudentScores,
  unwrap, 
  type CourseScoreDto 
} from "@/api/report";
import { utils, writeFile } from "xlsx";

const userStore = useUserStoreHook();
const role = userStore.roles[0];
const currentUsername = userStore.username;

// 响应式数据
const studentScores = ref<CourseScoreDto[]>([]);

// 加载状态
const loading = ref({
  query: false,
  export: false
});

// 计算属性
const scoredCount = computed(() => 
  studentScores.value.filter(s => s.score !== null && s.score !== undefined).length
);

const averageScore = computed(() => {
  const scoredCourses = studentScores.value.filter(s => s.score !== null && s.score !== undefined);
  if (scoredCourses.length === 0) return 0;
  const total = scoredCourses.reduce((sum, s) => sum + (s.score || 0), 0);
  return total / scoredCourses.length;
});

const passRate = computed(() => {
  const scoredCourses = studentScores.value.filter(s => s.score !== null && s.score !== undefined);
  if (scoredCourses.length === 0) return 0;
  const passCount = scoredCourses.filter(s => (s.score || 0) >= 60).length;
  return Math.round((passCount / scoredCourses.length) * 100);
});

const gpa = computed(() => {
  const scoredCourses = studentScores.value.filter(s => s.score !== null && s.score !== undefined);
  if (scoredCourses.length === 0) return 0;
  const totalGP = scoredCourses.reduce((sum, s) => sum + calculateGPA(s.score || 0), 0);
  return totalGP / scoredCourses.length;
});

const gradeDistribution = computed(() => {
  const scoredCourses = studentScores.value.filter(s => s.score !== null && s.score !== undefined);
  return {
    excellent: scoredCourses.filter(s => (s.score || 0) >= 90).length,
    good: scoredCourses.filter(s => (s.score || 0) >= 80 && (s.score || 0) < 90).length,
    medium: scoredCourses.filter(s => (s.score || 0) >= 70 && (s.score || 0) < 80).length,
    poor: scoredCourses.filter(s => (s.score || 0) < 60).length
  };
});

const semesterStats = computed(() => {
  const scoredCourses = studentScores.value.filter(s => s.score !== null && s.score !== undefined);
  const semesterMap = new Map();
  
  scoredCourses.forEach(course => {
    const semester = course.semester;
    if (!semesterMap.has(semester)) {
      semesterMap.set(semester, { scores: [], count: 0 });
    }
    semesterMap.get(semester).scores.push(course.score || 0);
    semesterMap.get(semester).count++;
  });
  
  return Array.from(semesterMap.entries()).map(([semester, data]) => ({
    semester,
    average: data.scores.reduce((sum: number, score: number) => sum + score, 0) / data.scores.length,
    count: data.count
  })).sort((a, b) => a.semester.localeCompare(b.semester));
});

// 辅助函数
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

function getScoreColor(score: number): string {
  if (score >= 90) return "#67c23a";
  if (score >= 80) return "#409eff";
  if (score >= 70) return "#e6a23c";
  if (score >= 60) return "#909399";
  return "#f56c6c";
}

function calculateGPA(score: number): number {
  if (score >= 90) return 4.0;
  if (score >= 85) return 3.7;
  if (score >= 82) return 3.3;
  if (score >= 78) return 3.0;
  if (score >= 75) return 2.7;
  if (score >= 72) return 2.3;
  if (score >= 68) return 2.0;
  if (score >= 64) return 1.5;
  if (score >= 60) return 1.0;
  return 0.0;
}

function formatTime(timeStr?: string): string {
  if (!timeStr) return "-";
  try {
    return new Date(timeStr).toLocaleString("zh-CN");
  } catch {
    return timeStr;
  }
}

// 加载学生成绩
async function loadStudentScores() {
  if (role !== 'student' && role !== 'admin') {
    message("只有学生可以查询个人成绩", { type: "warning" });
    return;
  }

  loading.value.query = true;
  try {
    studentScores.value = await unwrap(queryStudentScores(currentUsername));
  } catch (error) {
    console.error("加载成绩失败:", error);
  } finally {
    loading.value.query = false;
  }
}

// 刷新成绩
async function refreshScores() {
  await loadStudentScores();
  message("成绩已刷新", { type: "success" });
}

// 导出成绩单
async function handleExport() {
  loading.value.export = true;
  try {
    // 使用前端xlsx库导出
    if (studentScores.value.length === 0) {
      message("没有数据可导出", { type: "warning" });
      return;
    }

    // 准备导出数据
    const exportData = studentScores.value.map(course => ({
      '课程名称': course.courseName,
      '任课教师': course.teacher,
      '学期': course.semester,
      '选课状态': getStatusText(course.status),
      '成绩': course.score !== null && course.score !== undefined ? course.score : '未录入',
      '等级': course.score !== null && course.score !== undefined ? getGradeText(course.score) : '-',
      '绩点': course.score !== null && course.score !== undefined ? calculateGPA(course.score).toFixed(1) : '-',
      '选课时间': formatTime(course.selectTime),
      '备注': course.remark || ''
    }));

    // 添加汇总信息
    const summaryData = [
      { '课程名称': '汇总信息', '任课教师': '', '学期': '', '选课状态': '', '成绩': '', '等级': '', '绩点': '', '选课时间': '', '备注': '' },
      { '课程名称': '总选课数', '任课教师': studentScores.value.length, '学期': '', '选课状态': '', '成绩': '', '等级': '', '绩点': '', '选课时间': '', '备注': '' },
      { '课程名称': '已录入成绩', '任课教师': scoredCount.value, '学期': '', '选课状态': '', '成绩': '', '等级': '', '绩点': '', '选课时间': '', '备注': '' },
      { '课程名称': '平均分', '任课教师': averageScore.value.toFixed(1), '学期': '', '选课状态': '', '成绩': '', '等级': '', '绩点': '', '选课时间': '', '备注': '' },
      { '课程名称': '及格率', '任课教师': `${passRate.value}%`, '学期': '', '选课状态': '', '成绩': '', '等级': '', '绩点': '', '选课时间': '', '备注': '' },
      { '课程名称': 'GPA', '任课教师': gpa.value.toFixed(2), '学期': '', '选课状态': '', '成绩': '', '等级': '', '绩点': '', '选课时间': '', '备注': '' },
      { '课程名称': '', '任课教师': '', '学期': '', '选课状态': '', '成绩': '', '等级': '', '绩点': '', '选课时间': '', '备注': '' }
    ];

    // 创建工作表
    const worksheet = utils.json_to_sheet([...summaryData, ...exportData]);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "个人成绩单");
    
    // 导出文件
    const fileName = `${currentUsername}_成绩单_${new Date().toISOString().slice(0, 10)}.xlsx`;
    writeFile(workbook, fileName);
    
    message("导出成功", { type: "success" });
  } catch (error) {
    console.error("导出失败:", error);
    message("导出失败", { type: "error" });
  } finally {
    loading.value.export = false;
  }
}

// 页面加载
onMounted(() => {
  if (role === 'student' || role === 'admin') {
    loadStudentScores();
  } else {
    message("只有学生可以访问此页面", { type: "warning" });
  }
});
</script>