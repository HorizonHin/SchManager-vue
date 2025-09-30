import { http } from "@/utils/http";
import { message } from "@/utils/message";

export interface CourseDto {
  username: string;
  coursename: string;
  teacher: string;
  courseId: number;
}

export interface SimpleResult<T> {
  success: boolean;
  msg?: string;
  data: T;
}

/** 获取所有可选课程 */
export const fetchCourses = () =>
  http.request<SimpleResult<CourseDto[]>>("get", "/api/student/courses");

/** 获取某学生已选择的课程 */
export const fetchSelectedCourses = (studentName: string) =>
  http.request<SimpleResult<CourseDto[]>>("get", "/api/student/selectedCourses", {
    params: { studentName }
  });

/** 提交选课（覆盖式提交） */
export const submitCourseSelection = (studentName: string, courseIds: number[]) =>
  http.request<SimpleResult<CourseDto[]>>("post", "/api/student/selectedCourses", {
    data: { studentName, courseIds }
  });

/** 清空选课 */
export const clearCourseSelection = (studentName: string) =>
  http.request<SimpleResult<CourseDto[]>>("delete", "/api/student/selectedCourses", {
    params: { studentName }
  });

/** 统一错误提示包装 */
export function unwrap<T>(p: Promise<SimpleResult<T>>): Promise<T> {
  return new Promise((resolve, reject) => {
    p.then(res => {
      if (res.success) resolve(res.data);
      else {
        message(res.msg || "操作失败", { type: "error" });
        reject(res);
      }
    }).catch(err => {
      message(err.message || "网络错误", { type: "error" });
      reject(err);
    });
  });
}
