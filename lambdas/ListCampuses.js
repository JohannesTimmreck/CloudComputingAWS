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
    
    await readFromDB().then(data => {
        console.log(data);
        let campus_string = '';
        data.Items.forEach(item => {
            console.log(item.campus);
            campus_string += item.Name + ", "; 
        })
        response["dialogAction"]['message']["content"] = 'We currently support the campuses: ' + campus_string.slice(0, -2);
    }).catch(error => {
        console.error('Error:️', error);
        response["dialogAction"]['fulfillmentState'] = "Failed"
        response["dialogAction"]['message']["content"] = "Could not retrieve list of campuses."
    })
    console.log(response)
    return response;
};