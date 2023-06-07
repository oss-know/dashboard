import React, { createRef } from 'react';
import { Line } from '@ant-design/plots';
// import { exportComponentAsJPEG } from 'react-component-export-image';
const config = {
  xField: 'time_point',
  yField: 'criticality_score',
  // annotations: {
  //   criticality_score: [
  //     {
  //       type: 'text',
  //       content: 'empty',
  //     },
  //   ],
  // },
  yAxis: {
    max: 1.5,
  },
  // seriesField: 'contributor_lookback_days',
  label: {
    content: (data: object) => {
      return data.criticality_score.toFixed(2);
    },
  },
  point: {
    size: 5,
    shape: 'round',
    style: {
      fill: 'white',
      stroke: '#5B8FF9',
      lineWidth: 2,
    },
  },
  state: {
    active: {
      style: {
        shadowBlur: 4,
        stroke: '#000',
        fill: 'red',
      },
    },
  },
  // interactions: [
  //   {
  //     type: 'marker-active',
  //   },
  // ],
};

const OWNER_REPO_CACHE = {};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class StatefulLineChart extends React.Component<any, any> {
  constructor(props) {
    super(props);

    this.lineRef = createRef();
  }

  componentDidUpdate(prevProps: Readonly<any>) {
    const { prevOnwer, prevRepo } = prevProps;
    const { owner, repo } = this.props;

    if (
      owner != prevOnwer &&
      repo != prevRepo &&
      owner != undefined &&
      repo != undefined &&
      !OWNER_REPO_CACHE.hasOwnProperty(`${owner}/${repo}`)
    ) {
      OWNER_REPO_CACHE[`${owner}/${repo}`] = true;
      const lineChart = this.lineRef.current.getChart();
      lineChart.downloadImage(`${owner}___${repo}.jpg`, 'jpg');
      // exportComponentAsJPEG(this.lineRef.current.getChart());
    }
  }

  render() {
    return (
      <Line
        ref={this.lineRef}
        interactions={[{ type: 'tooltip', enable: false }]}
        animation={false}
        theme={{
          styleSheet: {
            backgroundColor: 'white',
          },
        }}
        data={this.props.data}
        {...config}
      />
    );
  }
}
