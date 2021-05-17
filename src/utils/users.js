var users = [];

//add user
const addUser = ({ id, username, room } = {}) => {
    //clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //validate the data
    if (!username || !room) {
        return {
            error: 'username and room are required',
        }
    };

    //check for existing users
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    });

    //validate username
    if (existingUser) {
        return {
            error: 'username already is in use',
        };
    };

    //store user
    const user = { id, username, room };
    users.push(user);
    return {user};
};

const removeUser = (id) => {
    let index = users.findIndex((user) => {
        return user.id === id
    });

    if (index !== -1) {
        return users.splice(index, 1)[0];
    };
};

const getUser = (id) => {
    let foundUser = users.find((user) => {
        return user.id === id;
    });

    return foundUser;
};

const getUsersInRoom = (room) => {
    let allUsers = users.filter((user) => {
        return user.room === room.toLowerCase();
    });

    return allUsers;
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
};