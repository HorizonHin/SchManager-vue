// 模拟后端动态生成路由
import { defineFakeRoute } from "vite-plugin-fake-server/client";

/**
 * roles：页面级别权限，这里模拟二种 "admin"、"common"
 * admin：管理员角色
 * common：普通角色
 */
const permissionRouter = {
  path: "/permission",
  meta: {
    title: "权限管理",
    icon: "ep:lollipop",
    rank: 10
  },
  children: [
    {
      path: "/permission/page/index",
      name: "PermissionPage",
      meta: {
        title: "权限树",
        roles: ["admin"]
      }
    },
    // {
    //   path: "/permission/button",
    //   meta: {
    //     title: "按钮权限",
    //     roles: ["admin", "common"]
    //   },
    //   children: [
    //     {
    //       path: "/permission/button/router",
    //       component: "permission/button/index",
    //       name: "PermissionButtonRouter",
    //       meta: {
    //         title: "路由返回按钮权限",
    //         auths: [
    //           "permission:btn:add",
    //           "permission:btn:edit",
    //           "permission:btn:delete"
    //         ]
    //       }
    //     },
    //     {
    //       path: "/permission/button/login",
    //       component: "permission/button/perms",
    //       name: "PermissionButtonLogin",
    //       meta: {
    //         title: "登录接口返回按钮权限"
    //       }
    //     }
    //   ]
    // },
    {
      path: "/permission/userMng",
      meta: {
        title: "用户管理",
        roles: ["admin"]
      },
      children: [
        {
          path: '/permission/userMng/list',
          name: 'userList',
          component: 'userMng/userList.vue',
          meta: {
            title: '用户列表',
            roles: ['admin'],  // 只有admin角色可以访问
          }
        },
        {
          path: '/permission/userMng/detail',
          name: 'userDetail',
          component: '/userMng/userDetail.vue',
          meta: {
            title: '用户详情',
            roles: ['admin'],  // 只有admin角色可以访问
          }
        }
      ]
    },
    {
      path: "/permission/roleMng",
      name: "roleMng",
      component: "roleMng/index.vue",
      meta: {
        title: "角色管理",
        roles: ["admin"],
      }
    }
  ]
};

export default defineFakeRoute([
  {
    url: "/get-async-routes",
    method: "get",
    response: () => {
      return {
        success: true,
        data: [permissionRouter]
      };
    }
  }
]);
