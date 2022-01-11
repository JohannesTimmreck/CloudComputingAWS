const https = require("https");

const getWeek = () => {
  let start = "";
  let end = "";
  const curr = new Date();
  let firstday = new Date(curr.setDate(curr.getDate() - curr.getDay()));
  let lastday = new Date(curr.setDate(curr.getDate() - curr.getDay()+6));

  start = firstday.getFullYear() + "-" + (firstday.getMonth()+1) + "-" + firstday.getDate();
  end = lastday.getFullYear() + "-" + (lastday.getMonth()+1) + "-" + lastday.getDate();

  return {start, end};
};

const getProjectsData = (autologin) => {
  const date = getWeek();
  const url = `${autologin}/module/board/?format=json&start=${date.start}&end=${date.end}`;

  return new Promise((resolve, reject) => https.get(url, {
      params: { format: "json" },
    }, res => {
      let rawData = "";
      res.on('data', (chunk) => rawData += chunk);
      res.on('end', () => resolve(JSON.parse(rawData)));
      res.on('error', (e) => {
        console.error(e)
        reject(e);
      });
    }));
};

const parseProjectsData = (data, autologin) => {
  if (!data) return [];

  const projects = data.map((acti) => {
    let rest = `${acti.type_acti}-${acti.num}-${acti.acti_title}`;

    rest = rest.replace(/ /g, "-").replace(/#/g, "").replace(/-+/g, "-");

    return {
      title: acti.acti_title,
      start: acti.begin_acti,
      end: acti.end_acti,
      url: `${autologin}/module/${acti.scolaryear}/${acti.codemodule}/${acti.codeinstance}`,
    };
  });

  return projects;
};

exports.handler = async (event) => {
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
    
    
    await getProjectsData(event['sessionAttributes']['autologin'])
    .then((data) => (data ? parseProjectsData(data, event['sessionAttributes']['autologin']) : []))
    .then((projects) => {
      if (projects.length === 0) {
        response["dialogAction"]['message']["content"] = 'You currently have no active projects';
      }
      let answer = 'Project Overview:\n';
      projects.forEach((project) => {
        answer += `Title: ${project['title']}\nStart: ${project['start']}\nEnd: ${project['end']}\nLink: ${project['url']}\n-----------\n`;
      })
      response["dialogAction"]['message']["content"] = answer;
    })
    .catch((err) => {
      console.error(err)
      });
    console.log(response);
    console.log(response["dialogAction"]['message']["content"]);
    return response;
  
}