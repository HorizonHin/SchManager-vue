<template>
  <div>
    <h2>学生信息与报表</h2>
    <el-input v-model="keyword" placeholder="输入学号或姓名" style="width:200px" />
    <el-button type="primary" @click="search">查询</el-button>

    <el-table :data="filtered" border style="margin-top:16px">
      <!-- 展开课程详情 -->
      <el-table-column type="expand">
        <template #default="scope">
          <el-table :data="scope.row.details" border size="small">
            <el-table-column prop="course" label="课程"/>
            <el-table-column prop="score" label="成绩"/>
          </el-table>
        </template>
      </el-table-column>

      <el-table-column prop="id" label="学号"/>
      <el-table-column prop="name" label="姓名"/>
      <el-table-column prop="status" label="状态"/>
      <el-table-column prop="courses" label="已选课程数"/>
      <el-table-column prop="average" label="平均成绩"/>
      <el-table-column label="操作" v-if="role!=='student'">
        <template #default="scope">
          <el-button 
            size="small" type="danger"
            :disabled="scope.row.status==='注销'"
            @click="logout(scope.row)"
          >
            注销
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useUserStoreHook } from "@/store/modules/user";

const userStore = useUserStoreHook();
const role = userStore.roles[0]; // 当前角色

const studentsBase = ref([
  { id: "2023001", name: "小明", status: "在读" },
  { id: "2023002", name: "小红", status: "在读" },
  { id: "2023003", name: "小芳", status: "注销" }
]);

const keyword = ref("");
const result = ref<any[]>([]);

function buildReport(stu:any) {
  const selected = JSON.parse(localStorage.getItem("selectedCourses_" + stu.id) || "[]");

  let total = 0, num = 0;
  const details:any[] = [];

  selected.forEach((c:any) => {
    const grades = JSON.parse(localStorage.getItem("grades_" + c.id) || "[]");
    const s = grades.find((x:any)=>x.id === stu.id);

    let score = "-";
    if (s && s.score) {
      score = s.score;
      total += parseFloat(s.score);
      num++;
    }
    details.push({ course: c.name, score });
  });

  return {
    ...stu,
    courses: selected.length,
    average: num > 0 ? (total / num).toFixed(1) : "-",
    details
  };
}

function search() {
  if (role === "student") {
    // 学生：只能看自己
    const stu = studentsBase.value.find((s) => s.id === "2023001"); // TODO:替换成真实登录ID
    result.value = stu ? [buildReport(stu)] : [];
  } else {
    // 老师、admin：看全部
    result.value = studentsBase.value.map(buildReport);
  }

  if (keyword.value) {
    result.value = result.value.filter((r) =>
      r.name.includes(keyword.value) || r.id.includes(keyword.value)
    );
  }
}

const filtered = computed(() => result.value);

function logout(row:any) {
  row.status = "注销";
  alert(row.name + " 已被注销！");
}
</script>