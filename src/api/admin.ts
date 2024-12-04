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

   