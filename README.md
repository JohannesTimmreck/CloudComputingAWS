# CloudComputingAWS

This repository functions covers the deliverables for the Cloud Computing with AWS Epitech module.

# How to work with the bot
## Required Resources
The bot needs the lambdas inside of the of the lambdas folder. The Lambdas need to have the name of the File.
Additionally the lambdas need a DynamoDB Table named Campus to retrieve the information about the Campuses. 
All other information the bot returns are directly retrived from the intranet profile of the student via the Intranet API.

## Interact with the bot 
As we are retrieving information about the intranet profile most lambdas need the sessionAttribute autologin.
This value can be retrieved from the intranet in the Administration section.

## Supported Intents
- CurrentProjects
  returns currently running project
  (session required)
- GetAlerts
  returns currently active alerts
  (session required)
- GetNotifications
  returns current notifications
  (session required)
- WhoAmI
  Lists information about the currently logged in intranet user
  (session required)
- GetIntraLink
  returns autologin link to intranet
  (session required)
- ListCampuses
  Lists the campuses with information in the Campus Database
- CampusInformation
  returns information about one of the campuses
- WhatIsEpitech
  returns a short summary of Epitech