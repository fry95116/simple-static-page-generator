import React, { Component } from 'react';
import { Affix } from 'antd';
import './index.css';

export default class BlogList extends Component{
    
    render(props){
        let items = []
        for(let i = 0; i < 100; ++i) items.push(<li>{i}</li>)
        return (
        <div>
            <Affix offsetTop={0}>
                <div className="navbar">header</div>
            </Affix>
            <ul>
                {items}
            </ul>
        </div>)
    }
}