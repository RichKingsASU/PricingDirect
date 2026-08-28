import React from 'react';

interface AuthBootstrapProps {
  children: React.ReactNode;
}

export const AuthBootstrap: React.FC<AuthBootstrapProps> = ({ children }) => {
  return React.createElement(React.Fragment, null, children);
};
