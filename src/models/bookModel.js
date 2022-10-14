import mongoose from 'mongoose'
const ObjectId = mongoose.Schema.Types.ObjectId

const bookSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, unique: true, trim: true },
        excerpt: { type: String, required: true, trim: true },
        bookCover: String,
        userId: { type: ObjectId, required: true, ref: 'User' },
        ISBN: { type: String, required: true, unique: true, trim: true },
        category: { type: String, required: true, trim: true },
        subcategory: { type: String, required: true },
        reviews: { type: Number, default: 0 },
        deletedAt: Date,
        isDeleted: { type: Boolean, default: false },
        releasedAt: { type: Date, required: true, trim: true },
    },
    { timestamps: true, versionKey: false }
)

export default mongoose.model('Book', bookSchema)
