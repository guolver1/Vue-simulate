import { ArrayMethods } from "./arr"
export function observer(data){
    // 1.对象 vue2
    
    if(typeof data !== 'object' || data == null){
        return data
    }
    //对象通过一个类
    return new Observer(data)
}

class Observer{
    constructor(value){
        // 给data定义一个属性
        Object.defineProperty(value, "__ob__",{
            enumerable: false,
            value: this
        })
        //判断数据
        // console.log(value)
        if(Array.isArray(value)){
            value.__proto__ =  ArrayMethods
            console.log("数组")
            this.observeArray(value) //处理数组对象
        }else{
            this.walk(value)  //遍历
        }
    }
    // vue2 Object.defineProperty 缺点：只劫持对象中的一个属性

    walk(data){
        let keys = Object.keys(data) //把对象中所有属性变成一个数组
        for(let i=0; i<keys.length; i++){ //遍历每个属性
            // 对我们的每个属性进行劫持
            let key = keys[i]
            let value = data[key]
            defineReactive(data, key, value)
        }
    }
    observeArray(value){
        //对对象数组每一项进行劫持
        for(let i= 0; i< value.length; i++){
            observer(value[i])
        }
    }
}
//对对象中的属性进行劫持
function defineReactive(data, key, value){
    observer(value)  //深度代理
    Object.defineProperty(data, key, {
        get(){
            // console.log('获取')
            return value
        },
        set(newValue){
            // console.log('设置')
            if(newValue == value) return value
            observer(newValue) //如果对象设置的值是对象
            value = newValue
        }
    })
}  

//总结：（1）对象
// 1. Object.defineProperty 只能对对象中的一个属性进行劫持
// 2. 遍历 
// 3. 递归 get set


// 数组 { list:[1,2,3,4], arr:[{a:1}]}
// 采用函数劫持方法，劫持数组方法   arr.push()