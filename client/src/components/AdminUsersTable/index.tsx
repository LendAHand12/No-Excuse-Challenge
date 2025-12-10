import React, { useMemo, useState } from 'react';
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
import Modal from 'react-modal';
import {
  CheckCircle,
  Eye,
  TreePine,
  ArrowRightLeft,
  Trash2,
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
  objectFilter,
}) => {
  const { t } = useTranslation();
  const { userInfo } = useSelector((state) => state.auth);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

  const columns = useMemo(
    () => [
      columnHelper.accessor('userId', {
        id: 'username',
        header: () => t('adminUsers.table.username'),
        cell: (info) => {
          const row = info.row.original;
          const AvatarCell = () => {
            const [imageError, setImageError] = useState(false);
            const avatarUrl = row.facetecTid
              ? `${import.meta.env.VITE_FACETEC_URL}/api/liveness/image?tid=${
                  row.facetecTid
                }`
              : null;

            const handleAvatarClick = (e) => {
              if (avatarUrl) {
                e.preventDefault();
                setSelectedImageUrl(avatarUrl);
                setSelectedUserId(row.userId);
                setShowImageModal(true);
              }
            };

            const showPlaceholder = !avatarUrl || imageError;

            return (
              <div className="flex items-center gap-3 px-6 py-4 text-gray-900 whitespace-nowrap">
                {showPlaceholder ? (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 text-sm font-medium">
                    {row.userId?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                ) : (
                  <img
                    src={avatarUrl}
                    alt={`${row.userId} avatar`}
                    className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity border-2 border-gray-300"
                    onClick={handleAvatarClick}
                    onError={() => setImageError(true)}
                  />
                )}
                <div className="">
                  <div className="text-base font-semibold">{row.userId}</div>
                  <div className="font-normal text-gray-500">{row._id}</div>
                </div>
              </div>
            );
          };

          return <AvatarCell />;
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
            const ageText =
              {
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
                    row.paymentProcessed ? 'bg-orange-400' : 'bg-green-500'
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
          const statusConfig = userStatus.find(
            (item) => item.status === status,
          );
          return (
            <div className="px-6 py-4">
              <Badge
                variant="secondary"
                className={`${
                  statusConfig?.color || 'bg-gray-500'
                } text-white border-0`}
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
                  ?.find((p) => p.page.path === '/admin/users/:id')
                  ?.actions.includes('update') &&
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
                    ?.find((p) => p.page.path === '/admin/users/:id')
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
                    ?.find((p) => p.page.path === '/admin/system/:id')
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
                    ?.find((p) => p.page.path === '/admin/move-system/:id')
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
                  ?.find((p) => p.page.path === '/admin/users/:id')
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
    [
      t,
      objectFilter.coin,
      userInfo,
      onApprove,
      onDetail,
      onTree,
      onMoveSystem,
      onDelete,
      onApprovePayment,
    ],
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
    <>
      {/* Image Modal */}
      <Modal
        isOpen={showImageModal}
        onRequestClose={() => setShowImageModal(false)}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            padding: 0,
            border: 'none',
            background: 'transparent',
            maxWidth: '90vw',
            maxHeight: '90vh',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 1000,
          },
        }}
      >
        <div className="relative bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] flex flex-col">
          {/* Close button */}
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-2 right-2 z-10 text-gray-400 hover:text-gray-700 bg-white rounded-full p-1 shadow-md"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-800 mb-4 pr-8">
            KYC Image - {selectedUserId}
          </h2>

          {/* Image */}
          <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-100 rounded-lg p-4">
            {selectedImageUrl ? (
              <img
                src={selectedImageUrl}
                alt={`KYC Image - ${selectedUserId}`}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('.error-message')) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className =
                      'error-message text-red-500 text-center';
                    errorDiv.textContent = 'Failed to load image';
                    parent.appendChild(errorDiv);
                  }
                }}
              />
            ) : (
              <div className="text-gray-500 text-center">
                No image available
              </div>
            )}
          </div>
        </div>
      </Modal>

      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} scope="col" className="px-6 py-3">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="bg-white border-b hover:bg-gray-50">
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
    </>
  );
};

export default AdminUsersTable;
