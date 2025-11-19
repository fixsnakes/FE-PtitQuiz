

export const getUserInformation = async () =>{
    const API_BASE_URL = "http://localhost:3000/api/user/profile"

    try{
        const token = localStorage.getItem("accessToken");
        if(!token){
            return "ACCESS TOKEN NOT FOUND"
        }

        const response = await fetch(API_BASE_URL,{
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