import { request } from 'umi';

export async function runmySql(
  metricName: string,
  owner: string,
  repo: string,
  time: string = 'ALL_TIME',
  jsonObjects = false,
) {
  // let result_list = [];
  const result = await request(
    `http://127.0.0.1:5000/network_metrics/metric/${metricName}/${owner}/${repo}/${time}`,
    {
      method: 'GET',
    },
  ).catch((error) => {
    console.error('fetcherror: ' + error);
  });
  if (result.length === 0) {
    return 0;
  }
  // console.log(result);
  return { data: result[0][metricName] };
}
