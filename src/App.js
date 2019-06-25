import React from 'react';
import './App.css';
import { HashRouter, Route } from 'react-router-dom';
import BlogList from './pages/BlogList/index';

function App() {
  return (
    <HashRouter>
      <Route path="/" component={BlogList}></Route>
    </HashRouter>
  );
}

export default App;
