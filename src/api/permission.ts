import { http } from "@/utils/http";
import { Result } from "./routes";
import { message } from "@/utils/message";
import { Permission } from "@/model/pojos";
import { S } from "node_modules/vite/dist/node/types.d-aGj9QkWt";
// 获取权限树
export const getPermissions =async (roleName?: string) => {
  return new Promise<Result>((resolve, reject) => {
    http.request<Result>("get", "/api/admin/permissions", { params: { roleName }  }).then((res) => {
      if (res.success) {
        console.log("请求权限成功");
        resolve(res);
      } else {
        console.log("请求权限失败");
        reject(res.msg);
     }
    }).catch((err) => {
      console.log("请求权限error");
      console.log(err.msg);
      reject(err);
    });
   });
};

// 新增权限
export const addPermissions = (data: any) => {
  console.log("准备执行addPermissions：", data);
  return new Promise<Result>((resolve, reject) => {
    http.request<Result>("post", "/api/admin/addPermissions", { data }).then((res) => {
      if (res.success) {
        console.log("新增权限成功");
        resolve(res);
      } else {
        console.log("新增权限失败");
        reject(res.msg);
      }
    }).catch((err) => {
      console.log("新增权限error");
      console.log(err.msg);
      reject(err);
    });
  }); 
};

// 删除权限
export const deletePermission = (ids: number[]) => {
     console.log("准备执行deletePermission：", ids);
     return new Promise<Result>((resolve, reject) => {
       http.request<Result>("delete", "/api/admin/deletePermission", { data: { ids } }).then((res) => {
         if (res.success) {
           console.log("删除权限成功");
           resolve(res);
         } else {
           console.log("删除权限失败");
           reject(res.msg);
         }
       }).catch((err) => {
         console.log("删除权限error");
         console.log(err.msg);
         reject(err);
       });
     });  
};

// 更新权限
export const updatePermission = async (data?: object): Promise<Result> => {
  console.log("updatePermission方法执行到了admin.ts文件中", data);
  return new Promise<Result>((resolve, reject) => {
    http.request<Result>("put", "/api/admin/updatePermission", { data }).then(res => {
      console.log("updatePermission.then 执行成功");
      console.log(res);
      if (res.success) {
        resolve(res);
      } else {
        console.log("admin.ts文件中updatePermission方法执行失败");
        console.log(res);
        reject(res);
      }
    }).catch(err => {
      console.log("在admin.ts文件中updatePermission方法中发生错误");
      message(err.message);
      reject(err);
    });
  });
};


export const updRolePerm = async (roleName: string, permIds: String) => { 
  console.log("准备执行updRolePerm方法：", roleName, permIds);
  return new Promise<Result>((resolve, reject) => {
    http.request<Result>("post", "/api/admin/updRolePerm", { data: { roleName, permIds } }).then(res => {
      console.log("updRolePerm.then 执行成功");
      console.log(res);
      if (res.success) {
        resolve(res);
      } else {
        console.log("admin.ts文件中updRolePerm方法执行失败");
        console.log(res);
        reject(res);
      }
    }).catch(err => {
      console.log("在admin.ts文件中updRolePerm方法中发生错误");
      message(err.message);
      reject(err);
    });
  })
}