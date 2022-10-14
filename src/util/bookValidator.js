import moment from 'moment'

//---------------------------------------isTitleAny-------------------------------------------
const isValidTitle = (title) => {
    if (typeof title == "string" && title.trim().length != 0 && title.match(/^[a-z A-Z 0-9,.-?%!&]{2,}$/i))
        return true
    return false
}

//----------------------------------------name--------------------------------------------
const isValidPlainText = (plainText) => {
    if ((typeof plainText == "string" && plainText.trim().length != 0 && plainText.match(/^[A-Z a-z 0-9,.-?%!&]{2,}$/)))
        return true
    return false
};

//-------------------------------reviews----------------------------
const isValidReviews = (review) => {
    const rev = review.trim()
    if (typeof rev == "string" && rev.trim().length != 0)
        return true
    return false
}

//-------------------------------ISBN----------------------------
const isValidIsbn = (value) => {
    const isbn = value.trim()
    if (typeof isbn == "string" && isbn.match(/^(?=(?:\D*\d){13}(?:(?:\D*\d){3})?$)[\d-]+$/))
        return true
    return false
}

//-------------------------------isValidDate----------------------------
const isValidDate = (date) => {
    const value = date
    const check = moment(value, 'YYYY-MM-DD', true).isValid();
    return check
};

//---------------------------------------validText-------------------------------------------
const isValidText = (text) => {
    if (typeof text == "string" && text.trim().length != 0 && text.match(/^[a-z A-Z 0-9,.-?!@#$%&()]{2,}$/i))
        return true
    return false
}

export { isValidTitle, isValidReviews, isValidIsbn, isValidDate, isValidText, isValidPlainText }
