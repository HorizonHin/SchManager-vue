import { http } from "@/utils/http";
import { message } from "@/utils/message";

// 学生课程DTO，对应后端StudentCourse实体
export interface StudentCourseDto {
  // 选课记录主键
  id?: number;
  // 课程ID
  courseId: number;
  // 学生与课程关联
  studentName: string;
  courseName: string;
  // 学期（例如：2024-2025-1）
  semester: string;
  // 选课状态：0=已选，1=退选，2=已修完
  status: number;
  // 成绩（0-100）
  score?: number;
  // 选课时间
  selectTime?: string;
  // 备注
  remark?: string;
}

// 课程基本信息DTO
export interface CourseInfoDto {
  courseId: number;
  courseName: string;
  teacher: string;
}

// 简单结果类型
export interface SimpleResult<T> {
  success: boolean;
  msg?: string;
  data: T;
}

/** 获取教师负责的课程列表 */
export const fetchTeacherCourses = (teacherName: string) =>
  http.request<SimpleResult<CourseInfoDto[]>>("get", "/api/score/teacher-courses", {
    params: { teacherName }
  });

/** 获取某课程的所有学生及其成绩 */
export const fetchCourseStudents = (courseId: number) =>
  http.request<SimpleResult<StudentCourseDto[]>>("get", "/api/score/course-students", {
    params: { courseId }
  });

/** 批量更新学生成绩 */
export const updateStudentScores = (studentCourses: StudentCourseDto[]) =>
  http.request<SimpleResult<StudentCourseDto[]>>("post", "/api/score/update-scores", {
    data: studentCourses
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