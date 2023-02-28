const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;  //标签名称
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;   //作用域 <span:xx>
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是 标签名<
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的  </div>
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+| ([^\s"'=<>`]+)))?/; // 匹配属性的 
// <div id=“app"></div>
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的  >
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

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
function createAstElement(tag, attrs){
    return {
        tag, //元素 div
        attrs, 
        children:[], //子节点
        type: 1,
        parent: null
    }
}

let root; //根元素
let createParent //当前元素的父亲
// 数据结构： 栈
let stack = []  // [div,h]
function start(tag, attrs) { //开始标签
    let element = createAstElement(tag, attrs)
    // console.log(tag, attrs,"开始标签")
    if(!root){
        root = element
    }
    createParent = element
    stack.push(element) //入栈
}

function charts(text) { //获取文本
    // console.log(text, "文本")
    // 空格 a全部去掉
    text = text.replace(/\s/g,'')
    if(text){
        createParent.children.push({
            type:3,
            text
        })
    }
}

function end(tag) { //结束的标签
    // console.log(tag,"结束标签")
    let element = stack.pop()
    createParent = stack[stack.length - 1]
    if(createParent){ //元素闭合
        element.parent = createParent.tag
        createParent.children.push(element)
    }
}
export function parseHTML(html) {
    while (html) { //html为空时结束
        //判断标签
        let textEnd = html.indexOf("<")
        if (textEnd === 0) { //标签
            // （1）开始标签
            const startTagMatch = parseStartTag() //开始标签的内容
            if(startTagMatch){
                start(startTagMatch.tagName, startTagMatch.attrs)
                continue;
            }
            // 结束标签
            let endTagMatch = html.match(endTag)
            if(endTagMatch){
                advance(endTagMatch[0].length)
                end(endTagMatch[1])
                continue;
            }
        }
        let text
        //文本
        if (textEnd > 0) {
            // 获取文本内容
            text = html.substring(0, textEnd)
        }
        if (text) {
            advance(text.length)
            charts(text)
        }
    }

    function parseStartTag() {
        const start = html.match(startTagOpen) //1结果 2 false
        if(!start) return
        //创建ast语法树
        let match = {
            tagName: start[1],
            attrs: []
        }
        // 删除开始标签
        advance(start[0].length)

        // 注意  多个遍历
        // 注意  >
        let attr
        let end
        while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
            // console.log(attr)
            match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] })
            advance(attr[0].length)
        }
        if (end) {
            advance(end[0].length)
            return match
        }
    }
    
    function advance(n) {
        html = html.substring(n)

    }
    return root
}