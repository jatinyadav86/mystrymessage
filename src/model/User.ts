import mongoose, {Schema, Document} from "mongoose";

export interface Message extends Document{
    content: string,
    createdAt: Date
}

const MessageSchema: Schema<Message> = new Schema({
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
})

export interface User extends Document{
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpiry: Date;
    isVerified : boolean;
    isAcceptingMessages: boolean;
    messages: Message[]
}

const UserSchema: Schema<User> = new Schema({
    username: {
        type: String,
        required: [true, "Useername is requireed"],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        match: [/.+\@.+\..+/,'please use a valid email address']
    },
    password: {
        type: String,
        sparse: true,
    },
    verifyCode: {
        type: String,
        sparse: true,
        // required: [true, "Verify code is requireed"]
    },
    verifyCodeExpiry: {
        type: Date,
        sparse: true,
        // required: [true, "Verify code is requireed"]
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isAcceptingMessages: {
        type: Boolean,
        default: true
    },
    messages: [MessageSchema]
})

const UserModel = mongoose.models.User || mongoose.model<User>("User", UserSchema)

export default UserModel