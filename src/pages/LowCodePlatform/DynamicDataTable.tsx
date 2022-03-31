import React from 'react';
import ProTable from '@ant-design/pro-table';
type RowBase = {
  key: number;
};

type ActivityRow = RowBase & CKData.Activity;

export default class DynamicDataTable extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    this.state = {
      tableData: [],
      columns: [
        { title: 'foo', dataIndex: 'foo' },
        { title: 'bar', dataIndex: 'bar' },
      ],
    };

    this.handleRowClick = this.handleRowClick.bind(this);
  }
  handleRowClick(row: any) {
    console.log('row clicked:', row);
  }

  render() {
    return (
      <ProTable
        columns={this.state.columns}
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
    );
  }
}
