import React from 'react';
import './Card.css';

const Card = ({ children, title, className = '', style = {} }) => {
    return (
        <div className={`card ${className}`} style={style}>
            {title && <div className="card-header">{title}</div>}
            <div className="card-body">{children}</div>
        </div>
    );
};

export default Card;
