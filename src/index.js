import { initMixin } from "./init"
import { lifeCycleMixin } from "./lifecycle"
import { renderMixin } from "./vnode/index"
function Vue(options){
    // 初始化
    this._init(options)
}

initMixin(Vue)
lifeCycleMixin(Vue) //添加生命周期
renderMixin(Vue)    //添加_render
export default Vue