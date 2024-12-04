<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElButton, ElTable, ElTableColumn, ElCheckbox, ElInput, ElMessageBox, ElMessage } from 'element-plus';
import { localForage } from "@/utils/localforage/index";
import {message} from "@/utils/message"

defineOptions({
  name: 'roleMng'
});

// 模拟角色数据
const roles = ref([
  { id: 1, roleName: '管理员', checked: false },
  { id: 2, roleName: '普通用户', checked: false },
  { id: 3, roleName: '访客', checked: false },
]);

// 用于搜索角色的关键字
const searchQuery = ref('');

// 根据搜索关键字过滤角色数据
const filteredRoles =  computed(() => {
   console.log("搜索关键字", searchQuery.value)
});

// 增、查、删的操作
const handleAddRole = () => {
  ElMessage.success('添加角色');
};

const handleModifyPermissions = (role: any) => {
  ElMessage.success(`修改 ${role.roleName} 的权限`);
};

const handleModifyRoleInfo = (role: any) => {
  ElMessage.success(`修改 ${role.roleName} 的信息`);
};

const handleDeleteRole = (role: any) => {
  ElMessageBox.confirm(`确定删除角色 ${role.roleName} 吗?`, '删除确认', {
    type: 'warning',
  }).then(() => {
    ElMessage.success(`角色 ${role.roleName} 删除成功`);
    // 删除操作
    roles.value = roles.value.filter(r => r.id !== role.id);
  });
};

const handleDeleteSelectedRoles = () => {
  console.log("删除选中角色")
 };

</script>

<template>
  <div class="role-management">
    <!-- 增查删按钮和搜索框 -->
    <div class="toolbar">
      <div class="search-box">
        <ElInput
          v-model="searchQuery"
          placeholder="搜索角色"
          prefix-icon="el-icon-search"
          clearable
          class="search-input"
        />
      </div>
      <div class="action-buttons">
        <ElButton type="success" @click="handleAddRole">查询角色</ElButton>
        <ElButton type="primary" @click="handleAddRole">新增角色</ElButton>
        <ElButton type="danger" @click="handleDeleteSelectedRoles">删除选中角色</ElButton>
      </div>
    </div>

    <!-- 角色列表 -->
    <ElTable :data="filteredRoles" style="width: 100%; margin-top: 20px;">
      <ElTableColumn type="index" label="序号" width="80"></ElTableColumn>
      <ElTableColumn type="selection" label="选择" width="100"></ElTableColumn>
      <ElTableColumn prop="roleName" label="角色名称" width="200"></ElTableColumn>
      <ElTableColumn label="操作" width="300">
        <template #default="{ row }">
          <ElButton size="small" type="primary" @click="handleModifyPermissions(row)">修改角色权限</ElButton>
          <ElButton size="small" type="info" @click="handleModifyRoleInfo(row)">修改角色信息</ElButton>
          <ElButton size="small" type="danger" @click="handleDeleteRole(row)">删除角色</ElButton>
        </template>
      </ElTableColumn>
    </ElTable>
  </div>
</template>

<style scoped>
.role-management {
  padding: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.search-box {
  flex: 1;
  max-width: 300px;
}

.search-input {
  width: 100%;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.el-button {
  margin-right: 10px;
}

.el-table {
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.el-table th {
  background-color: #f4f7fc;
}

.el-table-column {
  text-align: center;
}

.el-table th, .el-table td {
  padding: 12px 15px;
}

.el-table .el-button {
  margin-right: 5px;
}
</style>
