import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, enum: ['Mr', 'Mrs', 'Miss'], trim: true },
        name: { type: String, required: true, trim: true },
        phone: { type: String, required: true, unique: true, trim: true },
        email: { type: String }, 
        password: { type: String, required: true, trim: true },
        address: {
            street: { type: String, required: true, trim: true },
            city: { type: String, required: true, trim: true },
            pincode: { type: String, required: true, minlength: 6, trim: true }
        }
    },
    { timestamps: true }
)

export default mongoose.model('User', userSchema)
