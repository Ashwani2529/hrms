// @mui
import { Grid, Skeleton, Stack, TableCell, TableRow } from '@mui/material';

// ----------------------------------------------------------------------

export default function SkeletonSalaryStructureHistory() {
    return (
        <TableRow>
            <TableCell align="left">
                <Skeleton width={100} />
            </TableCell>
            <TableCell align="center">
                <Skeleton width={100} />
            </TableCell>
            <TableCell align="center">
                <Skeleton width={100} />
            </TableCell>
            <TableCell align="center">
                <Skeleton width={100} />
            </TableCell>
            <TableCell align="center">
                <Skeleton width={100} />
            </TableCell>
            <TableCell align="center">
                <Skeleton width={100} />
            </TableCell>
            <TableCell align="center">
                <Skeleton width={100} />
            </TableCell>
            <TableCell align="center">
                <Skeleton width={100} />
            </TableCell>
            <TableCell align="right">
                <Skeleton />
            </TableCell>
        </TableRow>
    );
}
