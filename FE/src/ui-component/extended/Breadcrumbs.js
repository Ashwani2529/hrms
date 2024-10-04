/* eslint-disable */
import { useTheme } from '@emotion/react'
import { Card, Box, Grid, Typography } from '@mui/material'
import React from 'react'
import { gridSpacing } from 'store/constant';
import MuiBreadcrumbs from '@mui/material/Breadcrumbs';
import { Link } from 'react-router-dom';

// assets
import { IconChevronRight } from '@tabler/icons';
import HomeIcon from '@mui/icons-material/Home';
import HomeTwoToneIcon from '@mui/icons-material/HomeTwoTone';

const linkSX = {
    display: 'flex',
    color: 'grey.900',
    textDecoration: 'none',
    alignContent: 'center',
    alignItems: 'center'
};

const linkSXActive = {
    display: 'flex',
    textDecoration: 'none',
    alignContent: 'center',
    alignItems: 'center',
    color: 'grey.500'
}

function Breadcrumbs({ heading, links }) {
    const theme = useTheme();

    const iconStyle = {
        marginRight: theme.spacing(0.75),
        marginTop: `-${theme.spacing(0.25)}`,
        width: '16px',
        height: '16px',
        color: theme.palette.secondary.main
    };
    return (
        <Card
            sx={{
                marginBottom: theme.spacing(gridSpacing),
                background: theme.palette.background.default
            }}
        >
            <Box sx={{ p: 2 }}>
                <Grid
                    container
                    direction={'row'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                    spacing={1}
                >
                    <Grid item>
                        <Typography variant="h3" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                            {heading}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <MuiBreadcrumbs
                            sx={{ '& .MuiBreadcrumbs-separator': { width: 16, ml: 1.25, mr: 1.25 } }}
                            aria-label="breadcrumb"
                            maxItems={8}
                            separator={<IconChevronRight stroke={1.5} size="16px" />}
                        >
                            <Typography component={Link} to="/" color="inherit" variant="subtitle1" sx={linkSX} aria-label="home">
                                {<HomeIcon sx={{ ...iconStyle, mr: 0 }} />}
                            </Typography>
                            {links?.map((link, index) => {
                                return (
                                    <>
                                        {index === links?.length - 1 ?
                                            <Typography key={index} variant="subtitle1" sx={linkSXActive}>
                                                {link.name}
                                            </Typography>
                                            :
                                            <Typography key={index} component={Link} to={link.href} variant="subtitle1" sx={linkSX}>
                                                {link.name}
                                            </Typography>
                                        }
                                    </>
                                )
                            })}
                        </MuiBreadcrumbs>
                    </Grid>
                </Grid>
            </Box>
        </Card>
    )

}

export default Breadcrumbs