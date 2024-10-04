// @mui
import { Grid, Skeleton, Stack, TableCell, TableRow } from '@mui/material';

// ----------------------------------------------------------------------

export default function SkeletonCompanyDetailsHistory() {
    return (
        <TableRow>
            <TableCell align="left">
                <Skeleton width={100} />
            </TableCell>
            <TableCell align="left">
                <Skeleton width={100} />
            </TableCell>
            <TableCell align="left">
                <Skeleton width={100} />
            </TableCell>
            <TableCell align="left">
                <Skeleton width={100} />
            </TableCell>
            <TableCell align="left">
                <Skeleton width={100} />
            </TableCell>
            <TableCell align="left">
                <Skeleton width={100} />
            </TableCell>
            <TableCell align="left">
                <Skeleton width={100} />
            </TableCell>
            <TableCell align="left">
                <Skeleton width={100} />
            </TableCell>
        </TableRow>
    );
}
