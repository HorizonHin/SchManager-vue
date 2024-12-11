<script setup lang="ts">
import { ref, computed, onMounted, h } from "vue";
import {
  ElButton,
  ElTable,
  ElTableColumn,
  ElCheckbox,
  ElInput,
  ElMessageBox,
  ElMessage
} from "element-plus";
import { localForage } from "@/utils/localforage/index";
import { message } from "@/utils/message";
import { getAllRole as selectRoleApi, addRole,deleteRole } from '@/api/admin';
import { getPermissions as getPermissionsApi,updRolePerm } from "@/api/permission";





defineOptions({
  name: "roleMng"
});

// 模拟角色数据
const roles = ref([{ id: null, roleName: '', checked: false, }]);
const selectRoles = async () => {
  selectRoleApi().then(res => {
    if (res.success) {
      const roleNames = res.data;
      roles.value = roleNames.map((roleName, index) => ({
        id: index + 1,
        roleName,
        checked: false
      }));
    }
    else {
      message("获取角色失败");
      console.error(res.msg);
    }
  }).catch(err => {
    message("获取角色发生错误");
    console.error(err);
  });
}

const allPermissionsRef = ref(null);

const treeProps = {};
const RolePermTreeRef = ref();

const permOfcurrentRoleRef = ref(null);
//角色权限ids
const IdsOfRolePerms = computed(() => { 
  const ids: number[] = [];
  if (!permOfcurrentRoleRef.value) {
    return ids;
   }
  const queue = [...permOfcurrentRoleRef.value]; // 使用队列存储待遍历的节点

  while (queue.length > 0) {
    const node = queue.shift(); // 取出队列中的第一个节点
    if (node.id) {
      ids.push(node.id); // 如果节点有 id，保存它
    }
    if (node.children && node.children.length > 0) {
      queue.push(...node.children); // 如果有子节点，将子节点添加到队列中
    }
  }
  return ids;
});

async function getPermissions(roleName?: string) {
  const res = await getPermissionsApi(roleName);
  if (res.success) {
    if (!roleName) {
    allPermissionsRef.value = res.data;
    }
    else {
      permOfcurrentRoleRef.value = res.data;
    }
  }
  else {
    message("获取权限失败");
    console.error(res.msg);
  }
}
// 用于搜索角色的关键字
const searchQuery = ref("");

// 根据搜索关键字过滤角色数据
const filteredRoles = computed(() => {
  console.log("搜索关键字", searchQuery.value);
  if (!searchQuery.value) 
    return roles.value;
  return roles.value.filter(role =>
    role.roleName.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// 增、查、删的操作
const handleAddRole = async () => {
  const newRoleName = newRoleNameRef.value;
    addRole(newRoleName).then(res => {
      if (res.success) {
        message("新增角色成功");
        // 刷新角色列表
        selectRoles();
      }
      else {
        message("新增角色失败");
        console.error(res.msg);
      }
    }).catch(err => {
      message("新增角色发生错误");
      console.error(err);
    });
};
//选中的权限
const selectedPermissions = computed(() => { 
  if (RolePermTreeRef.value) {
    console.log("选中的权限", selectedPermissions);
    return RolePermTreeRef.value.getCheckedKeys();
  }
  else {
    console.log("选中的权限", selectedPermissions);
    return [];
  }
});


function cancelHandlePermOfRole() {
    currentRoleName.value = "";
    permOfcurrentRoleRef.value = null;
  isPermOfRoleVisible.value = false;
    
 };
async function handlePermOfRole(roleName: string) {
  console.log(roleName,permOfcurrentRoleRef.value,allPermissionsRef.value,selectedPermissions.value);
  currentRoleName.value = roleName;
  if (!roleName) {
    message("用户名", { type: "error" });
    return;
  }
  if (!permOfcurrentRoleRef.value==null) {
    message("缺乏原权限");
    return;
  }
  if (!allPermissionsRef.value) {
    message("缺乏所有权限数据");
    return;
  }


const sortedSelectedPermissions = [...selectedPermissions.value].sort((a, b) => a - b);
const sortedIdsOfRolePerms = [...IdsOfRolePerms.value].sort((a, b) => a - b);

if (JSON.stringify(sortedSelectedPermissions) === JSON.stringify(sortedIdsOfRolePerms)) {
    console.log("selectedPermissions", sortedSelectedPermissions);
    console.log("IdsOfRolePerms", sortedIdsOfRolePerms);
    message("权限未修改");
    return;
}

  const PermsIds = selectedPermissions.value.join();
  console.log("权限ids", PermsIds);
  const res = await updRolePerm(currentRoleName.value, PermsIds);
  if (res.success) {
    message("修改权限成功");
    isPermOfRoleVisible.value = false;
    getPermissions();
    getPermissions(currentRoleName.value);
  }
  else {
    message("修改权限失败");
    console.error(res.msg);
  }
}

const isAddRole = ref(false);
const newRoleNameRef = ref({newRoleName:""});

const isPermOfRoleVisible = ref(false);
const currentRoleName = ref<string>("");
//根据·角色名称·修改权限
const handleModifyPermissions = (roleName: string) => {
  console.log("修改权限", roleName);
  getPermissions();
  getPermissions(roleName);
  currentRoleName.value = roleName;
  console.log("权限", permOfcurrentRoleRef.value);
  isPermOfRoleVisible.value = true;
};

const handleModifyRoleInfo = (role: any) => {
  ElMessage.success(`修改 ${role.roleName} 的信息`);
};

const handleDeleteRole = (roleName: string) => {
  ElMessageBox.confirm(`确定删除角色 ${roleName} 吗?`, "删除确认", {
    type: "warning"
  }).then(() => {
      deleteRole({roleName : roleName}).then(res => {
        if (res.success) {
          message("删除角色成功");
          // 刷新角色列表
          selectRoles();
        }
        else {
          message("删除角色失败");
          console.error(res.msg);
        }
      }).catch(err => {
        message("删除角色发生错误");
        console.error(err);
      });    
  });
};

const handleDeleteSelectedRoles = () => {
  console.log(roles.value);
  console.log("删除选中角色");
};

onMounted(() => {
   
  selectRoles();
});
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
        <ElButton type="success" @click="selectRoles">查询角色</ElButton>
        <ElButton type="primary" @click="isAddRole = true">新增角色</ElButton>
        <ElButton type="danger" @click="handleDeleteSelectedRoles"
          >删除选中角色</ElButton
        >
      </div>

      <!-- 新增角色弹窗 -->
         <el-dialog v-model="isAddRole" title="新增角色" width="500">
           <ElInput v-model="newRoleNameRef.newRoleName" placeholder="请输入角色名称" clearable />
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="isAddRole = false">取消</el-button>
        <el-button type="primary" @click="handleAddRole">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
    </div>

    <!-- 角色列表 -->
    <ElTable :data="filteredRoles" style="width: 100%; margin-top: 20px"
    highlight-current-row    ref="tableRef">
      <ElTableColumn type="index" label="序号" width="80"></ElTableColumn>

      <ElTableColumn type="selection" label="选择" width="100">

      </ElTableColumn>

      <ElTableColumn
        prop="roleName"
        label="角色名称"
        width="200"
      ></ElTableColumn>

      <ElTableColumn label="操作" width="300">
        <template #default="{ row }">
          <ElButton
            size="small"
            type="primary"
            @click="handleModifyPermissions(row.roleName)"
            >修改角色权限</ElButton
          >
   <!-- 角色权限树弹窗 -->
 <el-dialog
      title="权限树"
      :modal = "false"
      v-model="isPermOfRoleVisible"
      width="50%"
      @close="cancelHandlePermOfRole()"
    >
      <el-tree
         ref="RolePermTreeRef"
        :data="allPermissionsRef"
        :props="treeProps"
        :default-checked-keys="IdsOfRolePerms"
        :check-strictly="false"
        show-checkbox
        node-key="id"
        @check-change="()=>(selectedPermissions)"
      >
      </el-tree>

      <template #footer>
        <div class="dialog-footer">
        <el-button @click="cancelHandlePermOfRole()">取消</el-button>
        <el-button type="primary" @click="handlePermOfRole(row.roleName)">确定</el-button>
        </div>
      </template>
    </el-dialog>

          <ElButton size="small" type="info" @click="handleModifyRoleInfo(row)"
            >修改角色信息</ElButton
          >
          <ElButton size="small" type="danger" @click="handleDeleteRole(row.roleName)"
            >删除角色</ElButton
          >
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

.el-table th,
.el-table td {
  padding: 12px 15px;
}

.el-table .el-button {
  margin-right: 5px;
}
</style>
