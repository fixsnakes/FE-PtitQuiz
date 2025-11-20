
const API_BASE_URL = "http://localhost:3000"


// get user information
export const getUserInformation = async () =>{
    const URL = API_BASE_URL +  "/api/user/profile"

    try{
        const token = localStorage.getItem("accessToken");
        if(!token){
            return "ACCESS TOKEN NOT FOUND"
        }

        const response = await fetch(URL,{
            method: "GET",
            headers: {
                "Content-Type" : "application/json",
                "Authorization": `Bearer ${token}`,
            }
        })


        if(response.ok){
            const data = await response.json()
            return data
            
        }

    }catch(error){
        return error
    }

}


export const UpdateProfile = async (newfullName,email) =>{
    const url = API_BASE_URL + "/api/user/profile"

    try{
        const token = localStorage.getItem("accessToken");

        if (!token){
            return {status: false, message: "Token Access Not Valid"}
        }

        const response = await fetch(url,{
            method: "POST",
            headers: {
                "Content-Type" : "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({fullName: newfullName, email: email})
        });
        
        const data =  await response.json()

        if (response.ok){
           

            return {status: true, data}
        }

        return {status: false, data}

        
    }catch(error){
        return {status: false, message: error.message}
    }
}


export const ChangePassword = async (currentPassword,newPassword) => {
    try{

        const url = API_BASE_URL + "/api/user/changepassword"
        const token = localStorage.getItem('accessToken')
        const response = await fetch(url,{
            method: "POST",
            headers: {
                "Content-Type" : "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({currentPassword: currentPassword, newPassword: newPassword})
        })

        return await response.json()

    }catch(error){
        return {status: false, message: error.message}
    }
}