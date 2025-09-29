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
        title: "学生信息与报表",
        roles: ["student", "teacher", "admin"] // 所有人都可见
      }
    }
  ]
} satisfies RouteConfigsTable;