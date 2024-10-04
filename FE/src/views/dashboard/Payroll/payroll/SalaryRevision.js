/* eslint-disable */
import * as React from 'react';

// material-ui
import {
    CardContent,
    Checkbox,
    Fab,
    Grid,
    Chip,
    IconButton,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    useTheme,
    Box,
    Tabs,
    Tab
} from '@mui/material';

// project imports
import MainCard from './MainCard';
import { useSelector } from 'store';
import Page from 'ui-component/Page';
import { useNavigate } from 'react-router-dom';
import EnhancedTableHead from '../../../payroll/TableHeader';
import { dispatch } from 'store';
import SkeletonLeave from 'ui-component/skeleton/SkeletonLeave';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
// hooks
import useTable, { getComparator } from 'hooks/useTable';
import useDebounce from 'hooks/useDebounce';
// assets
import FilterListIcon from '@mui/icons-material/FilterListTwoTone';
import SearchIcon from '@mui/icons-material/Search';
import TableNoData from 'ui-component/extended/table/TableNoData';
import RoleBasedGuard from 'utils/route-guard/RoleBasedGuard';
import { roles } from 'store/constant';
import useAuth from 'hooks/useAuth';
import PayrollTableRow from '../../../payroll/PayrollTableRow';
import payroll, { PayrollActions } from 'store/slices/payroll';
import { EmployeeActions } from 'store/slices/employee';

// sorting
export function applySortFilter({ tableData, comparator }) {
    const stabilizedThis = tableData?.map((el, index) => [el, index]);

    stabilizedThis?.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });

    tableData = stabilizedThis?.map((el) => el[0]);
    return tableData;
}

function SalaryRevision() {
    const {
        page,
        order,
        orderBy,
        rowsPerPage,
        setPage,
        selected,
        setSelected,
        onSelectRow,
        onSelectAllRows,
        onSort,
        onChangePage,
        onChangeRowsPerPage
    } = useTable();

    const theme = useTheme();
    // const dispatch = useDispatch();
    const navigate = useNavigate();

    const { role } = useAuth();

    const { fetchPayrolls } = PayrollActions;
    const { fetchEmployees } = EmployeeActions;
    const [search, setSearch] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [selectedRow, setSelectedRow] = React.useState();
    const [selectedTab, setSelectedTab] = React.useState('salary-revision');

    //debounced searching
    const debouncedSearchValue = useDebounce(search, 500);

    const [openDialog, setOpenDialog] = React.useState(false);
    const { loading } = useSelector((state) => state.leave);
    const { employee } = useSelector((state) => state.employee);
    const [tableData, setTableData] = React.useState([]);
    React.useEffect(() => {
        dispatch(fetchEmployees({ page: page + 1, limit: rowsPerPage, search, status: '', emp_type: '' }));
    }, [page, rowsPerPage, debouncedSearchValue]);

    React.useEffect(() => {
        setTableData(employee);
    }, [employee]);

    const dataFiltered = applySortFilter({ tableData, comparator: getComparator(order, orderBy) });

    const detailedView = (row) => {
        setOpen(true);
        setSelectedRow(row);
    };

    const handleCloseDialog = () => {
        setSelectedRow();
        setOpenDialog(false);
    };

    const isNotFound = !loading && !dataFiltered?.length;

    return (
        <Page title="Payroll: Salary Revision">
            <Breadcrumbs heading="Salary Revision" links={[{ name: 'payroll', href: `/payroll` }]} />
            <MainCard content={false} title=" ">
            <Box sx={{ width: '100%', bgcolor: 'background.paper', mt: '-20px', pl: '20px' }}>
                    <Tabs
                        value={selectedTab}
                        onChange={(e, value) => setSelectedTab(value)}
                        variant="scrollable"
                        scrollButtons="auto"
                        aria-label="scrollable auto tabs example"
                        TabIndicatorProps={{ style: { backgroundColor: 'black' } }}
                        sx={{
                            '& .MuiTabs-flexContainer': {
                                paddingLeft: 0,
                                marginLeft: 0
                            }
                        }}
                    >
                        <Tab
                            value={'salary-revision'}
                            label={'Salary Revision'}
                            sx={{
                                minWidth: 'auto',
                                paddingLeft: 3,
                                paddingRight: 3
                            }}
                        />
                        <Tab
                            value={'reimbursement'}
                            label={'Reimbursement'}
                            sx={{
                                minWidth: 'auto',
                                paddingLeft: 3,
                                paddingRight: 3
                            }}
                        />
                    </Tabs>
                </Box>
                <CardContent>
                    <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" sx={{ color: '#462F4D' }} />
                                        </InputAdornment>
                                    )
                                }}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search leave by name"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
                            <Tooltip title="Filter">
                                <IconButton size="large">
                                    <FilterListIcon />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                    </Grid>
                </CardContent>

                {/* table */}
                <TableContainer>
                    <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
                        <EnhancedTableHead
                            numSelected={selected?.length}
                            order={order}
                            orderBy={orderBy}
                            setSelected={setSelected}
                            onSelectAllClick={(checked) =>
                                onSelectAllRows(
                                    checked,
                                    tableData?.map((row) => row?.payroll_id)
                                )
                            }
                            selected={selected}
                            onSort={onSort}
                            rowCount={tableData?.length}
                            theme={theme}
                            tabSelected={selectedTab}
                        />
                        <TableBody>
                            {(loading ? [...Array(rowsPerPage)] : dataFiltered)?.map((row, index) =>
                                row ? (
                                    <PayrollTableRow
                                        key={index}
                                        row={row}
                                        selected={selected}
                                        onSelectRow={onSelectRow}
                                        index={index}
                                        detailedView={detailedView}
                                        tabSelected={selectedTab}
                                    />
                                ) : (
                                    !isNotFound && <SkeletonLeave key={index} />
                                )
                            )}
                            <TableNoData isNotFound={isNotFound} />
                        </TableBody>
                    </Table>
                </TableContainer>
            </MainCard>
        </Page>
    );
}

export default SalaryRevision;
