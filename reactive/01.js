class Dep {
  constructor() {
    this.subscribers = new Set();
  }
  depend() {
    if (activeEffect) {
      this.subscribers.add(activeEffect);
    }
  }
  notify() {
    this.subscribers.forEach((effect) => {
      effect();
    });
  }
}

let activeEffect = null;
function watchEffect(effect) {
  /* 当我调用 dep.depend()的时候，
   就可以自动把effect添加到 subscriber里面
   */
  activeEffect = effect;
  effect();
  activeEffect = null;
}
// Map的 key 是一个 字符串
// WeakMap 的 key 是一个 对象
const targetMap = new WeakMap();
function getDep(target, key) {
  // 1. 根据对象（target）取出对应的 Map 对象
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  // 2. 取出具体的 dep 对象
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Dep();
    depsMap.set(key, dep);
  }
  return dep;
}

// 我们就要根据 原始数据 raw 创建 特定的数据结构
// 对原始数据进行数据劫持，可以实现数据发生改变的时候
// 可以通知 收集对应的依赖和触发依赖执行
// function reactive(raw) {
//   // vue2.x 实现
//   Object.keys(raw).forEach((key) => {
//     // 这里不能使用 const dep = new Dep() 每次都取一个新的
//     // 这样是获取不到的，我们需要实现一个数据结构
//     const dep = getDep(raw, key);
//     let value = raw[key];
//     Object.defineProperty(raw, key, {
//       get() {
//         dep.depend();
//         return value;
//       },
//       set(newValue) {
//         if (value === newValue) return;
//         value = newValue;
//         dep.notify();
//       },
//     });
//   });
//   return raw;
// }
function reactive(raw) {
  // vue3.x 实现
  // 返回的是一个proxy对象
  // Proxy 是如何对进行代理的呢？
  // Proxy 第一个参数就是要对谁劫持，
  // Proxy 返回的对象，以后我们对proxy对象的修改会被代理到 Proxy 第一个参数的对象里面去，
  // 具体代理的位置是 Proxy 的第二个参数
  return new Proxy(raw, {
    // receiver 用来改变 this 的
    get(target, key, receiver) {
      const dep = getDep(target, key);
      dep.depend();
      // Reflect.get 这个 API 主要作用就是 绑定 this
      return Reflect.get(target, key, receiver);
      // return target[key];
    },
    set(target, key, value, receiver) {
      const dep = getDep(target, key);
      Reflect.set(target, key, value, receiver);
      // target[key] = value;
      dep.notify();
    },
  });
}
// 这里reactive 是会生成 一个新的 proxy 对象
// Object.defineProperty 返回的是原来的对象
// 所以这里的 info 对象和 reactive 里面的不是同一个对象
const info = reactive({
  name: "lee",
  age: 18,
  money: 100,
});

watchEffect(function doubleMoney() {
  console.log("1:", info.money * 2);
});

watchEffect(function getInfo() {
  console.log("2:", `姓名：${info.name} - 年龄：${info.age}`);
});

// ------ info 数据发生更改 -----------
info.money = 200;
// info.age = 22;
