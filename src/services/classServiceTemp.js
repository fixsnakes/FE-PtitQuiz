import { CgTab } from "react-icons/cg";

const API_BASE_URL = "http://localhost:3000"

//"Authorization": `Bearer ${token}`

export const getClasses = async (limit,offset) => {
    try{

        const url = API_BASE_URL + `/api/classes?limit=${limit}&offset=${offset}`
        const token = localStorage.getItem('accessToken');

        if(!token){
            return {status:false, message: "Token access invalid"}
        }

        const response = fetch(url,{
            method: "GET",
            headers: {"Authorization": `Bearer ${token}`}
            }
        )

        const data = (await response).json()

        return data


    }catch(error){
        return {status: false, message: error.message}
    }
}


export const joinClass = async (classCode) => {
    try{
        
        const url = API_BASE_URL + `/api/classes/join?code=${classCode}`;
        const token = localStorage.getItem('accessToken');

        if(!token){
            return {status:false, message: 'Token invalid'}
        }

        const response = fetch(url, {
            method: "GET",
            headers: {"Authorization": `Bearer ${token}`}
        })

        const data = (await response).json()
        return data

    }catch(error){
        return {status: false, message: error.message}
    }
}