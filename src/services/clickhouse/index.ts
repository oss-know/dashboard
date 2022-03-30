import { request } from 'umi';

export async function getAllOwners() {
  return request('/clickhouse/sql', {
    method: 'POST',
    params: {
      sql: 'SELECT DISTINCT owner FROM activities',
    },
  });
}

export async function getRepos(owner: string) {
  return request('/clickhouse/sql', {
    method: 'POST',
    params: {
      sql: `SELECT DISTINCT repo FROM activities WHERE owner = '${owner}'`,
    },
  });
}

export async function getActivities(owner: string, repo: string) {
  return request('/clickhouse/sql', {
    method: 'POST',
    params: {
      sql: `SELECT * FROM activities WHERE owner = '${owner}' AND repo ='${repo}'`,
    },
  });
}
