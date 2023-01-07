const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const should = chai.should();
const User = require("../models/userModel");
const Url = require("../models/urlModel");
var server = require("../server");
before(async (done) => {
  const user = new User({
    name: "Ram Kumar",
    email: "raman@gmail.com",
    password: "$2b$10$EPUBDJ4snPt4aJ7qdkGG0erCLgNpGhrLeWQrWrNdxZiOBb0u5GRIq",
  });
  user.save(function (err) {});
  return done();
});
after(function (done) {
  User.collection
    .drop()
    .then(function () {
      // success
      console.log("User Collection dropped");
    })
    .catch(function () {
      // error handling
      console.warn(" collection may not exists!");
    });
  Url.collection
    .drop()
    .then(function () {
      // success
      console.log("Url Collection dropped");
    })
    .catch(function () {
      // error handling
      console.warn(" collection may not exists!");
    });
  done();
});
describe("/POST testing Url Routes without auth", () => {
  it("Creates short Url", (done) => {
    chai
      .request(server)
      .post("/api/v1/url/short")
      .send({
        url: "https://en.wikipedia.org/wiki/Spider-Man",
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("message");
        res.body.should.have.property("url");
        res.body.message.should.contain("success");
        done();
      });
  });
  it("Creates short Url for one time use", (done) => {
    chai
      .request(server)
      .post("/api/v1/url/singleUse")
      .send({
        url: "https://en.wikipedia.org/wiki/Superman",
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("message");
        res.body.should.have.property("url");
        res.body.message.should.contain("success");
        done();
      });
  });
});
describe("/POST testing Single use short Url without auth", () => {});
// describe("/GET testing redirect original url by shortUrl", () => {
//   it("redirect to original url", (done) => {
//     chai
//       .request(server)
//       .get("/api/v1/url/:urlId")
//       .redirects(0)
//       .end((err, res) => {
//         res.should.have.status(302);
//         done();
//       });
//   });
// });
describe("/POST testing Url routes with auth", () => {
  it("Creates short Url with auth", (done) => {
    chai
      .request(server)
      .post("/api/v1/auth/signin")
      .send({
        email: "raman@gmail.com",
        password: "Hello@123",
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("bearerToken");
        var token = res.body.bearerToken;
        chai
          .request(server)
          .post("/api/v1/url/auth/short")
          .set("Authorization", "Bearer " + token)
          .send({
            url: "https://en.wikipedia.org/wiki/Deadpool",
          })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a("object");
            res.body.should.have.property("message");
            res.body.should.have.property("url");
            res.body.message.should.contain("success");
          });

        done();
      });
  });
});
describe("/POST testing creation of One time short Url with auth", () => {
  it("Creates Single use short Url with auth", (done) => {
    chai
      .request(server)
      .post("/api/v1/auth/signin")
      .send({
        email: "raman@gmail.com",
        password: "Hello@123",
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("bearerToken");
        var token = res.body.bearerToken;
        chai
          .request(server)
          .post("/api/v1/url/auth/singleUse")
          .set("Authorization", "Bearer " + token)
          .send({
            url: "https://en.wikipedia.org/wiki/Hulk",
          })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a("object");
            res.body.should.have.property("message");
            res.body.should.have.property("url");
            res.body.message.should.contain("success");
          });

        done();
      });
  });
});

describe("/GET testing Fetch my Urls", () => {
  it("Fetch all the urls created by users", (done) => {
    chai
      .request(server)
      .post("/api/v1/auth/signin")
      .send({
        email: "raman@gmail.com",
        password: "Hello@123",
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("bearerToken");
        var token = res.body.bearerToken;
        chai
          .request(server)
          .post("/api/v1/url/auth/short")
          .set("Authorization", "Bearer " + token)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a("object");
            res.body.should.have.property("message");
            res.body.should.have.property("url");
            res.body.message.should.contain("success");
          });

        done();
      });
  });
});
