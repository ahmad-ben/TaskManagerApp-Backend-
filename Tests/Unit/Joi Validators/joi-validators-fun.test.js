const {validatePostSingUpBodyUser} = require("../../../routes/users.route");

describe("Test all joi validators functions", () => {
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