 export type Permission = {
    id: number; // 权限ID
    code: string; // 权限代码
    createTime: string; // 创建时间，通常使用 ISO 8601 格式的字符串表示
    icon: string | null; // 图标，可能为空
    isDelete: number; // 是否删除，1为删除，0为未删除
    label: string | null; // 权限标签，可能为空
    open: boolean; // 是否展开，布尔类型
    orderNum: number | null; // 排序编号，可能为空
    parentId: number | null; // 父权限ID，可能为空
    parentName: string | null; // 父权限名称，可能为空
    path: string | null; // 权限路径，可能为空
    remark: string | null; // 备注，可能为空
    type: number | null; // 权限类型，可能为空
    updateTime: string; // 更新时间，通常使用 ISO 8601 格式的字符串表示
    url: string | null; // 权限URL，可能为空
    value: string; // 权限值
    children: Permission[]; // 子权限列表，类型为 `Permission` 数组
};
  
export function Permission(){
  return {
    id: -1,
    code: '', // 权限代码
    createTime: '', // 创建时间，通常使用 ISO 8601 格式的字符串表示
    icon: '', // 图标，可能为空        
    isDelete: 0, // 是否删除，1为删除，0为未删除
    label: '', // 权限标签，可能为空        
    open: false, // 是否展开，布尔类型        
    orderNum: -1, // 排序编号，可能为空        
    parentId: null, // 父权限ID，可能为空        
    parentName: '', // 父权限名称，可能为空                
    path: '', // 权限路径，可能为空                
    remark: '', // 备注，可能为空                        
    type: -1, // 权限类型，可能为空                        
    updateTime: '', // 更新时间，通常使用 ISO 8601 格式的字符串表示                        
    url: '', // 权限URL，可能为空                            
    value: '', // 权限值                                
    children: <Permission[]>[] // 子权限列表，类型为 `Permission` 数组      
  }
}
