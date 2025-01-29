const {validatePostSingUpBodyUser} = require("../../../routes/users.route");
const joiBodyMiddlewareWrapper = require("../../../middlewares/joiValidateBodyMiddle");
const appError = require("../../../errors/appError");

describe("Test all joi validators functions", () => {
  describe("General body validator middleware -wrapper- function.", () => {
    let innerFun;
    it("Should throw an error if the inner function return an object with error property", () => {
      innerFun = () => {return {error: "error message"}}; // Override inner parameter.
      const returnedFun = joiBodyMiddlewareWrapper(innerFun);
      expect(() => returnedFun({body: "test"})).toThrow(appError); //?? Why it's require a data parameter after override.
    })
  })

  describe("Body validator function for sign up.", () => {
    it("Should throw an error if the body value isn't valid", () => {
      const invalidVals = [
        false, "", {email: "a"}, {email: "ahmedbenchakhter@gamil.com", password: "123"}, undefined
      ];

      for(const invalidVal of invalidVals){
        const result = validatePostSingUpBodyUser(invalidVal);
        expect(result).toHaveProperty("error")
      }
    })

    it("Should return the valid body if it's valid", () => {
      const validBody = {email: "ahmedbenchakhter@gamil.com", password: "valid_password"}

      const result = validatePostSingUpBodyUser(validBody);
      expect(result).toHaveProperty("value", validBody);
    })
  })
})