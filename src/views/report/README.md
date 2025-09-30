# 查询与报表功能说明

## 功能概述

根据 `copilot-instructions.md` 中的需求，实现了学生信息、选课情况、成绩的查询和报表输出功能。

## 新增页面

### 1. 查询与报表中心 (`/school/report`)
- **访问权限**: 所有角色（学生、教师、管理员）
- **功能**: 提供统一的查询入口，根据用户角色显示不同的功能卡片
- **特点**: 响应式设计，包含快速统计和功能说明

### 2. 学生信息查询 (`/school/report/student-query`)
- **访问权限**: 仅管理员
- **功能**: 
  - 多条件查询学生档案（姓名、班级、专业、状态）
  - 分页显示查询结果
  - 导出Excel报表
  - 状态标签显示（在读、注销、休学）

### 3. 课程成绩查询 (`/school/report/teacher-query`)
- **访问权限**: 教师和管理员
- **功能**:
  - 查看教师负责的所有课程
  - 查询特定课程的学生选课和成绩情况
  - 成绩统计分析（平均分、及格率、优秀率）
  - 导出课程成绩Excel
  - 成绩等级显示和绩点计算

### 4. 我的成绩查询 (`/school/report/student-score-query`)
- **访问权限**: 学生和管理员
- **功能**:
  - 查看个人所有选课记录和成绩
  - GPA计算和平均分统计
  - 成绩分布分析
  - 学期成绩趋势
  - 导出个人成绩单

## API接口

### 新增API文件: `/src/api/report.ts`

定义了完整的DTO类型和API接口：

#### 数据类型
- `StudentInfoDto`: 学生信息数据传输对象
- `CourseScoreDto`: 课程成绩数据传输对象  
- `TeacherCourseStudentDto`: 教师课程学生数据传输对象
- `StudentQueryCondition`: 学生查询条件
- `PageResult<T>`: 分页结果

#### API方法
- `queryStudentInfo()`: 查询学生信息（支持分页）
- `getTeacherCourses()`: 获取教师课程列表
- `queryTeacherCourseStudents()`: 查询教师课程学生成绩
- `queryStudentScores()`: 查询学生个人成绩
- `exportStudentInfo()`: 导出学生信息Excel
- `exportStudentScores()`: 导出学生成绩Excel
- `exportTeacherCourseScores()`: 导出教师课程成绩Excel

## 路由配置

更新了 `/src/router/modules/school.ts`，新增了三个子路由：

```typescript
{
  path: "/school/report/student-query",
  name: "StudentInfoQuery",
  meta: { roles: ["admin"], showLink: false }
},
{
  path: "/school/report/teacher-query", 
  name: "TeacherCourseQuery",
  meta: { roles: ["teacher", "admin"], showLink: false }
},
{
  path: "/school/report/student-score-query",
  name: "StudentScoreQuery", 
  meta: { roles: ["student", "admin"], showLink: false }
}
```

## 权限控制

### 多级权限验证
1. **路由级别**: 通过 `meta.roles` 控制页面访问权限
2. **功能级别**: 在页面组件中检查用户角色
3. **数据级别**: API接口根据用户角色返回相应数据

### 角色权限说明
- **学生**: 只能查询自己的选课和成绩信息
- **教师**: 可以查询自己授课的课程和学生成绩
- **管理员**: 拥有所有查询权限，可以查询全部数据

## 技术特性

### 1. 类型安全
- 使用 TypeScript 定义完整的类型系统
- 所有API接口都有明确的类型定义

### 2. 用户体验
- 响应式设计，支持不同屏幕尺寸
- 加载状态指示器
- 空状态友好提示
- 数据验证和错误处理

### 3. 数据可视化
- 成绩统计图表
- 状态标签和等级显示
- 趋势分析

### 4. 导出功能
- 支持Excel格式导出
- 自动生成文件名（包含日期）
- 浏览器兼容的下载实现

## 业务规则遵循

根据 `copilot-instructions.md` 的要求：

✅ **查询功能**: 实现了学生信息、选课情况、成绩的全面查询  
✅ **报表输出**: 支持Excel格式的报表导出  
✅ **权限控制**: 学生只能查询自身相关内容  
✅ **数据完整性**: 注销学生信息只读不可修改  
✅ **按课程管理**: 成绩查询和统计按课程组织

## 使用说明

1. **管理员**: 登录后访问"查询与报表中心"，可以看到学生信息查询卡片
2. **教师**: 登录后可以看到课程成绩查询卡片，查看自己授课的课程
3. **学生**: 登录后可以看到我的成绩查询卡片，查看个人学习情况

所有功能都集成在统一的查询与报表中心，通过卡片式界面提供直观的导航体验。