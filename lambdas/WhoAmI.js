
const https = require('https');

function getRequest(user) {
  const url = `${user}/user/`;
  var options = {
    'headers': {
      'Connection': 'keep-Alive',
      'Host': 'intra.epitech.eu'
    } 
  }
  return new Promise((resolve, reject) => {
     
    const req = https.get(url + '?format=json', options,  res => {
      let rawData = '';

      res.on('data', chunk => {
        rawData += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(rawData));
        } catch (err) {
          reject(new Error(err));
        }
      });
    });

    req.on('error', err => {
      reject(new Error(err));
    });
  });
}

exports.handler = async (event) => {
    console.log('event:', event);
    let response = {
      "dialogAction" : {
        "type": "Close",
        "fulfillmentState": "Fulfilled",
        "message": {
          "contentType": "PlainText"
        }
      }
    }
    
    if (event['sessionAttributes'] === null || (!event['sessionAttributes']['autologin'])) {
        response["dialogAction"]['fulfillmentState'] = "Failed";
        response["dialogAction"]['message']["content"] = "You must provide a valid autologin link to your Epitech Account to access information about your Epitech Profile."
        return response;
    }
    
    try {
        const result = await getRequest(event['sessionAttributes']['autologin']);
        console.log('result:️', result)
        const Login = `Current Login: ${result['login']}\n`;
        const Name = `Name: ${result['title']}\n`;
        const Promo = `Promotion: ${result['promo']}\n`;
        const Semester = `Current Semester: ${result['semester']}\n`;
        const EnrolledCourse = `Currently enrolled course: ${result['course_code']}\n`;
        const CurrentCredits = `Current Amount of Credits: ${result['credits']}\n`;
        let GPA = `GPA:\n`;
        result['gpa'].forEach((gpa) => {
          GPA += `${gpa['cycle']}: ${gpa['gpa']}\n`
        });
        const Location = `Current Campus: ${result['location']}\n`;
        const ImageLink = `Link to Image: intra.epitech.eu/${result['picture']}\n`;
        response["dialogAction"]['message']["content"] = Login + Name + Promo + Semester + EnrolledCourse + CurrentCredits + GPA + Location + ImageLink;
    } catch (error) {
        console.log('Error:️', error);
        response["dialogAction"]['fulfillmentState'] = "Failed";
        response["dialogAction"]['message']["content"] = "An internal Error occurred"
    }
    console.log(response)
    console.log(response["dialogAction"]['message']["content"])
    return response;
};
