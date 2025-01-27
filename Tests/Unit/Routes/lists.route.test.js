const ObjectId= require("mongoose").Types.ObjectId;
const {validateBodyJoi, validateParamsJoi} = require("../../../routes/lists.route");
require("../../../components/validation")();

describe("Test validateBodyJoi function.", () => {
  it(
    "Should return an error if the title object didn't fit one of the requirements.", 
    () => {
      const inValidInputs = ["", false, {}, undefined, {title: ""}];

      for(const invalidInput of inValidInputs)
        expect(validateBodyJoi(invalidInput)).toHaveProperty("error");
  })

  it("Should return the input itself if it's fit all the requirements.", () => {
      const validInput = {title: "List 1 title."};
      const res = validateBodyJoi(validInput);

      expect(res).toMatchObject({value: validInput});
  })    
});

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
      const res = validateBodyJoi({id: validMongoDBId});
      expect(res).toMatchObject({value: {id: validMongoDBId}});
  })
});