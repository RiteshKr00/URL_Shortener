const chai = require("chai");
const mongoose = require("mongoose");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const should = chai.should();
var server = require("../server");
const User = require("../models/userModel");
const Url = require("../models/urlModel");
before((done) => {
  function clearDB() {
    for (const collection in mongoose.connection.collections) {
      mongoose.connection.collections[collection].deleteMany(function () {});
    }
    return done();
  }
  // const user = new User({
  //   name: "Ram Kumar",
  //   email: "raman@gmail.com",
  //   password: "$2b$10$EPUBDJ4snPt4aJ7qdkGG0erCLgNpGhrLeWQrWrNdxZiOBb0u5GRIq",
  // });

  if (mongoose.connection.readyState === 0) {
    mongoose.connect(config.db.test, (err) => {
      if (err) {
        throw err;
      }
      clearDB();
      // user.save(function (err) {});
      return;
    });
  } else {
    clearDB();
    // user.save(function (err) {});
    return;
  }
});
after(function (done) {
  User.collection
    .drop()
    .then(function () {
      // success
      console.log("Collection dropped");
    })
    .catch(function () {
      // error handling
      console.warn(" User collection may not exists!");
    });
  Url.collection
    .drop()
    .then(function () {
      // success
      console.log("Collection dropped");
    })
    .catch(function () {
      // error handling
      console.warn("Url collection may not exists!");
    });
  done();
});
describe("/POST Testing user signup", () => {
  it("create a new user", (done) => {
    chai
      .request(server)
      .post("/api/v1/auth/signup")
      .send({
        name: "shyamkumar",
        email: "ramkumard@gmail.com",
        password: "Hellos@123",
      })
      .end((err, res) => {
        console.log("===>", res.status);
        console.log(err);
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("message");
        res.body.should.have.property("user");
        res.body.message.should.contain(
          "Account Created Successfully Thank you for signing up"
        );
        // done();
      });
  });
});
describe("/POST Testing user signin", () => {
  it("logs in a user", (done) => {
    chai
      .request(server)
      .post("/api/v1/auth/signin")
      .send({
        email: "raman@gmail.com",
        password: "Hello@123",
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("message");
        res.body.should.have.property("bearerToken");
        res.body.message.should.contain("Signed In Successfully!");
        done();
      });
  });
});
describe("/GET testing user sign out", () => {
  it("sign out the user", (done) => {
    chai
      .request(server)
      .get("/api/v1/auth/signout")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("message");
        res.body.message.should.contain("Logged out successfully");
        done();
      });
  });
});
