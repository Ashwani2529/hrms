/* eslint-disable */
import { Link } from 'react-router-dom';

// material-ui
import { useTheme, styled } from '@mui/material/styles';
import { Grid, Stack, Typography, useMediaQuery, Box } from '@mui/material';

// project imports
import AuthWrapper1 from '../authentication/AuthWrapper1';
import AuthCardWrapper from '../authentication/AuthCardWrapper';
import Logo from 'ui-component/Logo';
import DetailsForm from './DetailsForm';
import BackgroundPattern1 from 'ui-component/cards/BackgroundPattern1';
import AuthSlider from 'ui-component/cards/AuthSlider';

// assets
import AuthErrorCard from 'assets/images/auth/auth-reset-error-card.svg';
import AuthPurpleCard from 'assets/images/auth/auth-reset-purple-card.svg';

// styles
const PurpleWrapper = styled('span')(({ theme }) => ({
    '&:after': {
        content: '""',
        position: 'absolute',
        top: '35%',
        left: '35%',
        width: 400,
        height: 400,
        backgroundImage: `url(${AuthPurpleCard})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        animation: '15s wings ease-in-out infinite',
        [theme.breakpoints.down('xl')]: {
            left: '25%',
            top: '35%'
        }
    },
    '&:before': {
        content: '""',
        position: 'absolute',
        top: '12%',
        left: '25%',
        width: 400,
        height: 270,
        backgroundImage: `url(${AuthErrorCard})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        animation: '15s wings ease-in-out infinite',
        animationDelay: '1s',
        [theme.breakpoints.down('xl')]: {
            top: '10%',
            left: '15%'
        }
    }
}));

// carousel items
const items = [
    {
        title: 'Configurable Elements, East to Setup',
        description: 'Powerful and easy to use multipurpose theme'
    },
    {
        title: 'Configurable Elements, East to Setup',
        description: 'Powerful and easy to use multipurpose theme'
    },
    {
        title: 'Configurable Elements, East to Setup',
        description: 'Powerful and easy to use multipurpose theme'
    }
];

// ============================|| AUTH1 - RESET PASSWORD ||============================ //

const CreatePassword = () => {
    const theme = useTheme();
    const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <AuthWrapper1>
            <Grid container alignItems="center" justifyContent="center" x={{ minHeight: '100vh' }}>
                <Grid item container justifyContent="center" md={6} lg={7} sx={{ my: 3 }}>
                    <Box sx={{ backgroundColor: 'white', padding: '20px', borderRadius: '20px' }}>
                        <Grid container spacing={2} justifyContent="center">
                            <Grid item xs={12}>
                                <Grid
                                    container
                                    direction={matchDownSM ? 'column-reverse' : 'row'}
                                    alignItems={matchDownSM ? 'center' : 'inherit'}
                                    justifyContent={matchDownSM ? 'center' : 'space-between'}
                                >
                                    <Grid item>
                                        <Stack
                                            justifyContent={matchDownSM ? 'center' : 'flex-start'}
                                            textAlign={matchDownSM ? 'center' : 'inherit'}
                                        >
                                            <Typography
                                                color={theme.palette.secondary.main}
                                                gutterBottom
                                                variant={matchDownSM ? 'h3' : 'h2'}
                                            >
                                                Details
                                            </Typography>
                                            <Typography color="textPrimary" gutterBottom variant="h4">
                                                Please fill your personal details.
                                            </Typography>
                                        </Stack>
                                    </Grid>
                                    <Grid item sx={{ mb: { xs: 3, sm: 0 } }}>
                                        <Link to="#" aria-label="theme-logo">
                                            <Logo />
                                        </Link>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={12} sx={{ height: '70vh', overflowY: 'scroll' }}>
                                <DetailsForm />
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
            </Grid>
        </AuthWrapper1>
    );
};

export default CreatePassword;
