import React, { useEffect, useState } from 'react';  
  
interface ICountMetricsData {  
  author_name: string;  
  commit_num: number;  
  line_of_code: number;  
}  
  
interface IDeveloperNetworkMetricsData {  
  author_name: string;  
  degree_centrality: number;  
  eigenvector_centrality: number;  
}  
  
const DataComponent: React.FC = () => {  
  const [countMetricsData, setCountMetricsData] = useState<ICountMetricsData[]>([]);  
  const [developerNetworkMetricsData, setDeveloperNetworkMetricsData] = useState<IDeveloperNetworkMetricsData[]>([]);  
  
  useEffect(() => {  
    fetchCountMetricsData();  
    fetchDeveloperNetworkMetricsData();  
  }, []);  
  
  const fetchCountMetricsData = async () => {  
    try {  
      const response = await fetch('http://127.0.0.1:5000/metrics/api/count_metrics', {  
        method: 'GET'  
      });  
      const jsonData = await response.json();  
      setCountMetricsData(jsonData);  
    } catch (error) {  
      console.log(error);  
    }  
  };  
  
  const fetchDeveloperNetworkMetricsData = async () => {  
    try {  
      const response = await fetch('http://127.0.0.1:5000/metrics/api/developer_network_metrics', {  
        method: 'GET'  
      });  
      const jsonData = await response.json();  
      setDeveloperNetworkMetricsData(jsonData);  
    } catch (error) {  
      console.log(error);  
    }  
  };  
  
  return (  
    <div>  
      <h2>Count Metrics</h2>  
      <table>  
        <thead>  
          <tr>  
            <th>Author Name</th>  
            <th>Commit Num</th>  
            <th>Line of Code</th>  
          </tr>  
        </thead>  
        <tbody>  
          {countMetricsData.map((item, index) => (  
            <tr key={index}>  
              <td>{item.author_name}</td>  
              <td>{item.commit_num}</td>  
              <td>{item.line_of_code}</td>  
            </tr>  
          ))}  
        </tbody>  
      </table>  
  
      <h2>Developer Network Metrics</h2>  
      <table>  
        <thead>  
          <tr>  
            <th>Author Name</th>  
            <th>Degree Centrality</th>  
            <th>Eigenvector Centrality</th>  
          </tr>  
        </thead>  
        <tbody>  
          {developerNetworkMetricsData.map((item, index) => (  
            <tr key={index}>  
              <td>{item.author_name}</td>  
              <td>{item.degree_centrality}</td>  
              <td>{item.eigenvector_centrality}</td>  
            </tr>  
          ))}  
        </tbody>  
      </table>  
    </div>  
  );  
};  
  
export default DataComponent;  