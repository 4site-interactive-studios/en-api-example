# Engaging Networks API demo

**Please note this code is for demonstrative purposes only and is not production ready.**

This code demonstrates a simple way of interacting with the [Supporter Services endpoint](https://speca.io/engagingnetworks/engaging-network-services?key=726cda99f0551ef286486bb847f5fb5d#add-or-update-supporter) of the Engaging Networks API using NodeJS and Express to create a new supporter or update an exisiting one.

Features include:

* Authentication
* A simple file-based cache for your auth token
* An HTML form with JS for submitting data to the server
* Server-side requests for creating and updating the supporter based on form data submitted
* Routes for viewing the supporter fields and questions in the account

Please note this code does not work for the "processing a page" endpoint.

## Requirements

* NodeJS current LTS v18.14.2 or later

## Setup

* Create an API user following the [instructions here](https://www.engagingnetworks.support/knowledge-base/permissions-creating-an-api-user/). Ensure your user has the permission ‘Manage individual supporters’ (under Data Management) and the IP address where the code will run is added to the Remote Address field.
* Clone this repo
* Run `npm install`
* Run `cp .env.example .env`and fill out your API user's API key and your region (us or ca)
* Run `npm run start`
* Visit in your browser `localhost:3000`

You can modify the form in `index.html` to suit what you want to test.  You can visit `http://localhost:3000/fields` and `http://localhost:3000/questions` to see their fields and questions in your account. You should use the "name" property from those JSON responses.

**Questions or opt ins must have their name attribute prefixed with `question.` like `question.default opt in`**.
