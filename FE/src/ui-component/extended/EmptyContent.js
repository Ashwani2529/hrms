/* eslint-disable */
import PropTypes from 'prop-types';
// @mui
import { styled } from '@mui/material/styles';
import { Typography } from '@mui/material';
//

import EmptyImage from 'assets/illustrations/illustration_empty_content.svg';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
    height: '100%',
    display: 'flex',
    textAlign: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: theme.spacing(8, 2)
}));

// ----------------------------------------------------------------------

EmptyContent.propTypes = {
    title: PropTypes.string.isRequired,
    img: PropTypes.string,
    description: PropTypes.string
};

export default function EmptyContent({ title, description, img, ...other }) {
    return (
        <RootStyle {...other}>
            <img disabledEffect visibleByDefault alt="empty content" src={img || EmptyImage} sx={{ height: 240, mb: 3 }} />

            <Typography variant="h4" gutterBottom>
                {title}
            </Typography>

            {description && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {description}
                </Typography>
            )}
        </RootStyle>
    );
}
