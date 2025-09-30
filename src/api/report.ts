import { http } from "@/utils/http";
import { message } from "@/utils/message";

// 学生信息DTO（基于User实体的子集）
export interface StudentInfoDto {
  id?: number;
  username: string; // 用户名（学号）
  realName: string; // 真实姓名
  nickName?: string; // 昵称
  email?: string; // 邮箱
  phone?: string; // 电话
  mobile?: string; // 手机
  gender?: number; // 性别（0=女，1=男）
  avatar?: string; // 头像
  isEnabled: boolean; // 是否启用（false=注销）
}

// 课程成绩DTO
export interface CourseScoreDto {
  courseId: number;
  courseName: string;
  teacher: string;
  semester: string;
  score?: number;
  status: number; // 0=已选，1=退选，2=已修完
  selectTime?: string;
  remark?: string;
}

// 教师课程学生成绩DTO
export interface TeacherCourseStudentDto {
  username: string; // 学号
  realName: string; // 学生姓名
  courseName: string;
  semester: string;
  score?: number;
  status: number;
  selectTime?: string;
  remark?: string;
}

// 查询条件
export interface StudentQueryCondition {
  username?: string; // 用户名（学号）
  realName?: string; // 真实姓名
  email?: string; // 邮箱
  gender?: number; // 性别
  isEnabled?: boolean; // 是否启用
  pageNum?: number;
  pageSize?: number;
}

// 分页结果
export interface PageResult<T> {
  records: T[];
  total: number;
  current: number;
  size: number;
}

// 通用结果类型
export interface SimpleResult<T> {
  success: boolean;
  msg?: string;
  data: T;
}

/** 查询学生信息（管理员功能） */
export const queryStudentInfo = (condition: StudentQueryCondition) =>
  http.request<SimpleResult<PageResult<StudentInfoDto>>>("post", "/api/report/student-info", {
    data: condition
  });

/** 获取教师课程列表 */
export const getTeacherCourses = (teacherName: string) =>
  http.request<SimpleResult<CourseScoreDto[]>>("get", "/api/report/teacher-courses", {
    params: { teacherName }
  });

/** 查询教师课程的学生成绩 */
export const queryTeacherCourseStudents = (teacherName: string, courseId: number) =>
  http.request<SimpleResult<TeacherCourseStudentDto[]>>("get", "/api/report/teacher-course-students", {
    params: { teacherName, courseId }
  });

/** 查询学生个人成绩 */
export const queryStudentScores = (studentName: string) =>
  http.request<SimpleResult<CourseScoreDto[]>>("get", "/api/report/student-scores", {
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