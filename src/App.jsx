import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Login from './components/auth/Login';
import CustomerRegister from './components/auth/CustomerRegister';
import VendorRegister from './components/auth/VendorRegister';
import VendorDashboard from './components/vendor/VendorDashboard';
import CustomerDashboard from './components/customer/CustomerDashboard';
import Navbar from './components/shared/Navbar';

function PrivateRoute({ children, role, ...rest }) {
  const { user } = useApp();
  return (
    <Route
      {...rest}
      render={() => {
        if (!user) return <Redirect to="/login" />;
        if (role && user.type !== role) return <Redirect to="/" />;
        return children;
      }}
    />
  );
}

function HomeRedirect() {
  const { user } = useApp();
  if (!user) return <Redirect to="/login" />;
  if (user.type === 'vendor') return <Redirect to="/vendor" />;
  return <Redirect to="/customer" />;
}

export default function App() {
  const { user } = useApp();

  return (
    <Router>
      {user && <Navbar />}
      <Switch>
        <Route exact path="/login" component={Login} />
        <Route exact path="/register/customer" component={CustomerRegister} />
        <Route exact path="/register/vendor" component={VendorRegister} />
        <PrivateRoute path="/vendor" role="vendor">
          <VendorDashboard />
        </PrivateRoute>
        <PrivateRoute path="/customer" role="customer">
          <CustomerDashboard />
        </PrivateRoute>
        <Route path="/" component={HomeRedirect} />
      </Switch>
    </Router>
  );
}
