class Dep {
  constructor() {
    this.subscribes = new Set();
  }
  addDep() {
    if (effectFn) {
      this.subscribes.add(effectFn);
    }
  }
  notify() {
    this.subscribes.forEach((effect) => {
      effect();
    });
  }
}

const weakMap = new WeakMap();
// 数据结构
// => { obj1:{ name:[],age:[] },obj2:{} }
function getDep(raw, key) {
  let mapObj = weakMap.get(raw);
  if (!mapObj) {
    mapObj = new Map();
    weakMap.set(raw, mapObj);
  }

  let setObj = mapObj.get(key);
  if (!setObj) {
    setObj = new Dep();
    mapObj.set(key, setObj);
  }
  return setObj;
}

// vue2.x Object.defineProperty(obj,property,descriptor)
function reactive(raw) {
  Object.keys(raw).forEach((key) => {
    let value = raw[key];
    const dep = getDep(raw, key);
    Object.defineProperty(raw, key, {
      get() {
        console.log("getter", key);
        dep.addDep();
        return value;
      },
      set(newVal) {
        if (newVal === value) return;
        console.log("setter");
        value = newVal;
        dep.notify();
      },
    });
  });
  return raw;
}

let effectFn = null;
function watchEffect(fn) {
  effectFn = fn;
  fn();
  effectFn = null;
}

const obj = reactive({ name: "lee", age: 18 });
const obj2 = reactive({ height: 1.8 });

// 副作用函数
watchEffect(function () {
  console.log(`name+age: 我是 ${obj.name},今年 ${obj.age}`);
});
watchEffect(function () {
  console.log(`name: 我是dev,今年 ${obj.age}`);
});
watchEffect(function () {
  console.log(`height: 我是dev,今年 ${obj2.height}`);
});

// console.log("---age 改变---");
// obj.age = 30;
// dep.notify();

// console.log("---name 改变---");
// obj.name = "dev";

console.log("---height 改变---");
obj2.height = "30";
