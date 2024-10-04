// @mui
import { Grid, Skeleton, Stack, TableCell, TableRow } from '@mui/material';

// ----------------------------------------------------------------------

export default function SkeletonLeave() {
    return (
        <TableRow>
            <TableCell align="left">
                <Skeleton width={60} />
            </TableCell>
            <TableCell align="center">
                <Skeleton width={150} />
            </TableCell>
            <TableCell align="center">
                <Skeleton width={100} />
            </TableCell>
            <TableCell align="center">
                <Skeleton width={100} />
            </TableCell>
            <TableCell align="right" width={100}>
                <Skeleton />
            </TableCell>
            <TableCell align="right">
                <Skeleton />
            </TableCell>
            <TableCell align="right">
                <Skeleton />
            </TableCell>
            <TableCell align="right">
                <Skeleton />
            </TableCell>
            <TableCell align="right">
                <Skeleton />
            </TableCell>
        </TableRow>
    );
}
