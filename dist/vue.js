(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _iterableToArrayLimit(arr, i) {
    var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
    if (null != _i) {
      var _s,
        _e,
        _x,
        _r,
        _arr = [],
        _n = !0,
        _d = !1;
      try {
        if (_x = (_i = _i.call(arr)).next, 0 === i) {
          if (Object(_i) !== _i) return;
          _n = !1;
        } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0);
      } catch (err) {
        _d = !0, _e = err;
      } finally {
        try {
          if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return;
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }
  }
  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  //重写数组
  //（1）获取原来的数组方法

  var oldArrayProtoMethods = Array.prototype;

  // (2) 重写
  var ArrayMethods = Object.create(oldArrayProtoMethods);

  // 劫持
  var methods = ["push", "pop", "unshift", "shift", "splice"];
  methods.forEach(function (item) {
    ArrayMethods[item] = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      //this就是那个数组
      // console.log("劫持数组")

      var result = oldArrayProtoMethods[item].apply(this, args);
      // console.log(args,'args')
      // 问题：数组追加对象的情况 arr.push({a:1})
      var inserted;
      switch (item) {
        case 'push':
        case "unshift":
          inserted = args;
          break;
        case "splice":
          inserted = args.splice(2); //arr.splice(0,1,{a:6}) 获取第三个参数{a:6}
          break;
      }
      // console.log(inserted, "inserted")

      var ob = this.__ob__;
      if (inserted) {
        ob.observeArray(inserted); //对我们的添加的对象进行劫持
      }

      return result;
    };
  });

  function observer(data) {
    // 1.对象 vue2

    if (_typeof(data) !== 'object' || data == null) {
      return data;
    }
    //对象通过一个类
    return new Observer(data);
  }
  var Observer = /*#__PURE__*/function () {
    function Observer(value) {
      _classCallCheck(this, Observer);
      // 给data定义一个属性
      Object.defineProperty(value, "__ob__", {
        enumerable: false,
        value: this
      });
      //判断数据
      // console.log(value)
      if (Array.isArray(value)) {
        value.__proto__ = ArrayMethods;
        console.log("数组");
        this.observeArray(value); //处理数组对象
      } else {
        this.walk(value); //遍历
      }
    }
    // vue2 Object.defineProperty 缺点：只劫持对象中的一个属性
    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        var keys = Object.keys(data); //把对象中所有属性变成一个数组
        for (var i = 0; i < keys.length; i++) {
          //遍历每个属性
          // 对我们的每个属性进行劫持
          var key = keys[i];
          var value = data[key];
          defineReactive(data, key, value);
        }
      }
    }, {
      key: "observeArray",
      value: function observeArray(value) {
        //对对象数组每一项进行劫持
        for (var i = 0; i < value.length; i++) {
          observer(value[i]);
        }
      }
    }]);
    return Observer;
  }(); //对对象中的属性进行劫持
  function defineReactive(data, key, value) {
    observer(value); //深度代理
    Object.defineProperty(data, key, {
      get: function get() {
        // console.log('获取')
        return value;
      },
      set: function set(newValue) {
        // console.log('设置')
        if (newValue == value) return value;
        observer(newValue); //如果对象设置的值是对象
        value = newValue;
      }
    });
  }

  //总结：（1）对象
  // 1. Object.defineProperty 只能对对象中的一个属性进行劫持
  // 2. 遍历 
  // 3. 递归 get set

  // 数组 { list:[1,2,3,4], arr:[{a:1}]}
  // 采用函数劫持方法，劫持数组方法   arr.push()

  function initState(vm) {
    var opts = vm.$options;
    console.log(opts);
    if (opts.props) ;
    if (opts.data) {
      initData(vm);
    }
    if (opts.watch) ;
    if (opts.computed) ;
    if (opts.methods) ;
  }
  //vue2 对data初始化, (1)对象 （2） 函数
  function initData(vm) {
    // console.log('data初始化')
    var data = vm.$options.data;
    data = vm._data = typeof data === "function" ? data.call(vm) : data; //注意this,原来指向window,现在指向vm实例

    //将data上的所有属性代理到实例上 {a:1,b:2}
    for (var key in data) {
      proxy(vm, "_data", key);
    }
    // 对数据进行劫持
    observer(data);
  }
  function proxy(vm, source, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[source][key];
      },
      set: function set(newValue) {
        vm[source][key] = newValue;
      }
    });
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; //标签名称
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); //作用域 <span:xx>
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 标签开头的正则 捕获的内容是 标签名<
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配标签结尾的  </div>
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+| ([^\s"'=<>`]+)))?/; // 匹配属性的 
  // <div id=“app"></div>
  var startTagClose = /^\s*(\/?)>/; // 匹配标签结束的  >

  //遍历字符串，遍历一个，删除一个
  //<div id="app"> hello {{msg}} <h></h></div> 开始标签 文本 结束标签

  /**
   * {
   * tag:'div',
   * attrs:[{id:"app"}],
   * children:[{tag:null,text:hello},{tag:'div'}]
   * }
   * 
   * 
   */
  // 创建ast语法树
  function createAstElement(tag, attrs) {
    return {
      tag: tag,
      //元素 div
      attrs: attrs,
      children: [],
      //子节点
      type: 1,
      parent: null
    };
  }
  var root; //根元素
  var createParent; //当前元素的父亲
  // 数据结构： 栈
  var stack = []; // [div,h]
  function start(tag, attrs) {
    //开始标签
    var element = createAstElement(tag, attrs);
    // console.log(tag, attrs,"开始标签")
    if (!root) {
      root = element;
    }
    createParent = element;
    stack.push(element); //入栈
  }

  function charts(text) {
    //获取文本
    // console.log(text, "文本")
    // 空格 a全部去掉
    text = text.replace(/\s/g, '');
    if (text) {
      createParent.children.push({
        type: 3,
        text: text
      });
    }
  }
  function end(tag) {
    //结束的标签
    // console.log(tag,"结束标签")
    var element = stack.pop();
    createParent = stack[stack.length - 1];
    if (createParent) {
      //元素闭合
      element.parent = createParent.tag;
      createParent.children.push(element);
    }
  }
  function parseHTML(html) {
    while (html) {
      //html为空时结束
      //判断标签
      var textEnd = html.indexOf("<");
      if (textEnd === 0) {
        //标签
        // （1）开始标签
        var startTagMatch = parseStartTag(); //开始标签的内容
        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }
        // 结束标签
        var endTagMatch = html.match(endTag);
        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        }
      }
      var text = void 0;
      //文本
      if (textEnd > 0) {
        // 获取文本内容
        text = html.substring(0, textEnd);
      }
      if (text) {
        advance(text.length);
        charts(text);
      }
    }
    function parseStartTag() {
      var start = html.match(startTagOpen); //1结果 2 false
      if (!start) return;
      //创建ast语法树
      var match = {
        tagName: start[1],
        attrs: []
      };
      // 删除开始标签
      advance(start[0].length);

      // 注意  多个遍历
      // 注意  >
      var attr;
      var end;
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        // console.log(attr)
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5]
        });
        advance(attr[0].length);
      }
      if (end) {
        advance(end[0].length);
        return match;
      }
    }
    function advance(n) {
      html = html.substring(n);
    }
    return root;
  }

  /**
   * 
   * <div id="app">hello {{msg}} <h></h></div>
   * 
   * render(){ _c 解析标签
   *  return _c('div', {id:app}, _v('hell'+_s(msg)),_c)
   * }
   * 
   */
  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

  // 处理属性
  function getProps(attrs) {
    var str = '';
    // 对象形式
    var _loop = function _loop() {
      var attr = attrs[i];
      if (attr.name === 'style') {
        var obj = {};
        attr.value.split(';').forEach(function (item) {
          var _item$split = item.split(":"),
            _item$split2 = _slicedToArray(_item$split, 2),
            key = _item$split2[0],
            val = _item$split2[1];
          obj[key] = val;
        });
        attr.value = obj;
      }
      // 拼接 
      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    };
    for (var i = 0; i < attrs.length; i++) {
      _loop();
    }
    return "{".concat(str.slice(0, -1), "}");
  }

  //处理子集
  function genChildren(el) {
    var children = el.children;
    if (children) {
      return children.map(function (child) {
        return gen(child);
      }).join(',');
    } else {
      return false;
    }
  }
  function gen(node) {
    //1 元素div  2  3文本
    if (node.type === 1) {
      return generate(node);
    } else {
      //（1）只是文本 hello  (2) 插值表达式{{}}
      var text = node.text; //获取文本
      if (!defaultTagRE.test(text)) {
        //没有插值表达式的
        return "_v(".concat(JSON.stringify(text), ")");
      }
      //带有插值表达式的
      var tokens = [];
      // 每一次将test的lastIndex置为0，否则除了第一次以外会匹配不到, 无法使用exec
      var lastIndex = defaultTagRE.lastIndex = 0;
      var match, index;
      while (match = defaultTagRE.exec(text)) {
        console.log(match, lastIndex);
        //hello {{msg}}
        index = match.index;
        if (index > lastIndex) {
          //添加内容
          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
        }
        tokens.push("_s(".concat(match[1].trim(), ")"));
        lastIndex = index + match[0].length;
      }
      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)));
      }
      return "_v(".concat(tokens.join("+"), ")");
    }
  }
  function generate(el) {
    // console.log(el)
    //注意属性 {id:app, style:{color:red,font-size:20px}}
    var children = genChildren(el);
    var code = "_c('".concat(el.tag, "',").concat(el.attrs.length ? getProps(el.attrs) : 'undefined', ",").concat(children ? children : '', ")");
    console.log(code, "code");
    return code;
  }

  function compileToFunction(el) {
    //解析成AST语法树
    // 1. 将html变为ast语法树
    var ast = parseHTML(el);
    // console.log(ast)
    // 2. ast语法树变成render函数 （1） ast语法树变成字符串 （2）字符串变成函数
    var code = generate(ast); //_c解析元素， _v解析文本，_s解析变量
    // 3. 将render字符串变成函数
    var render = new Function("with(this){return ".concat(code, "}"));
    return render;
  }

  function mountComponent(vm, el) {
    vm._update(vm._render()); //功能：(1) vm._render将render函数变为vnode  (2)vm._update将vnode变为真实dom放到页面
  }

  function lifeCycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {};
  }

  // render()函数 =》vnode => 真实的DOM

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = options;
      // 1. 初始化状态
      initState(vm);

      //2. 渲染模板 el 找到指定位置
      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    };

    // 创建 $mount

    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el); //获取元素
      var options = vm.$options;
      if (!options.render) {
        //没有
        var template = options.template;
        if (!template && el) {
          //获取html
          el = el.outerHTML;

          //变成ast语法树
          var render = compileToFunction(el);
          //(1) 将render 函数变成vode  (2) vnode变成真实DOM放到页面上去
          options.render = render;
        }
      }
      mountComponent(vm);
    };
  }
  //渲染步骤，先初始化initState，然后渲染模板，有三种方式： el、render、template
  // 必须有el, 拿到HTML标签的目的是变成render函数
  //变成render之前，先变成ast语法树（所有都能操作js,css,html） 虚拟dom vnode(只能操作节点)
  //<div id="app"> hello {{msg}} <h></h></div>

  /**
   * {
   * tag:'div',
   * attrs:[{id:"app"}],
   * children:[{tag:null,text:hello},{tag:'div'}]
   * }
   * 
   * 
   */

  function renderMixin(Vue) {
    Vue.prototype._c = function () {
      //标签
      // 创建标签
      return createElement.apply(void 0, arguments);
    };
    Vue.prototype._v = function (text) {
      //文本
      return createText(text);
    };
    Vue.prototype._s = function (val) {
      //变量
      return val == null ? "" : _typeof(val) === 'object' ? JSON.stringify(val) : val;
    };
    Vue.prototype._render = function () {
      //render函数变成vnode
      var vm = this;
      var render = vm.$options.render;
      var vnode = render.call(this);
      console.log(vnode);
    };
  }
  //创建元素
  function createElement(tag) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      children[_key - 2] = arguments[_key];
    }
    // const key = data.key
    // if (key) {
    //   delete data.key
    // }
    return vnode(tag, data, data.key, children);
  }
  //创建文本
  function createText(text) {
    return vnode(undefined, undefined, undefined, undefined, text);
  }
  // 创建vnode
  function vnode(tag, data, key, children, text) {
    return {
      tag: tag,
      data: data,
      key: key,
      children: children,
      text: text
    };
  }

  function Vue(options) {
    // 初始化
    this._init(options);
  }
  initMixin(Vue);
  lifeCycleMixin(Vue); //添加生命周期
  renderMixin(Vue); //添加_render

  return Vue;

}));
//# sourceMappingURL=vue.js.map
