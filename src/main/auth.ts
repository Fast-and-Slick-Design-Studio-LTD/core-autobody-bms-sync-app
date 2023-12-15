import axios from 'axios';

const CORE_AUTOBODY_BASE = 'https://core-autobody-7fa82fc0a053.herokuapp.com';
// const CORE_AUTOBODY_BASE = "http://localhost:3000";

export const loginByPwd = async (email: string, password: string) => {
  return new Promise((resolve) => {
    axios
      .post(`${CORE_AUTOBODY_BASE}/api/login/password`, {
        email,
        password,
      })
      .then((res) => resolve(res.data))
      .catch(() => resolve({ success: false }));
  });
};

export const verifyToken = async (token: any) => {
  return new Promise((resolve) => {
    axios
      .post(`${CORE_AUTOBODY_BASE}/api/verify/token`, {
        token: token.toString(),
      })
      .then((res) => resolve(res.data))
      .catch(() => resolve({ success: false }));
  });
};
