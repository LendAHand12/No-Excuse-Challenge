import React, { useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { shortenWalletAddress } from '@/utils';
import userStatus from '@/constants/userStatus';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Eye, 
  TreePine, 
  ArrowRightLeft, 
  Trash2 
} from 'lucide-react';

const columnHelper = createColumnHelper();

const AdminUsersTable = ({ 
  data, 
  loading, 
  onApprove, 
  onDetail, 
  onTree, 
  onMoveSystem, 
  onDelete, 
  onApprovePayment,
  objectFilter 
}) => {
  const { t } = useTranslation();
  const { userInfo } = useSelector((state) => state.auth);

  const columns = useMemo(
    () => [
      columnHelper.accessor('userId', {
        id: 'username',
        header: () => t('adminUsers.table.username'),
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap">
              <div className="">
                <div className="text-base font-semibold">{row.userId}</div>
                <div className="font-normal text-gray-500">{row._id}</div>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('ageEstimate', {
        id: 'age',
        header: () => {
          if (objectFilter.coin === 'usdt') return t('adminUsers.table.usdt');
          if (objectFilter.coin === 'hewe') return t('adminUsers.table.hewe');
          return t('adminUsers.table.age');
        },
        cell: (info) => {
          const row = info.row.original;
          if (objectFilter.coin === 'usdt') {
            return <p className="px-6 py-4">{row.availableUsdt}</p>;
          }
          if (objectFilter.coin === 'hewe') {
            return <p className="px-6 py-4">{row.availableHewe}</p>;
          }
          if (row.ageEstimate) {
            const ageText = {
              2: '8+',
              3: '13+',
              4: '16+',
              5: '18+',
              6: '21+',
              7: '25+',
              8: '30+',
            }[row.ageEstimate] || '';
            
            return (
              <div className="px-6 py-4">
                <a
                  className={`hover:underline ${
                    row.ageEstimate && row.ageEstimate < 5
                      ? 'text-red-500'
                      : 'text-blue-500'
                  }`}
                  href={`http://3.107.26.68:3002/session-details?path=%2Fenrollment-3d&externalDatabaseRefID=ID_${row._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {ageText}
                </a>
              </div>
            );
          }
          return <p className="px-6 py-4">N/A</p>;
        },
      }),
      columnHelper.accessor('walletAddress', {
        id: 'walletAddress',
        header: () => t('adminUsers.table.walletAddress'),
        cell: (info) => (
          <div className="px-6 py-4">
            {shortenWalletAddress(info.getValue(), 12)}
          </div>
        ),
      }),
      columnHelper.accessor('paymentUUID', {
        id: 'paymentPending',
        header: () => t('adminUsers.table.paymentPending'),
        cell: (info) => {
          const row = info.row.original;
          if (row.paymentUUID.length > 0) {
            return (
              <div className="px-6 py-4">
                <button
                  onClick={() => onApprovePayment(row._id)}
                  className={`${
                    row.paymentProcessed
                      ? 'bg-orange-400'
                      : 'bg-green-500'
                  } py-1 px-3 text-white text-lg max-w-fit rounded-lg`}
                  disabled={!row.paymentProcessed}
                >
                  {row.paymentUUID[row.tier - 1]}
                </button>
              </div>
            );
          }
          return <div className="px-6 py-4"></div>;
        },
      }),
      columnHelper.accessor('status', {
        id: 'status',
        header: () => t('adminUsers.table.status'),
        cell: (info) => {
          const status = info.getValue();
          const statusConfig = userStatus.find((item) => item.status === status);
          return (
            <div className="px-6 py-4">
              <Badge 
                variant="secondary"
                className={`${statusConfig?.color || 'bg-gray-500'} text-white border-0`}
              >
                {t(status)}
              </Badge>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: () => t('adminUsers.table.action'),
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="px-6 py-4">
              <div className="flex gap-4">
                {/* Approve Button */}
                {userInfo?.permissions
                  ?.find((p) => p.page.pageName === 'admin-users-details')
                  ?.actions.includes('approve') &&
                  row.status === 'PENDING' && (
                    <button
                      onClick={() => onApprove(row._id)}
                      className="font-medium text-gray-500 hover:text-green-600 transition-colors"
                      title={t('adminUsers.actions.approve')}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}

                {/* View Details Button */}
                {row.status !== 'DELETED' &&
                  userInfo?.permissions
                    ?.find((p) => p.page.pageName === 'admin-users-details')
                    ?.actions.includes('read') && (
                    <button
                      onClick={() => onDetail(row._id)}
                      className="font-medium text-gray-500 hover:text-blue-600 transition-colors"
                      title={t('adminUsers.actions.view')}
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  )}

                {/* Tree Button */}
                {row.status !== 'DELETED' &&
                  userInfo?.permissions
                    ?.find((p) => p.page.pageName === 'admin-system')
                    ?.actions.includes('read') && (
                    <button
                      onClick={() => onTree(row._id)}
                      className="font-medium text-gray-500 hover:text-green-600 transition-colors"
                      title={t('adminUsers.actions.tree')}
                    >
                      <TreePine className="w-5 h-5" />
                    </button>
                  )}

                {/* Move System Button */}
                {row.status !== 'DELETED' &&
                  userInfo?.permissions
                    ?.find((p) => p.page.pageName === 'admin-move-system')
                    ?.actions.includes('read') && (
                    <button
                      onClick={() => onMoveSystem(row._id)}
                      className="font-medium text-gray-500 hover:text-orange-600 transition-colors"
                      title={t('adminUsers.actions.move')}
                    >
                      <ArrowRightLeft className="w-5 h-5" />
                    </button>
                  )}

                {/* Delete Button */}
                {userInfo?.permissions
                  ?.find((p) => p.page.pageName === 'admin-users-details')
                  ?.actions.includes('delete') &&
                  row.countPay === 0 &&
                  row.status !== 'DELETED' && (
                    <button
                      onClick={() => onDelete(row._id)}
                      className="font-medium text-gray-500 hover:text-red-600 transition-colors"
                      title={t('adminUsers.actions.delete')}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
              </div>
            </div>
          );
        },
      }),
    ],
    [t, objectFilter.coin, userInfo, onApprove, onDetail, onTree, onMoveSystem, onDelete, onApprovePayment]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return null; // Loading is handled by parent component
  }

  if (data.length === 0) {
    return null; // NoContent is handled by parent component
  }

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  scope="col"
                  className="px-6 py-3"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="bg-white border-b hover:bg-gray-50"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsersTable;
