import { parentPort } from 'node:worker_threads';

parentPort.on('message', (message) => {
  let sum = 0;
  for (const num of message.numbers) {
    sum += num;
  }
  parentPort.postMessage(sum);
});
