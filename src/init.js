import { initState } from "./initState"
import { compileToFunction } from "./compile/index"
import { mountComponent } from "./lifecycle"
export function initMixin(Vue){
    Vue.prototype._init = function(options){
        let vm = this
        vm.$options = options
        // 1. 初始化状态
        initState(vm)

        //2. 渲染模板 el 找到指定位置
        if(vm.$options.el){
            vm.$mount(vm.$options.el)
        }
    }

    // 创建 $mount

    Vue.prototype.$mount = function(el){
        let vm = this
        el = document.querySelector(el) //获取元素
        let options = vm.$options
        if(!options.render){//没有
            let template = options.template
            if(!template && el){
                //获取html
                el = el.outerHTML
                
                //变成ast语法树
                let render = compileToFunction(el)
                //(1) 将render 函数变成vode  (2) vnode变成真实DOM放到页面上去
                options.render = render

            }
        } 
        mountComponent(vm, el)
    }
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

