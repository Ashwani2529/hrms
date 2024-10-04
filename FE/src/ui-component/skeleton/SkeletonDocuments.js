// @mui
import { Grid, Skeleton, Stack, TableCell, TableRow } from '@mui/material';

// ----------------------------------------------------------------------

export default function SkeletonDocument() {
    return (
        <TableRow>
            <TableCell align="left">
                <Skeleton width={60} />
            </TableCell>
            <TableCell align="left">
                <Skeleton width={240} />
            </TableCell>
            <TableCell align="left">
                <Skeleton width={240} />
            </TableCell>
            <TableCell align="left">
                <Skeleton width={120} />
            </TableCell>
            <TableCell align="left">
                <Skeleton width={120} />
            </TableCell>
            <TableCell align="left">
                <Skeleton width={120} />
            </TableCell>
        </TableRow>
    );
}
