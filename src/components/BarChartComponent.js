import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

const BarChartComponent = ({ data }) => {
  //display data on the bar chart
  const jobsData = data.jobs_per_company || [];
  const candidatesData = data.candidates_per_company || [];

  return (
    <div>
      {jobsData.length > 0 && (
        <BarChart width={500} height={300} data={jobsData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="company" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="jobs_posted" fill="#8884d8" />
        </BarChart>
      )}
      {candidatesData.length > 0 && (
        <BarChart width={500} height={300} data={candidatesData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="company" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="candidates_applied" fill="#82ca9d" />
        </BarChart>
      )}
    </div>
  );
};

export default BarChartComponent;
