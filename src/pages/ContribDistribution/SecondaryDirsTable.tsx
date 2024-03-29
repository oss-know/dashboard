import React from 'react';
import { Divider, Table, Tag, Tooltip } from 'antd';
import styles from '@/pages/ContribDistribution/index.less';
import { getIntl } from 'umi';
import {
  ownerRepoDirDomainDeveloperTzDistSql,
  ownerRepoDirDomainFileTzDistSql,
  ownerRepoDirRegionDeveloperTzDistSql,
  ownerRepoDirRegionFileTzDistSql,
} from '@/pages/ContribDistribution/DataSQLs';
import { runSql } from '@/services/clickhouse';
import { Pie } from '@ant-design/plots';

const intl = getIntl();
const SECONDARY_DIR_TABLE_COLS = [
  {
    title: intl.formatMessage({ id: 'contribDist.secondaryDirTable.colname.selectedDirs' }),
    dataIndex: 'secondaryDir',
  },
  {
    title: intl.formatMessage({ id: 'contribDist.secondaryDirTable.colname.fileRegionDist' }),
    dataIndex: 'fileRegionDist',
    render: secondaryDirTableCellRender,
  },
  {
    title: intl.formatMessage({ id: 'contribDist.secondaryDirTable.colname.fileEmailDist' }),
    dataIndex: 'fileEmailDist',
    render: secondaryDirTableCellRender,
  },
  {
    title: intl.formatMessage({ id: 'contribDist.secondaryDirTable.colname.developerRegionDist' }),
    dataIndex: 'developerRegionDist',
    render: secondaryDirTableCellRender,
  },
  {
    title: intl.formatMessage({ id: 'contribDist.secondaryDirTable.colname.developerEmailDist' }),
    dataIndex: 'developerEmailDist',
    render: secondaryDirTableCellRender,
  },
];

const REGION_MAP = {};
REGION_MAP['欧洲西部'] = 'WEST_EUROPE';
REGION_MAP['欧洲东部'] = 'EAST_EUROPE';
REGION_MAP['澳洲'] = 'AUSTRALIA';
REGION_MAP['北美'] = 'NORTH_AMERICA';
REGION_MAP['日韩'] = 'JP_KR';
REGION_MAP['印度'] = 'INDIA';
REGION_MAP['中国'] = 'CHINA';

function getTagTzDist(owner, repo, secondaryDir, type, key, since, until, callback) {
  let title = '';

  switch (type) {
    case 'file_region_dist':
      runSql(
        ownerRepoDirRegionFileTzDistSql(owner, repo, secondaryDir, REGION_MAP[key], since, until),
      ).then((result) => {
        title = result.data
          .map((item) => {
            const tz = item[0];
            const count = item[1];
            const tzStr = tz > 0 ? `+${tz}` : `${tz}`;
            return `${tzStr}: ${count}`;
          })
          .join(', ');
        callback(title);
      });
      break;
    case 'file_domain_dist':
      runSql(ownerRepoDirDomainFileTzDistSql(owner, repo, secondaryDir, key, since, until)).then(
        (result) => {
          title = result.data
            .map((item) => {
              const tz = item[0];
              const count = item[1];

              const tzStr = tz > 0 ? `+${tz}` : `${tz}`;
              return `${tzStr}: ${count}`;
            })
            .join(', ');

          callback(title);
        },
      );
      break;
    case 'developer_region_dist':
      runSql(
        ownerRepoDirRegionDeveloperTzDistSql(
          owner,
          repo,
          secondaryDir,
          REGION_MAP[key],
          since,
          until,
        ),
      ).then((result) => {
        title = result.data
          .map((item) => {
            const tz = item[0];
            const count = item[1];

            const tzStr = tz > 0 ? `+${tz}` : `${tz}`;
            return `${tzStr}: ${count}`;
          })
          .join(', ');

        callback(title);
      });
      break;
    case 'developer_domain_dist':
      runSql(
        ownerRepoDirDomainDeveloperTzDistSql(owner, repo, secondaryDir, key, since, until),
      ).then((result) => {
        title = result.data
          .map((item) => {
            const tz = item[0];
            const count = item[1];
            const tzStr = tz > 0 ? `+${tz}` : `${tz}`;
            return `${tzStr}: ${count}`;
          })
          .join(', ');

        callback(title);
      });
      break;
    default:
      break;
  }
}

class TzDistTitle extends React.Component<any, any> {
  constructor(props) {
    super(props);

    this.state = {
      title: '',
    };
    const { owner, repo, dir, type, regionKey, since, until } = this.props;
    getTagTzDist(owner, repo, dir, type, regionKey, since, until, (title) => {
      this.setState({ title });
    });
  }

  render() {
    return <div>{this.state.title}</div>;
  }
}

function secondaryDirTableCellRender(cellData, rowData) {
  const { secondaryDir } = rowData;
  const tags = cellData.map((info, index) => {
    const { key, value, type, owner, repo, since, until } = info;
    const line = `${key}: ${value}`;
    const childKey = `${rowData.secondaryDir}-${key}-${index}`;
    // TODO It's super weried that JS always complain 'each children in list should have uniq key'
    // TODO while it's really 'uniq' enough
    let color = 'volcano';
    if (typeof key == 'string' && key.toLowerCase().indexOf('huawei') != -1) {
      color = '#108ee9';
    }
    return (
      <Tooltip
        key={childKey}
        trigger="click"
        title={
          <TzDistTitle
            owner={owner}
            repo={repo}
            dir={secondaryDir}
            type={type}
            regionKey={key}
            since={since}
            until={until}
          />
        }
      >
        <Tag key={key} color={color}>
          {line}
        </Tag>
      </Tooltip>
    );
  });
  if (
    (cellData && cellData.length > 1 && cellData[0].type == 'file_domain_dist') ||
    (cellData && cellData.length > 1 && cellData[0].type == 'developer_domain_dist')
  ) {
    return (
      <div>
        <Pie
          angleField={'value'}
          colorField={'key'}
          data={cellData.slice(0, 10)}
          animation={false}
          legend={false}
          radius={0.9}
          theme={{
            colors10: [
              '#3682be',
              '#45a776',
              '#f05326',
              '#a69754',
              '#334f65',
              '#b3974e',
              '#38cb7d',
              '#ddae33',
              '#844bb3',
              '#93c555',
              '#5f6694',
              '#df3881',
            ],
          }}
          label={{
            type: 'spider',
            // content: '{name} {percentage} {value}',
            content: '{name} {value}',
          }}
        />
        {tags}
      </div>
    );
  }
  return <div>{tags}</div>;
}

export default class SecondaryDirsTable extends React.Component<any, any> {
  render() {
    return (
      <div>
        {!!this.props.secondaryDirsTableData.length && (
          <div>
            <Divider>
              {intl.formatMessage({ id: 'contribDist.secondaryDirTable.header.secondaryDir' })}
            </Divider>
            <span className={styles.componentIntro}>
              {intl.formatMessage({ id: 'contribDist.secondaryDirTable.desc' })}
            </span>
            <Table
              columns={SECONDARY_DIR_TABLE_COLS}
              dataSource={this.props.secondaryDirsTableData}
              onRow={(row) => {
                return {
                  onClick: () => {
                    if (this.props.onSecondaryDirRowClicked) {
                      this.props.onSecondaryDirRowClicked(row);
                    }
                  },
                };
              }}
            />
          </div>
        )}
      </div>
    );
  }
}
