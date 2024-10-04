import React from 'react';
import { Container, Typography, Button } from '@mui/material';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by ErrorBoundary:', error);
        console.error('Error details:', errorInfo);
    }

    render() {
        const { hasError } = this.state;
        const { children } = this.props;

        if (hasError) {
            return (
                <Container style={{ textAlign: 'center', marginTop: '50px' }}>
                    <Typography variant="h4" color="error" gutterBottom>
                        Oops! Something went wrong.
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                        An unexpected error has occurred. Please try again later.
                    </Typography>
                    <Button variant="contained" color="primary" onClick={() => window.location.reload()} style={{ marginTop: '20px' }}>
                        Reload Page
                    </Button>
                    <Typography variant="body2" color="textSecondary" style={{ marginTop: '20px' }}>
                        If the error persists, please contact our support team at pm@heliverse.com
                    </Typography>
                </Container>
            );
        }

        return children;
    }
}

export default ErrorBoundary;
