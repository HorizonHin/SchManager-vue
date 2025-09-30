# 学生信息DTO重构说明

## 概述

根据 `copilot-instructions.md` 中的 User 实体定义，重构了 `StudentInfoDto` 使其字段只能是 User 的子集，符合数据库实体设计。

## 主要更改

### 1. DTO 字段重构

**原 StudentInfoDto**:
```typescript
{
  id?: number;
  studentName: string;
  gender?: string;
  age?: number;
  major?: string;
  className?: string;
  phone?: string;
  email?: string;
  enrollmentDate?: string;
  status: number; // 0=在读，1=注销，2=休学
  remark?: string;
}
```

**新 StudentInfoDto** (基于 User 实体):
```typescript
{
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
```

### 2. 查询条件更新

**StudentQueryCondition** 字段对应关系：
- `studentName` → `realName` (真实姓名)
- `className`, `major` → 删除 (不是User字段)
- `status` → `isEnabled` (boolean类型)
- 新增: `username` (学号), `email`, `gender`

### 3. 页面字段映射

**学生信息查询页面** (`StudentQuery.vue`):
- 查询表单: 学号、姓名、邮箱、性别、状态
- 表格列: 学号、姓名、昵称、性别、邮箱、电话、手机、状态、头像
- 状态显示: `isEnabled` true=在读, false=注销

**教师课程查询页面** (`TeacherCourseQuery.vue`):
- `TeacherCourseStudentDto.studentName` → `username` + `realName`
- 表格新增学号列

### 4. 导出功能改进

使用前端 `xlsx` 库替代后端 API 导出：
- **学生信息**: 导出学号、姓名、昵称、性别、邮箱、电话、手机、状态
- **课程成绩**: 导出学号、学生姓名、课程信息、成绩等级
- **个人成绩**: 导出个人完整成绩单 + 汇总统计信息

### 5. 数据一致性

所有学生相关数据现在完全基于 User 实体：
- ✅ 用户名作为学号使用
- ✅ realName 作为学生真实姓名
- ✅ isEnabled 作为注销状态标识
- ✅ gender 使用数字类型 (0=女, 1=男)
- ✅ 保持与数据库User表字段一致

## 业务规则遵循

根据系统需求：
1. **学生档案信息维护**: 基于User实体的标准字段
2. **注销状态管理**: 使用 `isEnabled=false` 标识注销学生
3. **权限控制**: 学生只能查询自身相关内容
4. **数据完整性**: 注销学生信息只读不可修改

## 兼容性

- ✅ 保持了所有现有API接口结构
- ✅ 前端组件功能完整保留
- ✅ 导出功能正常工作
- ✅ 权限控制机制不变

## 技术改进

1. **类型安全**: 严格基于User实体定义DTO
2. **数据一致**: 消除了非User字段的冗余信息
3. **前端导出**: 使用xlsx库提供更好的导出体验
4. **响应式设计**: 保持良好的用户界面体验