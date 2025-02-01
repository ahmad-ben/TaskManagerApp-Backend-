const appError = require("../../../errors/appError");
const verifyJWTMiddle = require("../../../middlewares/verifyJWTMiddle");

describe("verifyJWTMiddle Function Tests.", () => {
  const req = {};
  req.header = () => {}
  
  it("Should return error if there is no JWT", () => {
    try{
      verifyJWTMiddle(req)
    }catch(error){
      expect(error).toBeInstanceOf(appError);
      expect(error).toHaveProperty('message', 'No JWT provided.');
    }
  })

  it("Should return error if the JWT isn't valid", () => {
    req.header = () => {return "12345678"}
 
    try{
      verifyJWTMiddle(req)
    }catch(error){
      expect(error).toBeInstanceOf(appError);
      expect(error).toHaveProperty('message', 'jwt malformed');
    }
  })

});