import { InfluxDB, FieldType } from 'influx';
import { promises as sensor } from 'node-dht-sensor';
import pm2 from 'pm2';
import { setState, getState } from './wemo';

const pass = process.env.IN_PASS;
const influx = new InfluxDB({
  host: 'localhost',
  username: 'grafana',
  password: pass,
  database: 'home',
  schema: [
    {
      measurement: 'response_times',
      fields: {
        path: FieldType.STRING,
        duration: FieldType.INTEGER
      },
      tags: [
        'host',
        'sensor'
      ]
    }
  ]
});


const main = async function main(count: number = 0) {
  const { temperature, humidity } = await sensor.read(11, 4)

  if (humidity <= 70) {
    try {
      await setState(0)
    } catch (error) {
      console.log(error)
      influx.writePoints([{
        measurement: 'hvac_error',
        tags: { sensor: 'hvac' },
        fields: { errorOffCount: 1 }
      }])

      if (count < 1) {
        await main(1);
      }
    }
  }

  if (humidity >= 76) {
    try {
      await setState(1)
    } catch (error) {
      console.log(error)
      influx.writePoints([{
        measurement: 'hvac_error',
        tags: { sensor: 'hvac' },
        fields: { errorOnCount: 1 }
      }])
    }

    if (count < 1) {
      await main(1);
    }
  }


  let switchState;
  try {
    switchState = await getState();
  } catch (error) {
    console.log(error);
    pm2.restart('humid', console.log);
  }

  console.log(`Switch state: ${switchState}`);
  console.log(`temp: ${temperature}°C, humidity: ${humidity}%`);

  try {
    influx.writePoints([{
      measurement: 'humidity',
      tags: { sensor: 'humidity' },
      fields: { humidity }
    },
    {
      measurement: 'temp',
      tags: { sensor: 'temperature' },
      fields: { temperature }
    },
    {
      measurement: 'hvac',
      tags: { sensor: 'hvac' },
      fields: { status: switchState }
    }])
  } catch (e) {
    console.log(e)
  }
}

setInterval(main, 3000);
