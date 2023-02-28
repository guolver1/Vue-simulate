
export function mountComponent(vm, el){
    vm._update(vm._render()) //功能：(1) vm._render将render函数变为vnode  (2)vm._update将vnode变为真实dom放到页面
}

export function lifeCycleMixin(Vue){
    Vue.prototype._update = function(vnode){  
        
    }
}

// render()函数 =》vnode => 真实的DOM