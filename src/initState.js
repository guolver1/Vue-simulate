import { observer } from "./observe/index"

export function initState(vm){
    let opts = vm.$options
    console.log(opts)
    if(opts.props){
        initProps(vm)
    }
    if(opts.data){
        initData(vm)
    }
    if(opts.watch){
        initWatch(vm)
    }
    if(opts.computed){
        initComputed(vm)
    }
    if(opts.methods){
        initMethods(vm)
    }
}

function initComputed(){

}
//vue2 对data初始化, (1)对象 （2） 函数
function initData(vm){
    // console.log('data初始化')
    let data = vm.$options.data
    data = vm._data = typeof data === "function" ? data.call(vm): data; //注意this,原来指向window,现在指向vm实例
    
    //将data上的所有属性代理到实例上 {a:1,b:2}
    for(let key in data){
        proxy(vm, "_data", key)
    }
    // 对数据进行劫持
    observer(data)
}
function proxy(vm, source, key){
    Object.defineProperty(vm, key, {
        get(){
            return vm[source][key]
        },
        set(newValue){
            vm[source][key] = newValue
        }
    })
}
//data{}  (1)对象  （2）数组   {a:{b:1},list:[1,2,3],arr:[{}]}

function initMethods(){

}
function initWatch(){}
function initProps(){}