/**
 * 
 * <div id="app">hello {{msg}} <h></h></div>
 * 
 * render(){ _c 解析标签
 *  return _c('div', {id:app}, _v('hell'+_s(msg)),_c)
 * }
 * 
 */
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

// 处理属性
function getProps(attrs) {
    let str = ''
    // 对象形式
    for (let i = 0; i < attrs.length; i++) {
        let attr = attrs[i]
        if (attr.name === 'style') {
            let obj = {}
            attr.value.split(';').forEach(item => {
                let [key, val] = item.split(":")
                obj[key] = val
            })
            attr.value = obj
        }
        // 拼接 
        str += `${attr.name}:${JSON.stringify(attr.value)},`
    }
    return `{${str.slice(0, -1)}}`
}

//处理子集
function genChildren(el) {
    let children = el.children
    if (children) {
        return children.map(child => gen(child)).join(',')
    }else{
        return false
    }
}

function gen(node) { //1 元素div  2  3文本
    if (node.type === 1) {
        return generate(node)
    } else {  //（1）只是文本 hello  (2) 插值表达式{{}}
        let text = node.text  //获取文本
        if (!defaultTagRE.test(text)) {//没有插值表达式的
            return `_v(${JSON.stringify(text)})`
        }
        //带有插值表达式的
        let tokens = []
        // 每一次将test的lastIndex置为0，否则除了第一次以外会匹配不到, 无法使用exec
        let lastIndex = defaultTagRE.lastIndex = 0
        let match, index
        while (match = defaultTagRE.exec(text)) {
            console.log(match, lastIndex)
            //hello {{msg}}
            index = match.index
            if (index > lastIndex) { //添加内容
                tokens.push(JSON.stringify(text.slice(lastIndex, index)))
            }
            tokens.push(`_s(${match[1].trim()})`)
            lastIndex = index + match[0].length

        }
        if (lastIndex < text.length) {
            tokens.push(JSON.stringify(text.slice(lastIndex)))
        }
        return `_v(${tokens.join("+")})`

    }
}
export function generate(el) {
    // console.log(el)
    //注意属性 {id:app, style:{color:red,font-size:20px}}
    let children = genChildren(el)
    let code = `_c('${el.tag}',${el.attrs.length ? getProps(el.attrs) : 'undefined'},${children ? children : ''})`
    console.log(code,"code")
    return code
}