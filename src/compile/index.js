import { parseHTML } from "./parseAst"
import { generate } from "./generate"

export function compileToFunction(el) {
    //解析成AST语法树
    // 1. 将html变为ast语法树
    let ast = parseHTML(el)
    // console.log(ast)
    // 2. ast语法树变成render函数 （1） ast语法树变成字符串 （2）字符串变成函数
    let code = generate(ast)  //_c解析元素， _v解析文本，_s解析变量
    // 3. 将render字符串变成函数
    let render = new Function(`with(this){return ${code}}`)
    
    return render
}

