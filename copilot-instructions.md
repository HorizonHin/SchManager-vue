优先使用中文回答。你正在开发一个学生管理系统，下面是需求
1.学生档案信息维护，包括注册、注销、更新等；
2.学生选课管理，从可选的课程中选择若干课程；
3.学生成绩管理，实现学生成绩的登记；
4.学生信息、选课情况、成绩的查询和报表输出；
满足以下限制：
每个学生选择的课程数在 15～18 之间；
学生信息注销后，便不允许对与之相关的信息作任何修改，但可查阅；
成绩的登记是按照课程来登记的；
学生只能实现 2、4 功能，且只涉及与自身相关的内容； 

**数据库实体**
public class StudentCourse {
    // 选课记录主键（可选）
    private Long id;
    // 课程ID（新增，便于与课程关联）
    private Long courseId;
    // 学生与课程关联
    private String studentName;
    private String courseName;

    // 学期（例如：2024-2025-1）
    private String semester;

    // 选课状态：0=已选，1=退选，2=已修完
    private Integer status;

    // 成绩（0-100）
    private Integer score;

    // 选课时间
    private Date selectTime;

    // 备注
    private String remark;
}

public class Course {
    private Long id;
    private String name;
    private Integer courseNum;
    private String courseTime;
    private int courseHours;
    private int credit;

    private Long teacherId;
    private String teacherName;

    private int capacity;
    private int classSize;
}

@Data
public class User  {
    private String avatar;   //用户头像地址
    private String email;
    private Integer gender;
    private Long id;
    private String nickName;
    private String password;
    private String phone;
    private String realName;
    private String mobile;
    private String username;
    private boolean isEnabled = true; //表示已注销
}

