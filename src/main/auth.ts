import axios from 'axios';

const core_autobody_base = "https://core-autobody-staging-da026c3517ad.herokuapp.com/";

export const loginByPwd = async (email:string, password:string) => {
    return new Promise((resolve, reject) =>{
        axios.post(`${core_autobody_base}/api/login/password`, {
            email,
            password
        })
        .then(res=>resolve(res.data))
        .catch(err=> reject(err))
    })
}

export const verifyToken = async (token: string) => {

}