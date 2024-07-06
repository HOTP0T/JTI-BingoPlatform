import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  cloud: {
    projectID: 3703777,
    // Test runs with the same name groups test runs together
    name: 'k6test'
  }
};

export default function () {
  http.get('https://test.k6.io');
  sleep(1);
}
