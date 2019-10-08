import { TransactionArgumentLCS } from "./TransactionArgumentLCS"
import {EOL} from 'os'
import {BufferUtil} from '../../common/BufferUtil'

export class ProgramLCS {
    code: Uint8Array
    transactionArgs: TransactionArgumentLCS[]
    modules: Uint8Array[]

    constructor() {
        this.code = new Uint8Array()
        this.transactionArgs = []
        this.modules = []
    }

    setCode(code: string) {
        this.code = BufferUtil.fromString(code)
    }

    setCodeFromBuffer(code: Uint8Array) {
        this.code = code
    }

    addTransactionArg(arg:TransactionArgumentLCS) {
        this.transactionArgs.push(arg)
    }

    addModule(module: string) {
        this.modules.push(BufferUtil.fromHex(module))
    }

    toString(): string {
        let result = '{' + EOL
        result += 'code: "' + this.code.toString() + '",' + EOL
        let args:string[] = []
        this.transactionArgs.forEach(x => {
            args.push(x.toString())
        })
        let argStr = args.join(', ')
        argStr = '[' + argStr + ']'
        result += 'args: ' + argStr + ',' + EOL
        let modules:string[] = []
        this.modules.forEach(x => {
            modules.push('[' + BufferUtil.toHex(x) + ']')
        })
        let moduleStr = modules.join('')
        moduleStr = '[' + moduleStr + ']'
        result += 'modules: ' + moduleStr + ',' + EOL
        result += '}'
        return result 
    }
}