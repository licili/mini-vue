function createApp(rootComponent) {
  return {
    mount(selector) {
      const container = document.querySelector(selector);
      // 第一次进来，是对根组件进行挂载，第二次进来是对根组件进行刷新
      let isMounted = false;
      let oldVnode = null;
      // 收集依赖，当数据发生变化时候，会重新执行
      watchEffect(() => {
        if (!isMounted) {
          // 挂载
          oldVnode = rootComponent.render();
          mount(oldVnode, container);
          isMounted = true;
        } else {
          const newVnode = rootComponent.render();
          patch(oldVnode, newVnode);
          oldVnode = newVnode;
        }
      });
    },
  };
}
