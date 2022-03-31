import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { getActivities, getAllOwners, getRepos } from '@/services/clickhouse';
import { Col, Collapse, Row } from 'antd';

import DynamicDataTable from '@/pages/LowCodePlatform/DynamicDataTable';
import SQLEditor from '@/pages/LowCodePlatform/SQLEditor';

const { Panel } = Collapse;

export default class Index extends React.Component<any, any> {
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
  }

  render() {
    return (
      <PageContainer>
        <Row>
          <Col span={24}>
            <Collapse>
              <Panel header="SQL Editor" key="1">
                <SQLEditor />
              </Panel>
            </Collapse>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <DynamicDataTable />
          </Col>
        </Row>

        <Row>
          <Col span={24}>Charts here</Col>
        </Row>
      </PageContainer>
    );
  }
}
