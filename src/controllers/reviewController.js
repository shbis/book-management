import bookModel from '../models/bookModel.js'
import reviewModel from '../models/reviewModel.js'
import { dataValidation, isValidObjectId, isValidRevDate, isValidRating } from '../util/commonValidator.js';
import { isValidPlainText, isValidReviews } from '../util/bookValidator.js'

//==========================================addReview==============================================>
const addReview = async (req, res) => {
    try {
        const bookId = req.params.bookId
        const reqBody = req.body

        const { reviewedBy, reviewedAt, rating, review } = reqBody

        //------------------------------body validation-----------------------------------
        if (!dataValidation(reqBody))
            return res.status(400).send({ status: false, message: 'Please fill the data' })

        if (Object.keys(reqBody).length > 4)
            return res.status(400).send({ status: false, message: 'You can\'t add extra field' })

        //------------------------------bookId validation-----------------------------------
        if (!isValidObjectId(bookId))
            return res.status(400).send({ status: false, message: `This BookId '${bookId}' is Invalid` })

        //------------------------------book exits or not-----------------------------------
        const findBook = await bookModel.findById(bookId)

        if (!findBook)
            return res.status(404).send({ status: false, message: `Book Not Found` })

        if (findBook.isDeleted == true)
            return res.status(404).send({ status: false, message: `The book '${findBook.title}' has been Deleted ` })

        //------------------------------reviewedBy validation-----------------------------------
        if (reviewedBy == '')
            return res.status(400).send({ status: false, message: `The Reviewer's name is Required` })

        if (!reviewedAt)
            return res.status(400).send({ status: false, message: `The reviewedAt Field is Required` })

        if (!isValidRevDate(reviewedAt))
            return res.status(400).send({ status: false, message: `Your date ${reviewedAt} doest follow this date 'YYYY-MM-DD formate'` })

        //------------------------------rating validation-----------------------------------
        if (rating === 0 || rating === '')
            return res.status(400).send({ status: false, message: `The Rating Field cant be 0  or Empty` })

        if (!rating)
            return res.status(400).send({ status: false, message: `The Rating Field is Required` })

        if (isValidRating(rating))
            return res.status(400).send({ status: false, message: `The review rating should be 1 to 5` })

        //------------------------------review validation-----------------------------------
        if (!review)
            return res.status(400).send({ status: false, message: `The review Field is Required` })

        reqBody.bookId = bookId

        //------------------------------review validation-----------------------------------
        const result = await reviewModel.create(reqBody)
        await bookModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: 1 } }, { new: true })

        const finalReview = await reviewModel.findOne({ _id: result._id }).select({ isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 })

        finalReview.reviewedAt = new Date()

        //------------------------------sending response-----------------------------------
        res.status(201).send({ status: true, message: `New Review added Successfully to the Book'${findBook.title}'`, data: finalReview })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



//==========================================updateReview==============================================>
const updateReview = async (req, res) => {
    try {
        const reqBody = req.body
        const bookId = req.params.bookId
        const reviewId = req.params.reviewId
        const { reviewedBy, rating, review } = reqBody

        //------------------------------body validation-----------------------------------
        if (!dataValidation(reqBody))
            return res.status(400).send({ status: false, message: 'Please fill the data' })

        if (Object.keys(reqBody).length > 3)
            return res.status(400).send({ status: false, message: 'You can\'t add extra field' })

        //---------------------------------bookId validation------------------------------
        if (!bookId)
            return res.status(400).send({ status: false, message: 'bookId isn\'t present' })

        if (!isValidObjectId(bookId))
            return res.status(400).send({ status: false, message: `This '${bookId}' bookId isn\'t valid` })

        //---------------------------------reviewId validation------------------------------
        if (!reviewId)
            return res.status(400).send({ status: false, message: 'reviewId isn\'t present' })

        if (!isValidObjectId(reviewId))
            return res.status(400).send({ status: false, message: `This '${reviewId}' reviewId isn\'t valid` })

        //---------------------------------Creating Object------------------------------
        const filter = {}

        if (reviewedBy)
            if (!isValidPlainText(reviewedBy))
                return res.status(400).send({ status: false, message: `This '${reviewedBy}' isn\'t valid user` })
        filter['reviewedBy'] = reviewedBy


        if (rating)
            if (!(rating >= 1 && rating <= 5))
                return res.status(400).send({ status: false, message: 'lease rate between 1 to 5' })
        filter['rating'] = rating


        if (review)
            if (!isValidReviews(review))
                return res.status(400).send({ status: false, message: `This '${review}' isn\'t valid review` })
        filter['review'] = review


        //---------------------------------reviewId validation------------------------------
        const exitsBook = await bookModel.findById(bookId)

        if (!exitsBook)
            return res.status(404).send({ status: false, message: `No book found by this bookId ${bookId}` })

        if (exitsBook.isDeleted === true)
            return res.status(404).send({ status: false, message: `The book title '${exitsBook.title}' is already deleted` })

        //---------------------------------reviewId validation------------------------------
        const exitsReview = await reviewModel.findById(reviewId)

        if (!exitsReview)
            return res.status(404).send({ status: false, message: `No review found by this ${reviewId} reviewId` })

        if (exitsReview.isDeleted === true)
            return res.status(404).send({ status: false, message: `The review '${exitsReview._id}' is already deleted` })

        //---------------------------------reviewId validation------------------------------
        await reviewModel.findOneAndUpdate({ _id: reviewId }, { $set: filter }, { new: true })

        const reviewsData = await reviewModel.findOne({ _id: reviewId }).select({ bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, review: 1 })

        //---------------------------------destructuring------------------------------
        const { _id, title, excerpt, userId, category, subcategory, isDeleted, reviews, deletedAt, releaseAt, createdAt, updatedAt } = exitsBook

        //---------------------------------according to question------------------------------
        const data = { _id, title, excerpt, userId, category, subcategory, isDeleted, reviews, deletedAt, releaseAt, createdAt, updatedAt, reviewsData }

        res.status(200).send({ status: true, message: "Success", data: data })
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}


//=============================================deleteReview===============================================>
const deleteReview = async (req, res) => {
    try {
        const bookId = req.params.bookId
        const reviewId = req.params.reviewId

        //---------------------------------bookId validation------------------------------
        if (!isValidObjectId(bookId))
            return res.status(400).send({ status: false, message: 'Enter Valid Book Id.' })

        //---------------------------------reviewId validation------------------------------
        if (!isValidObjectId(reviewId))
            return res.status(400).send({ status: false, message: 'Enter Valid Review Id.' })

        //---------------------------------finding book------------------------------
        let book = await bookModel.findById( bookId)

        if (!book)
            return res.status(404).send({ status: true, message: 'Book Does Not Found.' })
        
        if (book.isDeleted === true)
            return res.status(404).send({ status: false, message: `The review '${book.title}' is already deleted` })

        //---------------------------------checking review value------------------------------
        if (book.reviews <= 0)
            return res.status(404).send({ status: true, message: 'First post your review review.' })

        let reviews = book.reviews

        //---------------------------------deleting review------------------------------
        const review = await reviewModel.findOneAndUpdate({ _id: reviewId, bookId: bookId, isDeleted: false }, { $set: { isDeleted: true } })

        if (!review)
            return res.status(404).send({ status: true, message: 'Review Does Not Found.' })

        //-----------------------------updating review value---------------------------
        await bookModel.findOneAndUpdate({ _id: bookId }, { reviews: reviews - 1 })

        res.status(200).send({ status: true, message: 'Review Deleted' })

    } catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
}



export { addReview, updateReview, deleteReview }
