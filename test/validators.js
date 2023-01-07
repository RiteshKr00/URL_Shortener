const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const should = chai.should();
const expect = chai.expect;
const {
  validateName,
  validateEmail,
  validatePassword,
} = require("../utils/validators");

describe("Testing Validators", function () {
  it("should return true for valid name", function () {
    expect(validateName("Ritesh")).to.equal(true);
  });
  it("should return false for valid Name", function () {
    expect(validateName("Ram83")).to.equal(false);
  });
  it("should return true for valid email", function () {
    expect(validateEmail("riteshkr@gmail.com")).to.equal(true);
  });
  it("should return false for invalid email", function () {
    expect(validateEmail("rk7.gmail.com")).to.equal(false);
  });
  it("should return true for valid password", function () {
    expect(validatePassword("Ritesh@7")).to.equal(true);
  });
  it("should return false for invalid password", function () {
    expect(validatePassword("Riteshkr")).to.equal(false);
  });
});
