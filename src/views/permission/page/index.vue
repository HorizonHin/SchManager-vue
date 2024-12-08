<script setup lang="ts">
import { initRouter } from "@/router/utils";
import { is, storageLocal } from "@pureadmin/utils";
import { type CSSProperties, ref, computed, onMounted, defineOptions,reactive } from "vue";
import { useUserStoreHook } from "@/store/modules/user";
import { usePermissionStoreHook } from "@/store/modules/permission";
import { ElTree, ElButton, ElMessage, ElMessageBox, ElFormItem } from "element-plus";
import {
  getPermissions, deletePermission as deletePermissionApi, updatePermission,
  addPermissions as addPermissionsApi 
} from "@/api/permission";
import { Permission } from "@/model/pojos";
import { ChildProcess } from "child_process";
import { message } from "@/utils/message";


defineOptions({
  name: "PermissionPage"
});

const treeRef = ref<InstanceType<typeof ElTree>>();
const expandedKeys = ref([]);  // 默认展开的节点
const checkedKey = ref();   // 默认选中的节点
const handleNodeClick = () => {
  console.log("当前选中的节点", treeRef.value.getCurrentNode());
 };

const permissions = ref([]);
const newPermission = reactive<Permission[]>([Permission()]);

const treeProps = {
  originNodeData: {},
  isAddChild: ref(false),
  newChild : ref({}),
  isEdit: ref(false),
  label: "label",
  children: "children",
};
const isAddRoot = ref(false);
function generateChildNode(parentNode: Permission) {
  // 定义子节点的数据结构
  const childNode = Permission();
  childNode.id = null;
  childNode.parentId = parentNode.id;
  childNode.code = parentNode.code + "_child";
  childNode.label = parentNode.label + "的子节点";
  childNode.path = parentNode.path + "/child";
  childNode.url = parentNode.url + "/child";
  childNode.value = parentNode.value + ":child";
  return childNode;
}
// 新增子节点
async function submitNewChild (newChild: Permission, parentNode: any)  {
      // 调用 addPermissions 并处理返回的 Promise
      await addPermissionsApi([newChild]).then(res => {
        if (res.success) {
          message("新增子节点成功",{ type: "success" });
          treeRef.value.append(newChild,parentNode );
        } else {      
          ElMessage.error("新增子节点失败");
        }
      }).catch(err => {
        // 捕获失败的情况
        ElMessage.error("新增子节点失败: " + err.message);
      });
}

// 获取权限数据
const fetchPermissions = async () => {
  try {
    const res = await getPermissions();
    if (res.success) {
      permissions.value = res.data;
    } else {
      ElMessage.error("获取权限树失败");
    }
  } catch (error) {
    ElMessage.error("获取权限树数据失败");
  }
};

// 编辑权限
const submitEditedPermission = async (nodeData: any, node: any) => {
  // 调用 updatePermission 并处理返回的 Promise
  await updatePermission(nodeData).then(res => {
    if (res.success) {
      ElMessage.success("修改权限成功");
      node.isEdit = false;
      node.data = nodeData;
      node.originNodeData = {};
    } else {      
      ElMessage.error("修改权限失败");
    }
  }).catch(err => {
    // 捕获失败的情况
    ElMessage.error("修改权限失败: " + err.message);
  });
};


const addPermissions = async (data : Permission[]) => {
  // 实现新增逻辑
  addPermissionsApi(data).then(res => {
    if (res.success) {
      ElMessage.success("新增权限成功");
      fetchPermissions();
    } else {
      ElMessage.error("新增权限失败");
    }
  });
  console.log("新增权限:", data[0]);
};

// 删除节点权限
const deletePermission = async (ids : number[]) => {
    ElMessageBox.confirm("确认删除吗?","warning",  {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      deletePermissionApi(ids).then(res => {
        if (res.success) {
          ElMessage.success("删除权限成功");
          fetchPermissions();
        } else {
          ElMessage.error("删除权限失败");
        }
      });
    }); 
};

// 页面加载时获取权限数据
onMounted(() => {
  fetchPermissions();
});


// const elStyle = computed((): CSSProperties => {
//   return {
//     width: "85vw",
//     justifyContent: "start"
//   };
// });

// const username = ref(useUserStoreHook()?.username);

// const options = [
//   {
//     value: "admin",
//     label: "管理员角色"
//   },
//   {
//     value: "common",
//     label: "普通角色"
//   }
// ];

// function onChange() {
//   useUserStoreHook()
//     .loginByUsername({ username: username.value, password: "admin123" })
//     .then(res => {
//       if (res.success) {
//         storageLocal().removeItem("async-routes");
//         usePermissionStoreHook().clearAllCachePage();
//         initRouter();
//       }
//     });
// }
</script>

<template>
  <div>
    <el-card shadow="never">
    <template #header>
        <div class="card-header">
          <span><b>权限树</b></span>
         <span class="float-right">
           <el-button type="primary" @click="fetchPermissions">刷新</el-button>
          <el-button type="success" @click="isAddRoot = true">新增根节点</el-button>
          <el-button type="danger" @click="message('删除权限成功')">删除</el-button>
         </span>
        </div>
      </template>

      <el-dialog
    v-model="isAddRoot"
    title="新增根节点"
    width="500"
    :before-close="()=>isAddRoot = false"
  >
    <el-form :data="newPermission[0]" label-width="80px">

      <el-form-item label="权限value" prop="value">
        <el-input v-model="newPermission[0].value"></el-input>
      </el-form-item>

      <el-form-item label="权限code" prop="code">
        <el-input v-model="newPermission[0].code"></el-input>
      </el-form-item>

          <el-form-item label="权限label" prop="code">
        <el-input v-model="newPermission[0].label"></el-input>
           </el-form-item>

      <el-form-item label="权限路径" prop="url">
        <el-input v-model="newPermission[0].url" placeholder="请输入图标 URL"></el-input>
      </el-form-item>

      <el-form-item label="图标" prop="icon">
        <el-input v-model="newPermission[0].icon" placeholder="请输入图标 URL"></el-input>
      </el-form-item>
      
      <el-form-item label="权限path" prop="path"> 
        <el-input v-model="newPermission[0].path"></el-input>
      </el-form-item>

      <ElFormItem label="备注" prop="remark">
        <el-input v-model="newPermission[0].remark" type="textarea" placeholder="请输入备注"></el-input>
      </ElFormItem>

      <ElFormItem label="权限类型" prop="type">
          <el-select v-model="newPermission[0].type" placeholder="选择权限类型" style="width: 100%;">
            <el-option label="类型 1" :value="1"></el-option>
            <el-option label="类型 2" :value="2"></el-option>
            <el-option label="类型 3" :value="3"></el-option>
          </el-select>
      </ElFormItem>

      <ElFormItem label="排序编号" prop="orderNum">
        <el-input-number v-model="newPermission[0].orderNum" :min="0" style="width: 100%;"></el-input-number>
      </ElFormItem>
     
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="isAddRoot = false">Cancel</el-button>
        <el-button type="primary" @click="addPermissions(newPermission)">
          确认
        </el-button>
      </div>
    </template>

  </el-dialog>
      
      <el-tree
        auto-expand-parent
        highlight-current
         ref="treeRef"
        :data="permissions"
        :props="treeProps"
        node-key="id"
        expand-on-click-node
        show-checkbox
        accordion
        :default-expanded-keys="expandedKeys"
        @node-click="handleNodeClick"
        :check-strictly="true"
      >
      <template #default="{ node, data }" >
        <span >{{ node.label }}</span>
           <!-- 编辑按钮 -->
        <el-button
            size="small"
            type="primary"
            @click="node.isEdit = true, node.oroginNodeData = {...data };"
            style="margin-left: 10px"
          >
            编辑
       </el-button>
           <!-- 编辑节点对话框 -->
   <el-dialog
    v-model="node.isEdit"
    title="编辑节点"
    width="500"
    :before-close="()=>node.isEdit = false"
  >
  <el-form :model="data"  label-width="120px">
    <!-- 权限 Value -->
    <el-form-item label="权限 Value" prop="value">
      <el-input v-model="data.value"></el-input>
    </el-form-item>
    
    <!-- 权限 Code -->
    <el-form-item label="权限 Code" prop="code">
      <el-input v-model="data.code"></el-input>
    </el-form-item>

    <!-- 图标 -->
    <el-form-item label="图标" prop="icon">
      <el-input v-model="data.icon" placeholder="请输入图标 URL"></el-input>
    </el-form-item>

    <!-- 是否删除 -->
    <el-form-item label="是否删除" prop="isDelete">
      <el-radio-group v-model="data.isDelete">
        <el-radio :label="0">未删除</el-radio>
        <el-radio :label="1">已删除</el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- 权限标签 -->
    <el-form-item label="权限标签" prop="label">
      <el-input v-model="data.label"></el-input>
    </el-form-item>

    <!-- 是否展开 -->
    <el-form-item label="是否展开" prop="open">
      <el-switch v-model="data.open"></el-switch>
    </el-form-item>

    <!-- 排序编号 -->
    <el-form-item label="排序编号" prop="orderNum">
      <el-input-number v-model="data.orderNum" :min="0" style="width: 100%;"></el-input-number>
    </el-form-item>

    <!-- 父权限 ID -->
    <el-form-item label="父权限 ID" prop="parentId">
      <el-input v-model="data.parentId" :min="0" style="width: 100%;"></el-input>
    </el-form-item>

    <!-- 权限路径 -->
    <el-form-item label="权限路径" prop="path">
      <el-input v-model="data.path"></el-input>
    </el-form-item>

    <!-- 备注 -->
    <el-form-item label="备注" prop="remark">
      <el-input v-model="data.remark" type="textarea"></el-input>
    </el-form-item>

    <!-- 权限类型 -->
    <el-form-item label="权限类型" prop="type">
      <el-select v-model="data.type" placeholder="选择权限类型" style="width: 100%;">
        <el-option label="类型 1" :value="1"></el-option>
        <el-option label="类型 2" :value="2"></el-option>
        <el-option label="类型 3" :value="3"></el-option>
      </el-select>
    </el-form-item>

    <!-- URL -->
    <el-form-item label="权限 URL" prop="url">
      <el-input v-model="data.url"></el-input>
    </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="node.isEdit = false;node.data = node.oroginNodeData;node.originNodeData = {};
        ">取消</el-button>
        <el-button type="primary" @click="submitEditedPermission(data, node)">
          确认
        </el-button>
      </div>
    </template>

  </el-dialog>

            <!-- 增加子节点按钮 -->
        <el-button
          size="small"
          type="success"
          @click="node.isAddChild = true, node.newChild = generateChildNode(data)"
          style="margin-left: 10px"
        >
          增加子节点
        </el-button>
        <!-- 增加子节点对话框 -->
  <el-dialog
    v-model="node.isAddChild"
    title="新增子节点"
    width="500"
    :before-close="()=>node.isAddChild = false"
  >
<el-form :model="node.newChild" label-width="120px"> 
    <!-- 权限 Value -->
    <el-form-item label="权限 Value" prop="value">
      <el-input v-model="node.newChild.value"></el-input>
    </el-form-item>

    <!-- 权限 Code -->
    <el-form-item label="权限 Code" prop="code">
      <el-input v-model="node.newChild.code"></el-input>
    </el-form-item>

    <!-- 图标 -->
    <el-form-item label="图标" prop="icon">
      <el-input v-model="node.newChild.icon" placeholder="请输入图标 URL"></el-input>
    </el-form-item>

    <!-- 是否删除 -->
    <el-form-item label="是否删除" prop="isDelete">
      <el-radio-group v-model="node.newChild.isDelete">
        <el-radio :label="0">未删除</el-radio>
        <el-radio :label="1">已删除</el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- 权限标签 -->
    <el-form-item label="权限标签" prop="label">
      <el-input v-model="node.newChild.label"></el-input>
    </el-form-item>

    <!-- 是否展开 -->
    <el-form-item label="是否展开" prop="open">
      <el-switch v-model="node.newChild.open"></el-switch>
    </el-form-item>

    <!-- 排序编号 -->
    <el-form-item label="排序编号" prop="orderNum">
      <el-input-number v-model="node.newChild.orderNum" :min="0" style="width: 100%;"></el-input-number>
    </el-form-item>

    <!-- 父权限 ID -->
    <el-form-item label="父权限 ID" prop="parentId">
      <el-input v-model="data.id" :min="0" style="width: 100%;" disabled></el-input>
    </el-form-item>

    <!-- 权限路径 -->
    <el-form-item label="权限路径" prop="path">
      <el-input v-model="node.newChild.path"></el-input>
    </el-form-item>

    <!-- 备注 -->
    <el-form-item label="备注" prop="remark">
      <el-input v-model="node.newChild.remark" type="textarea"></el-input>
    </el-form-item>

    <!-- 权限类型 -->
    <el-form-item label="权限类型" prop="type">
      <el-select v-model="node.newChild.type" placeholder="选择权限类型" style="width: 100%;">
        <el-option label="类型 1" :value="1"></el-option>
        <el-option label="类型 2" :value="2"></el-option>
        <el-option label="类型 3" :value="3"></el-option>
      </el-select>
    </el-form-item>

    <!-- URL -->
    <el-form-item label="权限 URL" prop="url">
      <el-input v-model="node.newChild.url"></el-input>
    </el-form-item>
</el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="node.isAddChild = false;node.newChild = {}">取消</el-button>
        <el-button type="primary" @click="submitNewChild(node.newChild, node)">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>

        <!-- 删除按钮 -->
          <el-button
            size="small"
            type="danger"
            @click="deletePermission([data.id])"
            style="margin-left: 10px"
          >
            删除
          </el-button>
        </template>
      </el-tree>
    </el-card>
  </div>
</template>