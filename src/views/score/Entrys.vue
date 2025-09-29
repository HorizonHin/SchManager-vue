<template>
  <div>
    <h2>成绩录入</h2>

    <el-select v-model="selectedCourse" placeholder="选择课程" style="width:220px">
      <el-option v-for="c in courses" :key="c.id" :label="c.name" :value="c.id"/>
    </el-select>

    <el-table v-if="selectedCourse" :data="students" border style="margin-top:16px">
      <el-table-column type="index" label="序号" width="60"/>
      <el-table-column prop="id" label="学号"/>
      <el-table-column prop="name" label="姓名"/>
      <el-table-column label="成绩">
        <template #default="scope">
          <!-- 学生不能编辑成绩，注销学生也不能编辑 -->
          <el-input 
            v-model="scope.row.score" size="small" style="width:80px"
            :readonly="role==='student' || scope.row.status==='注销'"
          />
        </template>
      </el-table-column>
    </el-table>

    <el-button 
      v-if="selectedCourse" 
      type="primary" style="margin-top:16px" 
      @click="submit" 
      :disabled="role==='student'">
      提交成绩
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useUserStoreHook } from "@/store/modules/user";

const userStore = useUserStoreHook();
const role = userStore.roles[0]; // "teacher"|"student"|"admin"

const courses = ref([
  { id: "C001", name: "高等数学上" },
  { id: "C002", name: "大学英语1" }
]);
const selectedCourse = ref<string|null>(null);

const courseStudents: Record<string, any[]> = {
  C001: [
    { id: "2023001", name: "小明", score: "", status: "在读" },
    { id: "2023002", name: "小红", score: "", status: "在读" }
  ],
  C002: [
    { id: "2023003", name: "小刚", score: "", status: "在读" },
    { id: "2023004", name: "小芳", score: "", status: "在读" }
  ]
};

const students = ref<any[]>([]);

watch(selectedCourse, (val) => {
  if (val && courseStudents[val]) {
    const saved = localStorage.getItem("grades_" + val);
    students.value = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(courseStudents[val]));
  } else students.value = [];
});

function submit() {
  if (selectedCourse.value) {
    localStorage.setItem("grades_" + selectedCourse.value, JSON.stringify(students.value));
    alert("成绩已提交！");
  }
}
</script>