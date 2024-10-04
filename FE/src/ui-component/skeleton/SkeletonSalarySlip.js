// @mui
import { Grid, Skeleton, Stack, TableCell, TableRow } from '@mui/material';

// ----------------------------------------------------------------------

export default function SkeletonSalarySlip() {
    return (
        <TableRow>
            <TableCell align="right">
                <Skeleton width={50} />
            </TableCell>
            <TableCell align="right">
                <Skeleton width={100} />
            </TableCell>
            <TableCell align="right">
                <Skeleton width={100} />
            </TableCell>
            <TableCell align="right">
                <Skeleton width={100} />
            </TableCell>
            <TableCell align="right" width={100}>
                <Skeleton />
            </TableCell>
            <TableCell align="right" width={100}>
                <Skeleton />
            </TableCell>
            <TableCell align="right" width={100}>
                <Skeleton />
            </TableCell>
            <TableCell align="right" width={100}>
                <Skeleton />
            </TableCell>
        </TableRow>
    );
}
