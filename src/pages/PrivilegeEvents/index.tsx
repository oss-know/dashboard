import React, { useEffect, useState } from 'react';  
  
interface IDataItem {  
  actor_login: string;  
  added_to_project: string;  
  converted_note_to_issue: string;  
  deployed: string;  
  deployment_environment_changed: string;  
  locked: string;  
  merged: string;  
  moved_columns_in_project: string;  
  pinned: string;  
  removed_from_project: string;  
  review_dismissed: string;  
  transferred: string;  
  unlocked: string;  
  unpinned: string;  
  user_blocked: string;  
}  
  
const DataComponent: React.FC = () => {  
  const [data, setData] = useState<IDataItem[]>([]);  
  
  useEffect(() => {  
    fetchData();  
  }, []);  
  
  const fetchData = async () => {  
    try {  
      const response = await fetch('http://127.0.0.1:5000/metrics/api/privilege_events', {  
        method: 'GET'  
      });  
      const jsonData = await response.json();  
      setData(jsonData);  
    } catch (error) {  
      console.log(error);  
    }  
  };  
  
  return (  
    <div>  
      <h2>Data Component</h2>  
      <table>  
        <thead>  
          <tr>  
            <th>actor_login</th>  
            <th>added_to_project</th>  
            <th>converted_note_to_issue</th>  
            <th>deployed</th>  
            <th>deployment_environment_changed</th>  
            <th>locked</th>  
            <th>merged</th>  
            <th>moved_columns_in_project</th>  
            <th>pinned</th>  
            <th>removed_from_project</th>  
            <th>review_dismissed</th>  
            <th>transferred</th>  
            <th>unlocked</th>  
            <th>unpinned</th>  
            <th>user_blocked</th>  
          </tr>  
        </thead>  
        <tbody>  
          {data.map((item, index) => (  
            <tr key={index}>  
              <td>{item.actor_login}</td>  
              <td>{item.added_to_project}</td>  
              <td>{item.converted_note_to_issue}</td>  
              <td>{item.deployed}</td>  
              <td>{item.deployment_environment_changed}</td>  
              <td>{item.locked}</td>  
              <td>{item.merged}</td>  
              <td>{item.moved_columns_in_project}</td>  
              <td>{item.pinned}</td>  
              <td>{item.removed_from_project}</td>  
              <td>{item.review_dismissed}</td>  
              <td>{item.transferred}</td>  
              <td>{item.unlocked}</td>  
              <td>{item.unpinned}</td>  
              <td>{item.user_blocked}</td>  
            </tr>  
          ))}  
        </tbody>  
      </table>  
    </div>  
  );  
};  
  
export default DataComponent;  