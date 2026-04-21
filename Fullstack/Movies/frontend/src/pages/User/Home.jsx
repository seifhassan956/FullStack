import React, { useState, useEffect } from 'react';
import Header from '../../components/Header.jsx';
import Body from '../../components/Body.jsx';

const Home = () => {
  const [activeType, setActiveType] = useState(() => {
    return localStorage.getItem("activeType") || "movie";
  });

  useEffect(() => {
    localStorage.setItem("activeType", activeType);
  }, [activeType]);

  return (
    <>
      <Header activeType={activeType} setActiveType={setActiveType} />
      <Body activeType={activeType} />
    </>
  );
};

export default Home;