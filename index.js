const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const registerRoute = require("./routes/register");
const loginRoute = require("./routes/login");
const sendRequestRoute = require("./routes/send-request");
const getDetailsRoute = require("./routes/get-details");
const userProfileRoute = require("./routes/user-profile");
const schoolAllRoute = require("./routes/school-all");
const schoolOneRoute = require("./routes/school-one");
const courseAllRoute = require("./routes/course-all");
const courseOneRoute = require("./routes/course-one");
const checkRequestsSentRoute = require("./routes/check-requests-sent");
const checkRequestsForMeRoute = require("./routes/check-requests-for-me");
const checkTakenRequestsRoute = require("./routes/check-taken-requests");
const takeRequestsRoute = require("./routes/take-requests");
const confirmTutorRoute = require("./routes/confirm-tutor");
const deleteRequestRoute = require("./routes/delete-request");

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
  })
);

app.use("/register", registerRoute);
app.use("/login", loginRoute);
app.use("/get-details", getDetailsRoute);
app.use("/user-profile", userProfileRoute);
app.use("/school-all", schoolAllRoute);
app.use("/school-one", schoolOneRoute);
app.use("/course-all", courseAllRoute);
app.use("/course-one", courseOneRoute);
app.use("/send-request", sendRequestRoute);
app.use("/check-requests-sent", checkRequestsSentRoute);
app.use("/check-requests-for-me", checkRequestsForMeRoute);
app.use("/check-taken-requests", checkTakenRequestsRoute);
app.use("/take-requests", takeRequestsRoute);
app.use("/confirm-tutor", confirmTutorRoute);
app.use("/delete-request", deleteRequestRoute);

app.listen(PORT, () => console.log(`Server started.`));
