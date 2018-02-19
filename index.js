const request = require('request');
const app = require('express')();

const transit_realtime = require('./lib/gtfs-realtime').transit_realtime;

const appID = '513C01A12417617837563CAC2';
const vehiclesURL = `http://developer.trimet.org/ws/gtfs/VehiclePositions/appID/${appID}`;

const vehicleRequestSettings = {
  method: 'GET',
  url: vehiclesURL,
  encoding: null,
};

const marshalData = body => {
  const vehiclePositions = transit_realtime.FeedMessage.decode(body);

  const allPositions = vehiclePositions.entity.map(entity => {
    return entity;
  });

  return allPositions;
}

const requestData = (requestSettings, marshalData) => {
  return new Promise((resolve, reject) => {
    request(requestSettings, (err, res, body) => {
      if (!err && res.statusCode === 200) {
        resolve(marshalData(body));
      } else {
        reject(`Error: ${err}`);
      }
    });
  });
}

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/vehicles', async (req, res) => {
  const vehicles = await requestData(vehicleRequestSettings, marshalData);
  res.json(vehicles);
});

app.listen(3000, () => console.log('Listening on port 3000!'));
