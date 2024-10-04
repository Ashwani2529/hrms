import React, { useEffect, useState } from 'react';
import {
    Box,
    TableContainer,
    Table,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
    IconButton,
    Tooltip,
    Modal,
    Typography,
    Divider,
    Card,
    Stack
} from '@mui/material';
import CompanyDetailsTableHead from './CompanyDetailsTableHead';
import moment from 'moment';
import { IconEye } from '@tabler/icons';
import CompanyDetailsForm from './CompanyDetailsForm';
import { Close } from '@mui/icons-material';
import { CompanyActions } from 'store/slices/company';
import { useSelector } from 'react-redux';
import { dispatch } from 'store';
import SkeletonCompanyDetails from 'ui-component/skeleton/SkeletonCompanyDetails';
import SkeletonCompanyDetailsHistory from 'ui-component/skeleton/SkeletonCompanyDetailsHistory';
import EmptyContent from 'ui-component/extended/EmptyContent';

function CompanyDetailsHistory() {
    const [selectedRow, setSelectedRow] = useState({});
    const [openView, setOpenView] = useState(false);

    const { companyDetails, loading, companyHistory } = useSelector((state) => state.company);

    const { fetchCompanyHistory } = CompanyActions;

    const handleModalClose = () => {
        setSelectedRow({});
        setOpenView(false);
    };

    const handleOpenViewModal = (row) => {
        setSelectedRow(row);
        setOpenView(true);
    };

    useEffect(() => {
        if (!companyDetails?.company_id) return;
        dispatch(fetchCompanyHistory(companyDetails?.company_id));
    }, []);

    return (
        <Box sx={{ width: '100%' }}>
            <TableContainer sx={{ width: '100%' }}>
                <Table sx={{ width: '100%' }}>
                    <CompanyDetailsTableHead />
                    <TableBody sx={{ width: '100%' }}>
                        {loading
                            ? [...new Array(5)].map((ele, index) => <SkeletonCompanyDetailsHistory />)
                            : Array.isArray(companyHistory) &&
                              companyHistory?.map((data, index) => (
                                  <TableRow key={data?.from_date}>
                                      <TableCell>{index + 1}.</TableCell>
                                      <TableCell>{moment(data?.from_date).format('ddd MMM DD, YYYY')}</TableCell>
                                      <TableCell>{data?.end_date ? moment(data?.end_date).format('ddd MMM DD, YYYY') : '-'}</TableCell>
                                      <TableCell>{data?.ot_pay_type || '-'}</TableCell>
                                      <TableCell>{data?.standarized_shift_hours || '-'}</TableCell>
                                      <TableCell>{data?.min_half_day_hours || '-'}</TableCell>
                                      <TableCell>{data?.salary_freq || '-'}</TableCell>
                                      <TableCell>
                                          <Tooltip title="View">
                                              <IconButton onClick={() => handleOpenViewModal(data)}>
                                                  <IconEye />
                                              </IconButton>
                                          </Tooltip>
                                      </TableCell>
                                  </TableRow>
                              ))}
                    </TableBody>
                </Table>
                {(!Array.isArray(companyHistory) || companyHistory.length === 0) && <EmptyContent title="No Entries found!" />}
            </TableContainer>

            <Modal open={openView} onClose={handleModalClose}>
                <Card
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        p: 3,
                        minWidth: 300,
                        width: '50%'
                    }}
                >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h3">View Company Details</Typography>
                        <IconButton onClick={handleModalClose}>
                            <Close />
                        </IconButton>
                    </Stack>
                    <Divider my={2} />
                    <Box mt={2}>
                        <CompanyDetailsForm selectedRow={selectedRow} isView />
                    </Box>
                </Card>
            </Modal>
        </Box>
    );
}

export default CompanyDetailsHistory;
