function errorHandler(err, req, res, next) {
    
    let statusCode = 500;
    let message = 'Internal Server Error';
  
    
    if (err.name === 'ValidationError') {
      
      statusCode = 400;
      message = err.message;
    } else if (err.name === 'JsonWebTokenError') {
      
      statusCode = 401;
      message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
      
      statusCode = 401;
      message = 'Token expired';
    }
  
    
    console.error('Error:', err);
  
    
    res.status(statusCode).json({ error: message });
  }
  
  module.exports = errorHandler;
  