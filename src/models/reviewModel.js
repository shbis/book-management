import mongoose from 'mongoose'
const ObjectId = mongoose.Schema.Types.ObjectId

const reviewSchema = new mongoose.Schema(
    {
        bookId: { type: ObjectId, required: true, ref: 'Book' },
        reviewedBy: { type: String, required: true, default:'Guest', trim: true },
        reviewedAt: Date,
        rating:  Number,
        review: { type: String, trim: true },
        isDeleted: { type: Boolean, default: false }
    },
    { timestamps: true }
)

export default mongoose.model('Review', reviewSchema)
