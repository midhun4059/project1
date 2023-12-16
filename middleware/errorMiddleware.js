function errorHandler(err, req, res, next) {
  console.error(err.stack);

  
  if (err.statusCode) {
    res.status(err.statusCode).send(err.message);
  } else {
    
    res.status(500).send('Internal Server Error');
  }
}

module.exports = errorHandler;