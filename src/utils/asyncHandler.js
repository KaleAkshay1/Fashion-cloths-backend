const asyncHandler = (func) => async (req, res, next) => {
  try {
    await func(req, res, next);
  } catch (error) {
    console.log("Async Handler therow Error is ", error.message);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export default asyncHandler;
