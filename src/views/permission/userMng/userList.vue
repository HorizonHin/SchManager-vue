
<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import type { FormInstance } from "element-plus";
import {
  addUser, selectUsers, getAllRole, selectRoleByUsername as selectRoleByUsernameApi,
  updateUserRole
} from '@/api/admin';
import { message } from '@/utils/message';



defineOptions({
  name: "userList"
});

// 数据和状态
const users = ref([
  { id: 1, username: 'johndoe', real_name: 'John Doe', email: 'john@example.com', gender: '男', role: 'admin' },
]);

const roles = ref([]);
const rolesOfUser = ref([]);

const curUser = ref(" ");

async function selectAllRoles() {
  getAllRole().then(res => {
    if (res.success) {
      roles.value = res.data.map(role => ({ 
        key: role,
        label: role
    }));
  
      message('查询角色成功');
    } else {
      message('查询角色失败');
    }
  }).catch((error) => {      
    console.error('查询角色请求失败:', error);
    if (error.response) {
      console.error('API Error:', error.response.data);
    } else if (error.message) {
      console.error('Request Error:', error.message);
    }
    message('查询角色失败');
  });    
} 
async function selectRoleByUsername(username: string) {
  selectRoleByUsernameApi(username).then(res => {
    if (res.success) {
      rolesOfUser.value = res.data;
      console.log(res.data);      
    } else {      
      console.error('查询角色失败');          
    }
  }).catch((error) => {
    console.error('查询角色请求失败:', error);
    if (error.response) {
      console.error('API Error:', error.response.data);
    } else if (error.message) {
      console.error('Request Error:', error.message);
    }
    message('查询角色失败');
  });
} 

const selectAllUsers = (data: any | undefined) => { 
  selectUsers(data).then(res => {
    if (res.success) {
      users.value = res.data;
      message('查询用户成功');
    } else {
      message('查询用户失败');
    }
  }).catch((error) => {
    console.error('查询用户请求失败:', error);
    if (error.response) {
      console.error('API Error:', error.response.data);
    } else if (error.message) {
      console.error('Request Error:', error.message);
    }
    message('查询用户失败');
  });
};

const searchQuery = ref('');
const addUserDialogVisible = ref(false);

const addUserForm = ref<FormInstance>();
const newUser = reactive({
  username: '',
  password: '',
  email: '',
  role: ''
});


// 计算属性：根据搜索条件过滤用户列表
const filteredUsers = computed(() => {
  if (!searchQuery.value) {
    return users.value;
  }
  const query = searchQuery.value.toLowerCase();
  return users.value.filter(user =>
    user.username.toLowerCase().includes(query) ||
    user.real_name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query) ||
    user.gender.toLowerCase().includes(query)
  );
});

// 方法：查询用户
const searchUser = () => {
  console.log('Searching for users with query:', searchQuery.value);
}

// 方法：重置新增用户表单
const resetAddUserForm = () => {
  newUser.username = '';
  newUser.password = '';
  newUser.email = '';
  newUser.role = '';
};

// 方法：提交新增用户
const submitNewUser = async (formEl: FormInstance | undefined) => {
  // 表单验证
  if (!formEl) {
    message('未传入表单实例');
    return;
  }

  try {
    // 使用 await 等待 validate 返回
    const valid = await formEl.validate();
    if (valid) {
      // 执行新增用户操作
      addUser(newUser).then(res => {
        if (res.success) {
          addUserDialogVisible.value = false;
          resetAddUserForm();
          selectAllUsers(undefined);
          message('新增用户成功');
        } else {
          message('新增用户失败');
        }
      }).catch((error) => {
        console.error('新增用户请求失败:', error);
        if (error.response) {
      console.error('API Error:', error.response.data);
    } else if (error.message) {
      console.error('Request Error:', error.message);
    }
        message('新增用户失败');
      });
    } else {
      message('表单验证失败');
    }
  } catch (error) {
    console.error('表单验证失败:', error);
    message('表单验证失败');
  }
};


// 方法：修改角色

const isModifyRole = ref(false);
const modifyRole = (user: string) => {
  console.log('Modifying role for:', user);
  const newRole: string = rolesOfUser.value.join(',');
  updateUserRole({ username: user, newRole: newRole }).then(res => {
    if (res.success) {
      message('修改角色成功');
      selectAllRoles();
      selectRoleByUsername(user);
    } else {
      message('修改角色失败');
    }
  }).catch((error) => {
    console.error('修改角色请求失败:', error);
    if (error.response) {
      console.error('API Error:', error.response.data);
    } else if (error.message) {
      console.error('Request Error:', error.message);
    }
    message('修改角色失败');
  });
};

// 方法：修改用户信息
const modifyUser = (user) => {
  console.log('Modifying user information for:', user.username);
  // 路由跳转到修改用户信息页面（略）
};

// 方法：删除用户
const deleteUser = (user) => {
  console.log('Deleting user:', user.username);
  // 调用API删除用户（略）
};

onMounted(() => { 
  selectAllUsers(undefined);
  selectAllRoles();
});
</script>


<template>
  <div class="container">
    <!-- Search and Add Section -->
    <div class="row">
      <div class="col-md-6">
        <el-input
          v-model="searchQuery"
          placeholder="请输入用户名、性别或邮箱进行搜索"
          clearable
          suffix-icon="el-icon-search"
          @input="searchUser"
        />
      </div>
      <div>
        <el-button type="success" @click="addUserDialogVisible = true">新增用户</el-button>
        <el-button type="danger" @click="deleteUser">批量删除</el-button>
      </div>
    </div>

    <!-- User List Table -->
    <el-table :data="filteredUsers" style="width: 100%" stripe  >
      <el-table-column label="#" type="index" width="80" />
      <el-table-column prop="username" label="账号" />
      <el-table-column prop="real_name" label="名称" />
      <el-table-column prop="email" label="邮箱地址" />
      <el-table-column label="操作" width="300">
        <template #default="{ row }">
          <el-button size="small" type="warning" @click="()=> {
        selectRoleByUsername(row.username);
        curUser = row.username;
          isModifyRole = true;
          
          }">修改角色</el-button>

          <el-button size="small" type="primary" @click="modifyUser(row)">修改信息</el-button>
          <el-button size="small" type="danger" @click="deleteUser(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- No Data Row -->
    <el-empty v-if="filteredUsers.length === 0" description="没有找到用户" />

    <!-- 修改用户角色 Dialog -->
    <el-dialog
    :modal="false"
    v-model="isModifyRole"
    :before-close="() => { isModifyRole = false }"
  >
    <p >当前用户为：{{ curUser }}</p>
     <el-transfer
     v-model="rolesOfUser"
     :data="roles"
     :titles="['所有角色', '当前用户角色']"
    filterable
    filter-placeholder="角色搜索"
  />
  <br>
  <p>{{ rolesOfUser }}</p>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="isModifyRole = false">取消</el-button>
        <el-button type="primary" @click="modifyRole(curUser)">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>

    <!-- Add User Dialog -->
  <el-dialog
  title="新增用户"
  v-model="addUserDialogVisible"
  width="50%"
  @close="resetAddUserForm"
>
  <el-form :model="newUser" ref="addUserForm" label-width="100px">
    <el-form-item label="账号" prop="username" :rules="[{ required: true, message: '请输入账号名', trigger: 'blur' }]">
      <el-input v-model="newUser.username" placeholder="请输入账号名" />
    </el-form-item>

    <el-form-item label="邮箱地址" prop="email" :rules="[{ required: true, message: '请输入邮箱地址', trigger: 'blur' }]">
      <el-input v-model="newUser.email" placeholder="请输入邮箱地址" />
    </el-form-item>

    <el-form-item label="角色" prop="role" :rules="[{ required: true, message: '请选择角色', trigger: 'change' }]">
      <el-select v-model="newUser.role" placeholder="请选择角色">
        <el-option label="管理员" value="admin" />
        <el-option label="普通用户" value="common" />
      </el-select>
    </el-form-item>

    <el-form-item label="密码" prop="password" :rules="[ 
      { required: true, message: '请输入密码', trigger: 'blur' },
      { pattern: /^[a-zA-Z0-9]{8,18}$/, message: '密码必须为8-18位字母或数字', trigger: 'blur' }
    ]">
      <el-input v-model="newUser.password" type="password" placeholder="请输入密码" />
    </el-form-item>
  </el-form>

  <div class="dialog-footer">
    <el-button @click="addUserDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="submitNewUser(addUserForm)">确 定</el-button>
  </div>
</el-dialog>

  </div>
</template>


<style scoped>
.container {
  margin-top: 20px;
}
</style>
