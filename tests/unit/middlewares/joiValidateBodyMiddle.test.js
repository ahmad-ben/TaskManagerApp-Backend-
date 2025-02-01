const appError = require('../../../errors/appError');
const joiValidateBodyMiddle = require('../../../middlewares/joiValidateBodyMiddle');

describe("Test all joi validators functions", () => {
  describe("General body validator middleware -wrapper- function.", () => {
    let innerFun;
    it("Should throw an error if the inner function return an object with error property", () => {
      innerFun = () => {return {error: "error message"}}; 
      const returnedFun = joiValidateBodyMiddle(innerFun);
      expect(() => returnedFun({})).toThrow(appError); 
    })

    it("Should call the next fun if the inner fun object doesn't have an error property", () => {
      innerFun = () => {return {}}; 
      const next = jest.fn();
      const returnedFun = joiValidateBodyMiddle(innerFun);
      expect(() => returnedFun({}, "", next)).not.toThrow(appError);
      expect(next).toHaveBeenCalled();
    })
  })

})