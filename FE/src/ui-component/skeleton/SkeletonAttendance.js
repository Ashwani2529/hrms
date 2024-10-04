// @mui
import { Grid, Skeleton, Stack, TableCell, TableRow } from '@mui/material';

// ----------------------------------------------------------------------

export default function SkeletonAttendance() {
    return (
        <TableRow>
            <TableCell align="left">
                <Skeleton width={60} />
            </TableCell>
            <TableCell align="center">
                <Skeleton width={150} />
            </TableCell>
            <TableCell align="center">
                <Skeleton width={150} />
            </TableCell>
            <TableCell align="center">
                <Skeleton width={150} />
            </TableCell>
            <TableCell align="right" width={150}>
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
