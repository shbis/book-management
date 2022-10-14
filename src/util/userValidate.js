//---------------isValidStr-----------------
const isValidStr = (name) => {
    const regex = /^[A-Z a-z]{2,}$/.test(name)
    return regex
};
 
//-----------------isValidTitleEnum-------------------
const isValidEnum = (title) => {
    return ['Mr', 'Mrs', 'Miss'].indexOf(title) !== -1
};

//----------------------isValidNumber-----------------------
const isValidNumber = (phone) => {
    let regex = /^[6-9]{1}[0-9]{9}$/.test(phone)
    return regex
};

//---------------------------isValidEmail---------------------------
const isValidEmail = (email) => {
    const regex = /^([a-zA-Z0-9_.]+@[a-z]+\.[a-z]{2,3})?$/.test(email)
    return regex
};

//-------------------------------------isValidPwd-------------------------------------
const isValidPwd = (password) => {
    const regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(password)
    return regex
};


export { isValidStr, isValidEnum, isValidNumber, isValidEmail, isValidPwd }

