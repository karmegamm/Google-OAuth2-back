require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const axios = require('axios')
const {OAuth2Client } =require('google-auth-library')
const app = express();
const bp = require('body-parser')

// parse application/x-www-form-urlencoded
app.use(bp.urlencoded({ extended: true }));

// Enable CORS for your frontend
app.use(cors());

app.post('/', async (req, res) => {
  const redurl = 'http://127.0.0.1:3000/oauth';
  const Oauth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,redurl) ;
  const authUrl =Oauth2Client.generateAuthUrl({
    access_type:'offline',
    scope:'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
  });
  res.json({url:authUrl})
});


async function getUser (access_token){
  try {
    const url = `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`;
    const res = await axios.get(url);
    const data = res.data; // Axios automatically handles JSON response
    console.log('data', data);
  } catch (error) {
    console.error('Error fetching user data:', error);
    // Handle error appropriately
  }
}
app.get('/oauth', async (req, res) => {
  const code = req.query.code;
  try {
    const redurl = 'http://127.0.0.1:3000/oauth';
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redurl
    );

    // Use a different variable name here
    const tokenResponse = await oauth2Client.getToken(code);
    await oauth2Client.setCredentials(tokenResponse.tokens);
    console.log('Token received');

    const user = oauth2Client.credentials;
    console.log('User:', user);

    await getUser(user.access_token);
    res.redirect('http://localhost:5173');
  } catch (e) {
    console.log('Error:', e);
  }
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
