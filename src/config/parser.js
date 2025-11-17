const parseRespOk = (data, message) => {
    return {
        status: true,
        message: message,
        data: data
    };
}

const parseRespError = (message) => {
    return {
        status: false,
        message: message
    };
}

export { parseRespOk, parseRespError };