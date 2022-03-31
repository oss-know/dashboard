import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { getActivities, getAllOwners, getRepos } from '@/services/clickhouse';
import ProForm, { ProFormSelect } from '@ant-design/pro-form';
import { ChoroplethMap } from '@ant-design/maps';
import { Col, Row } from 'antd';
import { Collapse } from 'antd';

const { Panel } = Collapse;
type RowBase = {
  key: number;
};

type ActivityRow = RowBase & CKData.Activity;

export default class LowCodeViz extends React.Component<any, any> {
  columns: ProColumns[] = [
    { title: 'Owner', dataIndex: 'owner', hideInTable: true },
    { title: 'Repo', dataIndex: 'repo', hideInTable: true },
    { title: 'GithubId', dataIndex: 'githubId', hideInTable: true },
    { title: 'GithubLogin', dataIndex: 'githubLogin' },
    {
      title: 'KnowledgeSharing',
      dataIndex: 'knowledgeSharing',
      sorter: (a: ActivityRow, b: ActivityRow) => a.knowledgeSharing - b.knowledgeSharing,
    },
    { title: 'CodeContribution', dataIndex: 'codeContribution' },
    { title: 'IssueCoordination', dataIndex: 'issueCoordination' },
    { title: 'ProgressControl', dataIndex: 'progressControl' },
    { title: 'CodeTweaking', dataIndex: 'codeTweaking' },
    { title: 'IssueReporting', dataIndex: 'issueReporting' },
  ];

  constructor(props: any) {
    super(props);
    this.state = {
      owner: '',
      repo: '',
      githubID: '',
      githubLogin: '',
      email: '',
      repos: [],
      tableData: [],
    };

    getAllOwners().then((owners) => {
      this.setState({ allOwners: owners.map((owner) => ({ value: owner, label: owner })) });
    });

    this.fetchRepos = this.fetchRepos.bind(this);
    this.onFormValueChange = this.onFormValueChange.bind(this);
    this.fetchActivities = this.fetchActivities.bind(this);
    this.handleRowClick = this.handleRowClick.bind(this);
  }

  fetchRepos(owner: string) {
    getRepos(owner).then((allRepos) => {
      const repoOptions = allRepos.map((repo) => ({ label: repo, value: repo }));
      this.setState({ repos: repoOptions });
    });
  }

  fetchActivities(owner: string, repo: string) {
    getActivities(owner, repo).then((activities) => {
      const tableData: ActivityRow[] = [];
      activities.forEach((activity, i) => {
        const row: ActivityRow = { ...activity, key: i };
        tableData.push(row);
      });

      this.setState({ tableData });
    });
  }

  handleRowClick(row: ActivityRow) {
    this.setState({
      githubLogin: row.githubLogin,
    });
  }

  onFormValueChange(changeValues) {
    if (changeValues.hasOwnProperty('owner')) {
      const newOwner = changeValues.owner;
      this.setState({ owner: newOwner });
      this.fetchRepos(newOwner);
    }
    if (changeValues.hasOwnProperty('repo')) {
      this.setState({ repo: changeValues.repo });
      this.fetchActivities(this.state.owner, changeValues.repo);
    }
  }

  render() {
    return (
      <PageContainer>
        <Row>
          <Col span={24}>
            <Collapse>
              <Panel header="SQL Editor" key="1">
                SQL Editor Here
              </Panel>
            </Collapse>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <ProTable
              columns={this.columns}
              dataSource={this.state.tableData}
              search={false}
              onRow={(row: ActivityRow) => {
                return {
                  onClick: () => {
                    this.handleRowClick(row);
                  },
                };
              }}
            />
          </Col>
        </Row>

        <Row>
          <Col span={24}>Charts here</Col>
        </Row>
      </PageContainer>
    );
  }
}
