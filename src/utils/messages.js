const generateMessage = (username,text) => {
    return {
        message: text,
        username: username,
        createdAt: new Date().getTime(),
    }
};

const generateLocationMessage = (username,url) => {
    if (username === undefined) {
        username = "admin";
    }
    return {
        url: url,
        username: username,
        createdAt: new Date().getTime(),
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage,
};