const h = function (tag, props, children) {
  // vnode -> javascript 对象 -> {}
  return {
    tag,
    props,
    children,
  };
};

const mount = function (vnode, container) {
  // vnode -> element
  const { tag, props, children } = vnode;
  // 1. 创建真实的原生DOM，并且在 vnode 保留 el
  const el = (vnode.el = document.createElement(tag));
  console.log(vnode);

  // 2. 处理 props
  if (props) {
    for (const key in props) {
      const value = props[key];
      // 对事件的判断
      if (key.startsWith("on")) {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        el.setAttribute(key, value);
      }
    }
  }

  // 3. 处理 children
  if (children) {
    if (typeof children === "string") {
      el.textContent = children;
    } else {
      children.forEach((item) => {
        mount(item, el);
      });
    }
  }

  // 4. el 挂在到 container
  container.appendChild(el);
};

/**
 *
 * @param {*} n1 oldVnode
 * @param {*} n2 newVnode
 */
const patch = function (n1, n2) {
  if (n1.tag !== n2.tag) {
    // 获取 挂载旧节点的父元素，然后移除旧节点
    console.log(n1);
    const n1ElParent = n1.el.parentElement;
    n1ElParent.removeChild(n1.el);
    // 挂载新节点
    mount(n2, n1ElParent);
  } else {
    //  如果 n1 的类型和 n2 相同，需要处理 props 和 children
    // 1. 取出 element 元素，并且在 n2 保存
    const el = (n2.el = n1.el);

    // 2. 处理 props
    //  先将新节点的 props 全部添加进元素里面，如果旧的也有，就会覆盖
    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    // 2.1 获取所有的 newProps 添加到 el中
    for (const key in newProps) {
      const oldValue = oldProps[key];
      const newValue = newProps[key];
      if (newValue !== oldValue) {
        if (key.startsWith("on")) {
          el.addEventListener(key.slice(2).toLowerCase(), newValue);
        } else {
          el.setAttribute(key, newValue);
        }
      }
    }

    // 2.2 删除旧的 props
    // 判读旧节点的 props 是否存在于新节点，如果不存在则移除
    for (const key in oldProps) {
      if (!(key in newProps)) {
        if (key.startsWith("on")) {
          el.removeEventListener(key.slice(2).toLowerCase());
        } else {
          el.removeAttribute(key);
        }
      }
    }

    // 3. 处理 children
    const oldChildren = n1.children || [];
    const newChildren = n2.children || [];

    // 3.1 如果情况一：newChildren 是一个字符串
    // - 如果 oldChildren 也是一个字符串，则判断这两个字符串是否相等，如果不相等，则直接使用 textContent 添加字符串
    // - 如果 oldChildren 点是一个数组，则直接使用 innerHTML 来写入新的字符串来替代
    // 3.2 如果 newChildren 是一个数组
    // - 如果 oldChildren 是一个字符串，则需要把 oldChildren 清空，然后再把 newChildren 添加进去
    // - 如果 oldChildren 是一个 数组，取除 newChildren 和 oldChildren 最短长度,然后进行遍历，进行 patch
    //   - 如果 newChildren.length > oldChildren.length  剩余的节点添加到 父节点中
    //   - 如果 oldChildren.length > newChildren.length 从父节点中移除剩下的节点

    if (typeof newChildren === "string") {
      // 情况一：newChildren 本身是一个 string
      // 边界判断 edge case
      if (typeof oldChildren === "string") {
        if (newChildren === oldChildren) {
          return;
        } else {
          el.textContent = newChildren;
        }
      } else {
        el.innerHTML = newChildren;
      }
    } else {
      // 情况二：newChildren 本身是一个 数组
      if (typeof oldChildren === "string") {
        el.innerHTML = "";
        newChildren.forEach((item) => {
          mount(item, el);
        });
      } else {
        //  oldChildren [v1,v2,v3]
        // newChildren [v1,v5,v6,v7]
        // 这里是不考虑移动的情况的（就是不考虑 key 情况）
        // 1. 前面有相同节点的原声生进行 patch 操作
        const commenLength = Math.min(oldChildren.length, newChildren.length);
        for (let i = 0; i < commenLength; i++) {
          path(oldChildren[i], newChildren[i]);
        }

        // 2. newChildren > oldChildren
        if (newChildren.length > oldChildren.length) {
          newChildren.slice(oldChildren.length).forEach((item) => {
            mount(item, el);
          });
        }

        // 3. oldChildren.length > newChildren.length
        if (newChildren.length < oldChildren.length) {
          oldChildren.slice(newChildren.length).forEach((item) => {
            el.removeChild(item.el);
          });
        }
      }
    }
  }
};
