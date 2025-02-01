const { validateParamsJoi, validateBodyJoi } = require("../../../routes/lists.route");
const ObjectId = require("mongoose").Types.ObjectId;
require("../../../components/validation")(); 

describe("Test validateParamsJoi function.", () => {
  it(
    "Should return an error if the object input didn't fit one of the requirements.", 
    () => {
      const inValidInputs = ["", false, {}, undefined, {id: 123456}];

      for(const invalidInput of inValidInputs)
        expect(validateParamsJoi(invalidInput)).toHaveProperty("error");
  })

  it("Should return the input itself if it's fit all the requirements.", () => {
      const validMongoDBId = new ObjectId();
      const res = validateBodyJoi({id: validMongoDBId}); //Test body not params!!
      expect(res).toMatchObject({value: {id: validMongoDBId}});
  })
});