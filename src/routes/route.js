//===============================route.js=================================>
import express from 'express'
const router = express.Router()
import { createUser, userLogin } from '../controllers/userController.js'
import { createBook, getBooksQuery, getBookById, updateBookById, deleteBookById }
    from '../controllers/bookController.js'
import { addReview, updateReview, deleteReview }
    from '../controllers/reviewController.js'
import auth from '../middleware/auth.js'


//-----------user API------------->
router.post('/register', createUser)
router.post('/login', userLogin)

//----------------book API------------------>
router.post('/books', auth, createBook)
router.get('/books', auth, getBooksQuery)
router.get('/books/:bookId', auth, getBookById)
router.put('/books/:bookId', auth, updateBookById)
router.delete('/books/:bookId', auth, deleteBookById)

//-----------------Review API----------------->
router.post('/books/:bookId/review', addReview)
router.put("/books/:bookId/review/:reviewId", updateReview)
router.delete("/books/:bookId/review/:reviewId", deleteReview)


export default router
