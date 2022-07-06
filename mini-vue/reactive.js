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
