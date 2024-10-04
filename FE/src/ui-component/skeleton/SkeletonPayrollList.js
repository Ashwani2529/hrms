// @mui
import { Grid, Skeleton, Stack, TableCell, TableRow } from '@mui/material';

// ----------------------------------------------------------------------

export default function SkeletonPayrollList() {
    return (
        <TableRow>
            <TableCell align="left">
                <Skeleton width={60} />
            </TableCell>
            <TableCell align="left">
                <Skeleton width={150} />
            </TableCell>
            <TableCell align="left">
                <Skeleton width={150} />
            </TableCell>
            <TableCell align="left">
                <Skeleton width={150} />
            </TableCell>
            <TableCell align="left" width={150}>
                <Skeleton />
            </TableCell>
            <TableCell align="left" width={150}>
                <Skeleton />
            </TableCell>
            <TableCell align="left" width={150}>
                <Skeleton />
            </TableCell>
            <TableCell align="left" width={150}>
                <Skeleton />
            </TableCell>
            <TableCell align="left" width={150}>
                <Skeleton />
            </TableCell>
        </TableRow>
    );
}
