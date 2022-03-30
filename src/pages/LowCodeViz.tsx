import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { getActivities, getAllOwners, getRepos } from '@/services/clickhouse';
import ProForm, { ProFormSelect } from '@ant-design/pro-form';
import { Col, Row } from 'antd';

export default class LowCodeViz extends React.Component<any, any> {
  columns: ProColumns[] = [
    { title: 'Owner', dataIndex: 'owner', hideInTable: true },
    { title: 'Repo', dataIndex: 'repo', hideInTable: true },
    { title: 'GithubId', dataIndex: 'githubId', hideInTable: true },
    { title: 'GithubLogin', dataIndex: 'githubLogin' },
    { title: 'KnowledgeSharing', dataIndex: 'knowledgeSharing' },
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

    getAllOwners().then((data) => {
      const allOwners = [];
      data.forEach((item) => {
        allOwners.push({ value: item[0], label: item[0] });
      });
      this.setState({ allOwners: allOwners });
    });

    this.fetchRepos = this.fetchRepos.bind(this);
    this.onFormValueChange = this.onFormValueChange.bind(this);
    this.fetchActivities = this.fetchActivities.bind(this);
    this.handleRowClick = this.handleRowClick.bind(this);
  }

  fetchRepos(owner) {
    getRepos(owner).then((data) => {
      const repos = [];
      data.forEach((item) => {
        repos.push({
          label: item[0],
          value: item[0],
        });
      });
      this.setState({ repos: repos });
    });
  }

  fetchActivities(owner, repo) {
    getActivities(owner, repo).then((data) => {
      const tableData = [];
      for (let i = 0; i < data.length; ++i) {
        const item = data[i];
        tableData.push({
          key: '' + i,
          owner: item[0],
          repo: item[1],
          githubId: item[2],
          githubLogin: item[3],
          knowledgeSharing: item[4].toFixed(2),
          codeContribution: item[5].toFixed(2),
          issueCoordination: item[6].toFixed(2),
          progressControl: item[7].toFixed(2),
          codeTweaking: item[8].toFixed(2),
          issueReporting: item[9].toFixed(2),
        });
      }
      this.setState({ tableData: tableData });
    });
  }

  handleRowClick(row) {
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
        <ProForm onValuesChange={this.onFormValueChange} submitter={false}>
          {/*<Divider orientation="left">Horizontal</Divider>*/}
          <Row gutter={16}>
            <Col className="gutter-row" span={6}>
              <ProForm.Item>
                <ProFormSelect name="owner" options={this.state.allOwners} />
              </ProForm.Item>
            </Col>

            <Col className="gutter-row" span={6}>
              <ProForm.Item>
                <ProFormSelect name="repo" options={this.state.repos} />
              </ProForm.Item>
            </Col>
          </Row>
        </ProForm>

        <ProTable
          columns={this.columns}
          dataSource={this.state.tableData}
          search={false}
          onRow={(row) => {
            return {
              onClick: () => {
                this.handleRowClick(row);
              },
            };
          }}
        />
      </PageContainer>
    );
  }
}
