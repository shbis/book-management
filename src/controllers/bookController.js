import uploadFile from '../aws/aws.js';
import bookModel from '../models/bookModel.js'
import userModel from '../models/userModel.js'
import reviewModel from '../models/reviewModel.js'
import { dataValidation, isValidObjectId } from '../util/commonValidator.js';
import { isValidTitle, isValidText, isValidIsbn, isValidDate, isValidPlainText } from '../util/bookValidator.js'


//==========================================createBook==============================================>
const createBook = async (req, res) => {
  try {
    const reqBody = req.body
    const file = req.files
    const { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = reqBody

    //------------------------------body validation-----------------------------------
    if (!dataValidation(reqBody))
      return res.status(400).send({ status: false, message: 'Please fill the data' })

    if (Object.keys(reqBody).length > 8)
      return res.status(400).send({ status: false, message: 'You can\'t add extra field' })
    //------------------------------title validation-----------------------------------
    if (!title)
      return res.status(400).send({ status: false, message: 'title isn\'t present' })

    if (!isValidTitle(title))
      return res.status(400).send({ status: false, message: 'title is\'t valid' })

    //------------------------------file validation--------------------------------->
    if (!file[0])
      return res.status(400).send({ status: false, message: `Please provide image file` })

    //------------------------------excerpt validation-----------------------------------

    if (!excerpt)
      return res.status(400).send({ status: false, message: 'excerpt isn\'t present' })

    if (!isValidText(excerpt))
      return res.status(400).send({ status: false, message: 'excerpt isn\'t valid' })

    //--------------------------------userId validation------------------------------
    if (!userId)
      return res.status(400).send({ status: false, message: 'userId isn\'t present' })

    if (!isValidObjectId(userId))
      return res.status(400).send({ status: false, message: 'userId isn\'t valid' })

    //---------------------------------ISBN validation------------------------------
    if (!ISBN)
      return res.status(400).send({ status: false, message: 'ISBN isn\'t present' })

    if (!isValidIsbn(ISBN))
      return res.status(400).send({ status: false, message: 'ISBN isn\'t valid' })

    //---------------------------------category validation------------------------------
    if (!category)
      return res.status(400).send({ status: false, message: 'category isn\'t present' })

    if (!isValidPlainText(category))
      return res.status(400).send({ status: false, message: 'category isn\'t valid' })

    //---------------------------------category validation------------------------------
    if (!subcategory)
      return res.status(400).send({ status: false, message: 'subcategory isn\'t present' })

    if (!isValidPlainText(subcategory))
      return res.status(400).send({ status: false, message: 'subcategory isn\'t valid' })

    //----------------------------------- finding user---------------------------------
    if (!releasedAt)
      return res.status(400).send({ status: false, message: 'releasedAt isn\'t present' })

    if (!isValidDate(releasedAt))
      return res.status(400).send({ status: false, message: 'Please use \'YYYY-MM-DD\' this format' });

    //----------------------------------checking authorization---------------------------------

    if (req.user != userId)
      return res.status(403).send({ status: false, message: `This '${userId}' person is Unauthorized.` });

    // --------------------------------- finding user------------------------------
    const existUser = await userModel.findById(userId)

    if (!existUser)
      return res.status(404).send({ status: false, message: 'user doesn\'t exits' })

    //--------------------------------finding book-----------------------------------
    const existBook = await bookModel.find()

    //---------------------------finding duplicate title---------------------------
    for (let i = 0; i < existBook.length; i++) {
      if (existBook[i].title === title)
        return res.status(400).send({ status: false, message: 'title is Duplicate' })
    }

    //------------------------------finding duplicate ISBN------------------------------
    for (let i = 0; i < existBook.length; i++) {
      if (existBook[i].ISBN === ISBN)
        return res.status(400).send({ status: false, message: 'ISBN is Duplicate' })
    }

    //------------------------------upload on AWS------------------------------
    if (file) {
      const uploadedFileUrl = await uploadFile(file[0]);
      reqBody.bookCover = uploadedFileUrl
    } else {
      return res.status(400).send({ status: false, message: 'No file found.' })
    }

    //------------------------------------book creation-----------------------------------
    const saveData = await bookModel.create(reqBody)
    res.status(201).send({ status: true, message: 'Book created successfully', data: saveData })

  }
  catch (err) {
    res.status(500).send({ status: false, error: err.message })
  }
}


//===========================================getBooksQuery==============================================>
const getBooksQuery = async (req, res) => {
  try {
    const reqBody = req.query;
    const { userId, category, subcategory } = reqBody

    if ((Object.keys(reqBody).length === 0) || (userId || category || subcategory)) {
      //-------------------------------book finding----------------------------
      const books = await bookModel.find({ $and: [{ isDeleted: false }, reqBody] }).select({ title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 }).sort({ title: 1 });

      if (books.length === 0)
        return res.status(404).send({ status: false, message: `Book is\'nt found.` });

      return res.status(200).send({ status: true, message: 'Books list', data: books });

    } else
      return res.status(400).send({ status: false, message: 'Invalid query.' });

  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};


//==========================================getBookById==============================================>
const getBookById = async (req, res) => {
  try {
    const bookId = req.params.bookId

    //------------------------------objectId validation-----------------------------------
    if (!isValidObjectId(bookId))
      return res.status(400).send({ status: false, message: `This '${bookId}' bookId is Invalid` });

    const book = await bookModel.findById(bookId)

    if (!book)
      return res.status(404).send({ status: false, message: `No book found by this bookId '${bookId}'` })

    //-------------------------------checking authorization---------------------------------
    if (req.user != book.userId)
      return res.status(403).send({ status: false, message: `This '${bookId}' person is Unauthorized.` });

    if (bookId.isDeleted == true)
      return res.status(404).send({ status: false, message: `The Book Title '${bookId.title}' has been Deleted` })

    //-------------------------------finding Book----------------------------------
    const findBook = await bookModel.findById(bookId).select({ __v: 0, ISBN: 0 })

    //-------------------------------review according to question---------------------------------
    const review = await reviewModel.find({ bookId: bookId }).select({ isDelete: 0, createdAt: 0, updatedAt: 0, isDeleted: 0, __v: 0 })

    findBook._doc.reviewsData = review

    const value = `This book got '${findBook.reviews}'👁‍🗨 reviews`

    res.status(200).send({ status: true, message: 'Books List', reviews: value, data: findBook })

  }
  catch (err) {
    res.status(500).send({ status: false, error: err.message })
  }
}


//===========================================updateBookById==============================================>
const updateBookById = async (req, res) => {
  try {
    const reqBody = req.body;
    const bookId = req.params.bookId;
    const { title, excerpt, ISBN, releasedAt } = reqBody;

    //------------------------------body validation-----------------------------------
    if (!dataValidation(reqBody))
      return res.status(400).send({ status: false, message: 'Please fill the data' })

    if (Object.keys(reqBody).length > 4)
      return res.status(400).send({ status: false, message: 'You can\'t add extra field' })

    //------------------------------bookId validation-----------------------------------
    if (!isValidObjectId(bookId))
      return res.status(400).send({ status: false, message: `No book found by this bookId '${bookId}'` })

    //------------------------------title validation-----------------------------------
    if (!isValidTitle(title))
      return res.status(400).send({ status: false, message: 'title isn\'t valid' })

    //------------------------------excerpt validation-----------------------------------
    if (excerpt)
      if (!isValidText(excerpt))
        return res.status(400).send({ status: false, message: 'excerpt isn\'t valid' })

    //------------------------------ISBN validation-----------------------------------
    if (ISBN)
      if (!isValidIsbn(ISBN))
        return res.status(400).send({ status: false, message: 'ISBN isn\'t valid' })

    //------------------------------isValidDate validation-----------------------------------
    if (releasedAt)
      if (!isValidDate(releasedAt))
        return res.status(400).send({ status: false, message: 'Please use \'YYYY-MM-DD\' this format' });

    //-------------------finding Book by id through params----------------------
    const book = await bookModel.findById(bookId);

    if (!book)
      return res.status(404).send({ status: false, message: 'Book not found' });

    //---------------------------checking authorization-----------------------------
    if (req.user != book.userId)
      return res.status(403).send({ status: false, message: `This '${bookId}' person is Unauthorized.` });

    if (!book)
      return res.status(404).send({ status: false, message: "Book not found" });

    if (book.isDeleted === true)
      return res.status(400).send({ status: false, message: `This '${bookId}' book is already deleted.` })

    //---------------------------finding duplicate title---------------------------
    if (book.title === title)
      return res.status(400).send({ status: false, message: 'title is Duplicate' })

    //------------------------------finding duplicate ISBN------------------------------
    if (book.ISBN === ISBN)
      return res.status(400).send({ status: false, message: 'ISBN is Duplicate' })

    //------------------------------book updation------------------------------
    const updatedBook = await bookModel.findByIdAndUpdate({ _id: bookId }, { $set: reqBody }, { new: true });

    res.status(200).send({ status: true, message: "Updated Successfully", data: updatedBook })

  }
  catch (err) {
    res.status(500).send({ status: false, error: err.message })
  }
}

//===========================================DeleteBook==============================================>
const deleteBookById = async (req, res) => {
  try {
    const bookId = req.params.bookId;

    //---------------------------bookId validation-----------------------------
    if (!bookId)
      return res.status(400).send({ status: false, message: 'Please enter bookId' });

    if (!isValidObjectId(bookId))
      return res.status(400).send({ status: false, message: `Book Id ${bookId} in params is Invalid` })

    //-------------------finding Book by id through params----------------------
    const book = await bookModel.findById(bookId);

    if (!book)
      return res.status(404).send({ status: false, message: 'Book not found' });

    //---------------------------checking authorization-----------------------------
    if (req.user != book.userId)
      return res.status(403).send({ status: false, message: `This '${bookId}' person is Unauthorized.` });

    if (book.isDeleted == true)
      return res.status(404).send({ status: false, message: `The Book Title '${book.title}' has been Deleted` })

    //--------------------------------deleting Book by id-------------------------------------
    await bookModel.findByIdAndUpdate({ _id: bookId }, { $set: { isDeleted: true } }, { new: true })

    res.status(200).send({ status: true, message: 'Book has been deleted' })

  }
  catch (err) {
    res.status(500).send({ status: false, error: err.message })
  }

}


export { createBook, getBooksQuery, getBookById, updateBookById, deleteBookById }
