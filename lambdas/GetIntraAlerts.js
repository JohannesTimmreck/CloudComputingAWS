const https = require('https');

function getRequest(user) {
  const url = `${user}/user/notification/alert`;
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
        console.log('re:️', result)
        console.log('result:️', result)
        if (Object.keys(result).length === 0) {
            response["dialogAction"]['message']["content"] = "You don't have any current alerts!";
        } else {
            response["dialogAction"]['message']["content"] = 'There are alerts, this feature is coming soon!'
        }
    } catch (error) {
        console.log('Error:️', error);
        response["dialogAction"]['fulfillmentState'] = "Failed"
        response["dialogAction"]['message']["content"] = "An internal Error occurred"
    }
    console.log(response)
    return response;
};
