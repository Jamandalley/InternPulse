const responseModel = (isSuccessful, message, data = []) => {
    return {
      IsSuccessful: isSuccessful,
      message: message,
      data: data,
    };
  };
  
module.exports = responseModel;
