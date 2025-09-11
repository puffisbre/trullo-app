import {User} from '../model/User';

const getUsers = async () => {
    return User.find().lean();
}

export default getUsers;