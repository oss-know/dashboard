import React from 'react';

export default class SQLEditor extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = { sql: 'SELECT * FROM some_table' };
  }

  render() {
    return <div>SQL Editor</div>;
  }
}
