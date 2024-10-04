/* eslint-disable */
import { useEffect, useState } from 'react';

// routing
import Routes from 'routes';

// project imports
import Locales from 'ui-component/Locales';
import NavigationScroll from 'layout/NavigationScroll';
import RTLLayout from 'ui-component/RTLLayout';
import Snackbar from 'ui-component/extended/Snackbar';
import Loader from 'ui-component/Loader';

import ThemeCustomization from 'themes';
import { dispatch } from 'store';
import { getMenu } from 'store/slices/menu';

// auth provider
import { JWTProvider as AuthProvider } from 'contexts/JWTContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { HelmetProvider } from 'react-helmet-async';
import ConfirmationModal from 'views/reusable-element/ConfirmationModal';
import PreviewSelectedTemplateModal from 'views/reusable-element/PreviewSelectedTemplateModal';
import ErrorBoundary from 'ErrorBoundary';

// import { FirebaseProvider as AuthProvider } from 'contexts/FirebaseContext';
// import { AWSCognitoProvider as AuthProvider } from 'contexts/AWSCognitoContext';
// import { Auth0Provider as AuthProvider } from 'contexts/Auth0Context';

// ==============================|| APP ||============================== //

const App = () => {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        dispatch(getMenu()).then(() => {
            setLoading(true);
        });
    }, []);

    if (!loading) return <Loader />;

    return (
        // <LocalizationProvider dateAdapter={AdapterDayjs}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <ThemeCustomization>
                <RTLLayout>
                    <Locales>
                        <NavigationScroll>
                            <AuthProvider>
                                <HelmetProvider>
                                    <ErrorBoundary>
                                        <>
                                            <Routes />
                                            <Snackbar />
                                            <ConfirmationModal />
                                            <PreviewSelectedTemplateModal />
                                        </>
                                    </ErrorBoundary>
                                </HelmetProvider>
                            </AuthProvider>
                        </NavigationScroll>
                    </Locales>
                </RTLLayout>
            </ThemeCustomization>
        </LocalizationProvider>
    );
};

export default App;
