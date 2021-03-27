// @ts-expect-error
import Wemo from 'wemo-client';

const wemo = new Wemo();
let client: any;

function foundDevice(err: Error | null, device: Record<string, any>) {
  if (device.friendlyName === 'Furbutt') {
    console.log('Wemo Switch found: %s', device.friendlyName);

    client = wemo.client(device);
  }

  if (err) {
    console.log(err);
    foundDevice(null, device)
  }
}

// rediscover device if it changes port
wemo.discover(foundDevice);

export const setState = function setState(stateValue: 1 | 0) {
  return new Promise((resolve, reject) => {
    client.setBinaryState(stateValue, (err: Error, state: any) => {
      if (err) reject(err);

      resolve(state);
    });
  })
}

export const getState = function getState() {
  return new Promise((resolve, reject) => {
    client.getBinaryState((err: Error, state: any) => {
      if (err) reject(err);
      let st;

      try {
        st = parseInt(state, 10);
      } catch (e) {
        reject(e)
      }

      resolve(st === 0 ? 'off' : 'on');
    });
  })
}



