import axios from 'axios';

const core_autobody_base = "https://core-autobody-staging-da026c3517ad.herokuapp.com";
// const core_autobody_base = "http://localhost:3000";

export const loginByPwd = async (email:string, password:string) => {
    return new Promise((resolve, reject) =>{
        axios.post(`${core_autobody_base}/api/login/password`, {
            email,
            password
        })
        .then(res=>resolve(res.data))
        .catch(err=> resolve({success: false}))
    })
}

export const verifyToken = async (token: any) => {
    return new Promise((resolve, reject) =>{
        axios.post(`${core_autobody_base}/api/verify/token`, {
            token: token.toString()
        })
        .then(res=>resolve(res.data))
        .catch(err=> resolve({success: false}))
    })
}