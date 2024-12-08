import { http } from "@/utils/http";
import { message } from "@/utils/message";
import { Result } from "./routes";



export const addUser = async (data?: object) => {
    console.log("addUser方法执行到了admin.ts文件中", data);
    return new Promise<Result>((resolve, reject) => {
        http.request<Result>("post", "/api/admin/addUser", { data }).then(res => {
            console.log("addUser.then 执行成功");
            console.log(res);
            if (res.success) {
                resolve(res);
            }
            else {
                console.log("admin.ts文件中addUser方法执行失败");
                console.log(res);
                reject(res);}
        }).catch(err => {
            console.log("在admin.ts文件中addUser方法中发生错误");
            message(err.message);
            reject(err);
        });
    });
}

export const selectUsers = async (data?: object) => {
    console.log("selectUser方法执行到了admin.ts文件中", data);

    return new Promise<Result>((resolve, reject) => {
        http.request<Result>("get", "/api/admin/users", { data }).then(res => {
            console.log("selectUser.then 执行成功");
            console.log(res);
            if (res.success) {
                resolve(res);
            }
            else {
                console.log("admin.ts文件中selectUser方法执行失败");
                console.log(res);
                reject(res);}
        }).catch(err => {
            console.log("在admin.ts文件中selectUser方法中发生错误");
            message(err.message,{type:'error'});
            reject(err);
        });
    });
}

export const selectRole = async (data?: object) => {
    console.log("selectUser方法执行到了admin.ts文件中", data);

    return new Promise<Result>((resolve, reject) => {
        http.request<Result>("get", "/api/admin/selectRole", { data }).then(res => {
            console.log("selectRole.then 执行成功");
            console.log(res);
            if (res.success) {
                resolve(res);
            }
            else {
                console.log("admin.ts文件中selectRole方法执行失败");
                console.log(res);
                reject(res);}
        }).catch(err => {
            console.log("在admin.ts文件中selectRole方法中发生错误");
            message(err.message);
            reject(err);
        });
    });
}

export const addRole = async (data?: object) => {
    console.log("addRole方法执行到了admin.ts文件中", data);

    return new Promise<Result>((resolve, reject) => {
        http.request<Result>("post", "/api/admin/addRole", { data }).then(res => {
            console.log("addRole.then 执行成功");
            console.log(res);
            if (res.success) {
                resolve(res);
            }
            else {
                console.log("admin.ts文件中addRole方法执行失败");
                console.log(res);
                reject(res);}
        }).catch(err => {
            console.log("在admin.ts文件中addRole方法中发生错误");
            message(err.message);
            reject(err);
        });
    });
}

