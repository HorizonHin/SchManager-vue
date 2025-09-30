const Layout = () => import("@/layout/index.vue");

export default {
  path: "/school",
  name: "School",
  component: Layout,
  meta: {
    title: "学生功能管理",
    icon: "ri:book-2-line",
    rank: 3
  },
  children: [
    {
      path: "/school/course",
      name: "CourseSelect",
      component: () => import("@/views/student/CoursesSelect.vue"),
      meta: {
        title: "学生选课管理",
        roles: ["student", "admin"] // 学生 & 管理员可见
      }
    },
    {
      path: "/school/score",
      name: "ScoreEntry",
      component: () => import("@/views/score/Entrys.vue"),
      meta: {
        title: "成绩录入",
        roles: ["teacher", "admin"] // 老师 & 管理员可见
      }
    },
    {
      path: "/school/report",
      name: "ReportQuery",
      component: () => import("@/views/report/Querys.vue"),
      meta: {
        title: "查询与报表中心",
        roles: ["student", "teacher", "admin"] // 所有人都可见
      }
    },
    {
      path: "/school/report/student-query",
      name: "StudentInfoQuery",
      component: () => import("@/views/report/StudentQuery.vue"),
      meta: {
        title: "学生信息查询",
        roles: ["admin"], // 仅管理员可见
        showLink: false // 不在菜单中显示
      }
    },
    {
      path: "/school/report/teacher-query",
      name: "TeacherCourseQuery",
      component: () => import("@/views/report/TeacherCourseQuery.vue"),
      meta: {
        title: "课程成绩查询",
        roles: ["teacher", "admin"], // 教师和管理员可见
        showLink: false // 不在菜单中显示
      }
    },
    {
      path: "/school/report/student-score-query",
      name: "StudentScoreQuery",
      component: () => import("@/views/report/StudentScoreQuery.vue"),
      meta: {
        title: "我的成绩查询",
        roles: ["student", "admin"], // 学生和管理员可见
        showLink: false // 不在菜单中显示
      }
    }
  ]
} satisfies RouteConfigsTable;