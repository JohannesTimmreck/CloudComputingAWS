const AWS = require('aws-sdk');
const campus_db = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

function readFromDB() {
    const params = {
        TableName: 'Campus',
        limit: 30
    }
    return campus_db.scan(params).promise();
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
    const campus = event["currentIntent"]["slots"]["Location"];
    const information = event["currentIntent"]["slots"]["Information"];
    
    await readFromDB().then(data => {
        console.log(data);
        data.Items.forEach(item => {
            if (item.Name === campus) {
                if (information === "Team")
                    response["dialogAction"]['message']["content"] = 'The following people are in charge of the campus in ' + item.Name + ': ' + item.Team;
                else if (information === "Location")
                    response["dialogAction"]['message']["content"] = 'Here is the link on Maps for the campus in ' + item.Name + ': ' + item.Location;
                else if (information === "OpeningHours")
                    response["dialogAction"]['message']["content"] = 'The Campus in ' + item.Name + ' is open between: ' + item.OpeningHours;
            }
        });
        if (!response["dialogAction"]['message']["content"]) {
            console.log("Requested Campus not present: " + event["currentIntent"]["slots"]["Location"]);
            response["dialogAction"]['fulfillmentState'] = "Failed";
            response["dialogAction"]['message']["content"] = "Unfortunately we do not yet have information about that Campus.";
        }
    }).catch(error => {
        console.error('Error:️', error);
        response["dialogAction"]['fulfillmentState'] = "Failed";
        response["dialogAction"]['message']["content"] = "Could not retrieve list of campuses.";
    })
    console.log(response)
    return response;
};
