<template>
  <div>
    <h2>学生信息查询</h2>
    
    <!-- 查询条件 -->
    <el-card shadow="never" style="margin-bottom: 16px">
      <template #header>查询条件</template>
      <el-form :model="queryForm" inline>
        <el-form-item label="学号">
          <el-input 
            v-model="queryForm.username" 
            placeholder="请输入学号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input 
            v-model="queryForm.realName" 
            placeholder="请输入学生姓名"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input 
            v-model="queryForm.email" 
            placeholder="请输入邮箱"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="性别">
          <el-select 
            v-model="queryForm.gender" 
            placeholder="请选择性别"
            clearable
            style="width: 120px"
          >
            <el-option label="女" :value="0" />
            <el-option label="男" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select 
            v-model="queryForm.isEnabled" 
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="在读" :value="true" />
            <el-option label="注销" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery" :loading="loading.query">
            查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleExport" :loading="loading.export">
            导出Excel
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 查询结果 -->
    <el-table 
      :data="studentList" 
      border 
      style="margin-bottom: 16px"
      :loading="loading.query"
      v-loading="loading.query"
    >
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="username" label="学号" width="120" />
      <el-table-column prop="realName" label="姓名" width="120" />
      <el-table-column prop="nickName" label="昵称" width="120" />
      <el-table-column label="性别" width="80">
        <template #default="scope">
          <span>{{ getGenderText(scope.row.gender) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="email" label="邮箱" width="180" />
      <el-table-column prop="phone" label="电话" width="130" />
      <el-table-column prop="mobile" label="手机" width="130" />
      <el-table-column label="状态" width="80">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.isEnabled)" size="small">
            {{ getStatusText(scope.row.isEnabled) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="头像" width="80">
        <template #default="scope">
          <el-avatar v-if="scope.row.avatar" :src="scope.row.avatar" size="small" />
          <span v-else style="color: #999;">无</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.size"
      :page-sizes="[10, 20, 50, 100]"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useUserStoreHook } from "@/store/modules/user";
import { message } from "@/utils/message";
import { 
  queryStudentInfo, 
  exportStudentInfo, 
  unwrap, 
  type StudentInfoDto, 
  type StudentQueryCondition,
  type PageResult
} from "@/api/report";

import { utils, writeFile } from "xlsx";

const userStore = useUserStoreHook();
const role = userStore.roles[0];

// 查询表单
const queryForm = reactive<StudentQueryCondition>({
  username: "",
  realName: "",
  email: "",
  gender: undefined,
  isEnabled: undefined,
  pageNum: 1,
  pageSize: 20
});

// 学生列表数据
const studentList = ref<StudentInfoDto[]>([]);

// 分页信息
const pagination = reactive({
  current: 1,
  size: 20,
  total: 0
});

// 加载状态
const loading = reactive({
  query: false,
  export: false
});

// 状态和性别相关函数
function getStatusText(isEnabled: boolean): string {
  return isEnabled ? "在读" : "注销";
}

function getStatusType(isEnabled: boolean): "success" | "warning" | "info" | "danger" {
  return isEnabled ? "success" : "danger";
}

function getGenderText(gender?: number): string {
  if (gender === undefined || gender === null) return "未知";
  return gender === 1 ? "男" : "女";
}

// 查询学生信息
async function handleQuery() {
  if (role !== 'admin') {
    message("只有管理员可以查询学生信息", { type: "warning" });
    return;
  }

  loading.query = true;
  try {
    const condition = {
      ...queryForm,
      pageNum: pagination.current,
      pageSize: pagination.size
    };
    
    const result: PageResult<StudentInfoDto> = await unwrap(queryStudentInfo(condition));
    studentList.value = result.records;
    pagination.total = result.total;
    pagination.current = result.current;
    pagination.size = result.size;
  } catch (error) {
    console.error("查询学生信息失败:", error);
  } finally {
    loading.query = false;
  }
}

// 重置查询条件
function handleReset() {
  Object.assign(queryForm, {
    username: "",
    realName: "",
    email: "",
    gender: undefined,
    isEnabled: undefined
  });
  pagination.current = 1;
  handleQuery();
}

// 导出Excel
async function handleExport() {
  if (role !== 'admin') {
    message("只有管理员可以导出学生信息", { type: "warning" });
    return;
  }

  loading.export = true;
  try {
    // 使用前端xlsx库导出
    if (studentList.value.length === 0) {
      message("没有数据可导出", { type: "warning" });
      return;
    }

    // 准备导出数据
    const exportData = studentList.value.map(student => ({
      '学号': student.username,
      '姓名': student.realName,
      '昵称': student.nickName || '',
      '性别': getGenderText(student.gender),
      '邮箱': student.email || '',
      '电话': student.phone || '',
      '手机': student.mobile || '',
      '状态': getStatusText(student.isEnabled)
    }));

    // 创建工作表
    const worksheet = utils.json_to_sheet(exportData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "学生信息");
    
    // 导出文件
    const fileName = `学生信息表_${new Date().toISOString().slice(0, 10)}.xlsx`;
    writeFile(workbook, fileName);
    
    message("导出成功", { type: "success" });
  } catch (error) {
    console.error("导出失败:", error);
    message("导出失败", { type: "error" });
  } finally {
    loading.export = false;
  }
}

// 分页大小改变
function handleSizeChange(size: number) {
  pagination.size = size;
  pagination.current = 1;
  handleQuery();
}

// 当前页改变
function handleCurrentChange(current: number) {
  pagination.current = current;
  handleQuery();
}

// 页面加载时查询
onMounted(() => {
  if (role === 'admin') {
    handleQuery();
  } else {
    message("只有管理员可以访问此页面", { type: "warning" });
  }
});
</script>