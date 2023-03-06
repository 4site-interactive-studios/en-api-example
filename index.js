const path = require('path')
const fs = require('fs')

const express = require('express')
require('dotenv').config()

const app = express()
const port = 3000

app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'))
})

app.post('/submit', async (req, res) => {
  console.log(req.body);

  // Very quick method to format our request data
  // EN supporter create/update endpoint requires the *name* of the question or field, not its ID.
  // Questions must be under the "questions" nested JSON object
  // https://speca.io/engagingnetworks/engaging-network-services?key=726cda99f0551ef286486bb847f5fb5d#add-or-update-supporter
  // This will take any form field that has a name starting with "question." and put it into that nested object.
  let payload = {}
  Object.keys(req.body).forEach((entry) => {
    if (entry.startsWith('question.')) {
      if (typeof payload.questions === 'undefined') payload.questions = {}
      let key = entry.split('.')[1]
      payload['questions'][key] = req.body[entry]
    } else {
      payload[entry] = req.body[entry]
    }
  })


  const token = await getAPIToken();
  const response = await fetch(`https://${process.env.EN_DATA_CENTER}.engagingnetworks.app/ens/service/supporter`, {
    method: 'POST',
    headers: {
      'ens-auth-token': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  })
  const json = await response.json()
  res.json(json);
})

// Route for listing the supporter fields in the account
app.get('/fields', async (req, res) => {
  const token = await getAPIToken()
  const response = await fetch(`https://${process.env.EN_DATA_CENTER}.engagingnetworks.app/ens/service/supporter/fields`, {
    method: 'GET',
    headers: {
      'ens-auth-token': token,
      'Content-Type': 'application/json',
    }
  })
  const json = await response.json()
  res.json(json);
})


// Route for listing the supporter questions in the account
app.get('/questions', async (req, res) => {
  const token = await getAPIToken()
  const response = await fetch(`https://${process.env.EN_DATA_CENTER}.engagingnetworks.app/ens/service/supporter/questions`, {
    method: 'GET',
    headers: {
      'ens-auth-token': token,
      'Content-Type': 'application/json',
    }
  })
  const json = await response.json()
  res.json(json);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

async function getAPIToken() {
  //Very simple file cache for our token
  try {
    if (fs.existsSync('./token.txt')) {
      const lastModifiedTime = fs.statSync('./token.txt').mtime.getTime();
      const currentTime = new Date().getTime();

      // Check if the file was modified in the last 30 minutes.
      // The token should last for 1 hour (3600000)
      if (currentTime - lastModifiedTime < 30 * 60 * 1000) {
        console.log(`Getting token from file cache. Cache is ${(currentTime - lastModifiedTime) / 1000} seconds old.`)
        return fs.readFileSync('./token.txt', 'utf8');
      } else {
        console.log('refreshing token from api..')
        //otherwise refresh it from the authentication endpoint.
        const token = await getAPITokenFromAPI();
        fs.writeFileSync('./token.txt', token);
        return token;
      }
    } else {
      console.log('File cache does not exist, making first request and creating file..')
      const token = await getAPITokenFromAPI();
      fs.writeFileSync('./token.txt', token);
      return token;
    }
  } catch (error) {
    console.log(error)
  }
}

async function getAPITokenFromAPI() {
  //The EN authentication endpoint is weird because you need to send data with application/json Content-Type
  //but with a plain string body. Most convenient HTTP libraries won't allow this.
  const response = await fetch(`https://${process.env.EN_DATA_CENTER}.engagingnetworks.app/ens/service/authenticate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: process.env.EN_API_KEY,
  })
  const json = await response.json()
  return json['ens-auth-token'];
}
