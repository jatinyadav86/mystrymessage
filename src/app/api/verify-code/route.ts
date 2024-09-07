import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {
    dbConnect()

    try {
        
        const {username,code} = await request.json()

        const user = await UserModel.findOne({username})

        if(!user){
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                }, { status: 500 })
        }

        const isCodeValid = user.verifyCode === code
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

        if(isCodeValid && isCodeNotExpired){
            user.isVerified = true
            await user.save()
            return Response.json(
                {
                    success: true,
                    message: "User is verified successfully"
                }, { status: 200 })
        }else if(!isCodeNotExpired){
            return Response.json(
                {
                    success: false,
                    message: "Verification code has expired, please signup again to get new verify code"
                }, { status: 400 })
        } else {
            return Response.json(
                {
                    success: false,
                    message: "Incorrect Verification code"
                }, { status: 400 })
        }



    } catch (error) {
        console.error("Error verifying user", error)
        return Response.json(
            {
                success: false,
                message: "Error verifying user"
            }, { status: 500 })
    }
}


