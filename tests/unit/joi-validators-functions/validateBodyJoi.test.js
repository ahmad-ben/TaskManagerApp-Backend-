const { validateBodyJoi } = require("../../../routes/lists.route");

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