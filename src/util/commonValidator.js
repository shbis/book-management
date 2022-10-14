import mongoose from 'mongoose'
import moment from 'moment'

// ------------dataValidation-----------
const dataValidation = (data) => {
    if (Object.keys(data).length > 0)
        return true
    return false
}
//----------------mongoDbId-------------------
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id)
};


//----------------isValidRevDate--------------
const isValidRevDate = (reviewedAt) => {
    const value = reviewedAt;
    const check = moment(value, 'YYYY-MM-DD', true).isValid();
    return check
}

//----------isValidRating-----------
const isValidRating = (rating) => {
    const value = /^([1-5]|1[05])$/
    if (value.test(rating))
        return false
    return true
}

export { dataValidation, isValidObjectId, isValidRevDate, isValidRating }