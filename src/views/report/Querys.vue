<template>
  <div>
    <h2>查询与报表中心</h2>
    
    <!-- 角色说明 -->
    <el-alert
      :title="getRoleDescription()"
      type="info"
      :closable="false"
      style="margin-bottom: 16px"
    />

    <!-- 功能卡片 -->
    <el-row :gutter="20">
      <!-- 学生信息查询 - 仅管理员 -->
      <el-col :span="8" v-if="role === 'admin'">
        <el-card shadow="hover" style="cursor: pointer;" @click="goToStudentQuery">
          <div style="text-align: center; padding: 20px;">
            <el-icon size="48" style="color: #409eff; margin-bottom: 16px;">
              <UserFilled />
            </el-icon>
            <h3>学生信息查询</h3>
            <p style="color: #666;">查询和管理学生档案信息，支持多条件查询和Excel导出</p>
          </div>
        </el-card>
      </el-col>

      <!-- 课程成绩查询 - 教师和管理员 -->
      <el-col :span="8" v-if="role === 'teacher' || role === 'admin'">
        <el-card shadow="hover" style="cursor: pointer;" @click="goToTeacherQuery">
          <div style="text-align: center; padding: 20px;">
            <el-icon size="48" style="color: #67c23a; margin-bottom: 16px;">
              <Document />
            </el-icon>
            <h3>课程成绩查询</h3>
            <p style="color: #666;">查看所授课程的学生选课和成绩情况，包含成绩统计分析</p>
          </div>
        </el-card>
      </el-col>

      <!-- 个人成绩查询 - 学生和管理员 -->
      <el-col :span="8" v-if="role === 'student' || role === 'admin'">
        <el-card shadow="hover" style="cursor: pointer;" @click="goToStudentScoreQuery">
          <div style="text-align: center; padding: 20px;">
            <el-icon size="48" style="color: #e6a23c; margin-bottom: 16px;">
              <Trophy />
            </el-icon>
            <h3>我的成绩查询</h3>
            <p style="color: #666;">查看个人选课记录和成绩，包含GPA计算和成绩分析</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快速统计 -->
    <el-card shadow="never" style="margin-top: 20px;" v-if="showQuickStats">
      <template #header>快速统计</template>
      <el-row :gutter="20">
        <el-col :span="6" v-if="role === 'admin'">
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #409eff;">{{ quickStats.totalStudents }}</div>
            <div style="color: #666;">学生总数</div>
          </div>
        </el-col>
        <el-col :span="6" v-if="role === 'teacher' || role === 'admin'">
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #67c23a;">{{ quickStats.totalCourses }}</div>
            <div style="color: #666;">课程总数</div>
          </div>
        </el-col>
        <el-col :span="6" v-if="role === 'student' || role === 'admin'">
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #e6a23c;">{{ quickStats.myScores }}</div>
            <div style="color: #666;">已录入成绩</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #f56c6c;">{{ quickStats.currentSemester }}</div>
            <div style="color: #666;">当前学期</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 功能说明 -->
    <el-card shadow="never" style="margin-top: 20px;">
      <template #header>功能说明</template>
      <el-timeline>
        <el-timeline-item 
          timestamp="学生信息查询" 
          placement="top"
          v-if="role === 'admin'"
        >
          <el-card shadow="never">
            <p>管理员可以查询所有学生的档案信息，支持按姓名、班级、专业、状态等条件筛选，并可导出Excel报表。</p>
          </el-card>
        </el-timeline-item>
        
        <el-timeline-item 
          timestamp="课程成绩查询" 
          placement="top"
          v-if="role === 'teacher' || role === 'admin'"
        >
          <el-card shadow="never">
            <p>教师可以查看自己授课的所有课程，查询选课学生的成绩情况，包含平均分、及格率等统计信息。</p>
          </el-card>
        </el-timeline-item>
        
        <el-timeline-item 
          timestamp="个人成绩查询" 
          placement="top"
          v-if="role === 'student' || role === 'admin'"
        >
          <el-card shadow="never">
            <p>学生可以查看自己的所有选课记录和成绩，包含GPA计算、成绩分析和学期统计信息。</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStoreHook } from "@/store/modules/user";
import { UserFilled, Document, Trophy } from "@element-plus/icons-vue";

const router = useRouter();
const userStore = useUserStoreHook();
const role = userStore.roles[0];

// 快速统计数据
const quickStats = ref({
  totalStudents: 0,
  totalCourses: 0,
  myScores: 0,
  currentSemester: "2024-2025-1"
});

// 是否显示快速统计
const showQuickStats = computed(() => {
  return role === 'admin' || role === 'teacher' || role === 'student';
});

// 获取角色描述
function getRoleDescription(): string {
  switch (role) {
    case 'admin':
      return "管理员权限：可以查询所有学生信息、课程成绩，以及导出各类报表";
    case 'teacher':
      return "教师权限：可以查询自己授课的课程选课情况和学生成绩";
    case 'student':
      return "学生权限：可以查询自己的选课记录和成绩信息";
    default:
      return "请联系管理员获取相应权限";
  }
}

// 路由跳转函数
function goToStudentQuery() {
  router.push('/school/report/student-query');
}

function goToTeacherQuery() {
  router.push('/school/report/teacher-query');
}

function goToStudentScoreQuery() {
  router.push('/school/report/student-score-query');
}

// 页面加载时的初始化
onMounted(() => {
  // 这里可以加载一些快速统计数据
  // 实际项目中可以调用API获取统计信息
  console.log(`当前用户角色: ${role}`);
});
</script>

<style scoped>
.el-card {
  transition: all 0.3s ease;
}

.el-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}
</style>