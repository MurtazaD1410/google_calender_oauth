const express = require("express");
const app = express();
const dotenv = require("dotenv");
const { google } = require("googleapis");
const dayjs = require("dayjs");

dotenv.config();

app.set("view engine", "ejs");

const calendar = google.calendar({
  version: "v3",
  auth: process.env.API_KEY,
});

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);

const scopes = ["https://www.googleapis.com/auth/calendar"];

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/rest/v1/calendar/init/", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });

  res.redirect(url);
});

app.get("/google/redirect", async (req, res) => {
  const code = req.query.code;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  res.redirect("/");
});

app.get("/rest/v1/calendar/redirect/", async (req, res) => {
  const { data } = await calendar.events.list({
    calendarId: "primary",
    auth: oauth2Client,
    timeMin: dayjs(new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: "startTime",
  });

  res.send({
    message: "Events fetched successfully",
    data: data.items,
  });
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || "5000"}.`);
});
