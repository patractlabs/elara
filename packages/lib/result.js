class Result {
    constructor(code, message, data) {
        this.code = code
        this.message = message
        this.data = data
    }
    static Factory(code, message, data) {
        return new Result(code, message, data)
    }
    static WrapResult(data) {
        if (data)
            return new Result(0, '', data)
        else
            return new Result(-1, 'Data is Null', '')
    }
    toString() {
        return JSON.stringify({ 'code': this.code, 'mssage': this.message, 'data': this.data })
    }
    isOk() {
        return 0 == this.code ? true : false
    }

}

module.exports = Result